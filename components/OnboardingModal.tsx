import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Search, X } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'
import { setOnboardingDone, setBusinessIntent } from '@/lib/onboardingStorage'
import { searchGooglePlaces, type GooglePlaceResult } from '@/lib/googlePlacesApi'
import { claimBusiness } from '@/lib/places'
import { fetchCompanyByPlaceId } from '@/src/company/utils/fromPlace'
import { useCompanyProfileStore } from '@/src/company/store/useCompanyProfileStore'
import { completeBusinessOnboarding } from '@/lib/appBootstrap'

interface Props {
  visible: boolean
  onDone: () => void
}

export default function OnboardingModal({ visible, onDone }: Props) {
  const [paso, setPaso] = useState<'tipo' | 'negocio'>('tipo')
  const [guardando, setGuardando] = useState(false)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<GooglePlaceResult[]>([])
  const [buscando, setBuscando] = useState(false)
  const [placeData, setPlaceData] = useState<GooglePlaceResult | null>(null)

  useEffect(() => {
    if (paso !== 'negocio' || query.trim().length < 3) {
      setResultados([])
      return
    }
    const t = setTimeout(async () => {
      setBuscando(true)
      const res = await searchGooglePlaces(query)
      setResultados(res)
      setBuscando(false)
    }, 400)
    return () => clearTimeout(t)
  }, [query, paso])

  const cerrar = useCallback(async () => {
    await setOnboardingDone()
    onDone()
  }, [onDone])

  const elegirPersonal = async () => {
    setGuardando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ account_type: 'personal' }).eq('id', user.id)
      }
    } catch {}
    setGuardando(false)
    await cerrar()
  }

  const elegirEmpresa = async () => {
    await setBusinessIntent()
    setPaso('negocio')
  }

  const vincularNegocio = async () => {
    if (!placeData) return
    setGuardando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const claim = await claimBusiness({
          googlePlaceId: placeData.place_id,
          ownerId: user.id,
          name: placeData.name,
          address: placeData.address,
          lat: placeData.lat,
          lng: placeData.lng,
        })

        const company =
          (await fetchCompanyByPlaceId(claim.placeId, user.email)) ?? {
            id: claim.placeId,
            name: placeData.name,
            category: 'Negocio',
            description: '',
            email: user.email ?? 'contacto@negocio.com',
            location: {
              latitude: placeData.lat,
              longitude: placeData.lng,
              address: placeData.address,
            },
            phone: '',
            whatsapp: '',
            website: '',
            coverImage:
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
            profileImage:
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
            rating: 0,
            isDemoCompany: false,
          }

        useCompanyProfileStore.getState().registerCompany(company)
        useCompanyProfileStore.getState().loadCompany(company.id)

        await completeBusinessOnboarding({
          userId: user.id,
          email: user.email,
          companyId: claim.placeId,
          businessName: placeData.name,
        })
        return
      }
    } catch (err) {
      console.warn('[OnboardingModal] claim', err)
    }
    setGuardando(false)
    await cerrar()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.sheetWrap}
        >
          <View style={s.sheet}>
            <TouchableOpacity style={s.closeBtn} onPress={cerrar} hitSlop={12}>
              <X size={18} color={T.fg3} />
            </TouchableOpacity>
            <View style={s.handle} />

            {paso === 'tipo' ? (
              <>
                <Text style={s.emoji}>🎉</Text>
                <Text style={s.title}>¡Bienvenido a Trivai!</Text>
                <Text style={s.subtitle}>¿Cómo usarás la app?</Text>

                <TouchableOpacity style={s.optionCard} onPress={elegirPersonal} disabled={guardando}>
                  <Text style={s.optionEmoji}>👤</Text>
                  <Text style={s.optionTitle}>Soy una persona</Text>
                  <Text style={s.optionSub}>Descubro lugares y eventos cerca de mí</Text>
                  {guardando && <ActivityIndicator color={T.purple} style={{ marginTop: S.sm }} />}
                </TouchableOpacity>

                <TouchableOpacity style={[s.optionCard, s.optionCardBusiness]} onPress={elegirEmpresa}>
                  <Text style={s.optionEmoji}>🏢</Text>
                  <Text style={[s.optionTitle, { color: T.purpleInk }]}>Soy una empresa</Text>
                  <Text style={[s.optionSub, { color: T.purpleInk, opacity: 0.85 }]}>
                    Registro y gestiono mi negocio en Trivai
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.title}>Busca tu negocio</Text>
                <Text style={s.subtitle}>
                  Busca tu negocio en Google Maps para importar los datos automáticamente.
                </Text>

                <View style={s.searchBox}>
                  <Search size={16} color={T.fg3} />
                  <TextInput
                    style={s.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar mi negocio en Google Maps..."
                    placeholderTextColor={T.fg3}
                  />
                </View>

                {buscando && <ActivityIndicator color={T.purple} style={{ marginBottom: S.md }} />}

                <ScrollView style={s.results} keyboardShouldPersistTaps="handled">
                  {resultados.map(r => (
                    <TouchableOpacity
                      key={r.place_id}
                      style={[s.resultRow, placeData?.place_id === r.place_id && s.resultRowActive]}
                      onPress={() => setPlaceData(r)}
                    >
                      <Text style={s.resultName}>{r.name}</Text>
                      <Text style={s.resultAddr} numberOfLines={1}>{r.address}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {placeData && (
                  <View style={s.selectedBanner}>
                    <Text style={s.selectedTitle}>✅ {placeData.name}</Text>
                    <Text style={s.selectedSub} numberOfLines={2}>{placeData.address}</Text>
                  </View>
                )}

                <View style={s.actions}>
                  <TouchableOpacity style={s.backBtn} onPress={() => setPaso('tipo')}>
                    <Text style={s.backBtnText}>Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.continueBtn}
                    onPress={vincularNegocio}
                    disabled={guardando}
                  >
                    {guardando
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={s.continueBtnText}>{placeData ? 'Continuar' : 'Omitir por ahora'}</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,16,30,0.6)',
    justifyContent: 'flex-end',
  },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
    paddingBottom: 48,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: 'center',
    marginBottom: S.lg,
  },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: S.sm },
  title: {
    fontSize: 22,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: S.xl,
  },
  optionCard: {
    padding: S.lg,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: T.border,
    backgroundColor: T.surface,
    marginBottom: S.md,
  },
  optionCardBusiness: {
    borderColor: T.purple,
    backgroundColor: T.purpleSoft,
  },
  optionEmoji: { fontSize: 24, marginBottom: 6 },
  optionTitle: { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  optionSub: { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.bg,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: T.border,
    paddingHorizontal: S.md,
    marginBottom: S.md,
  },
  searchInput: { flex: 1, height: 44, fontSize: F.size.md, color: T.fg1 },
  results: { maxHeight: 160, marginBottom: S.md },
  resultRow: {
    paddingVertical: S.sm,
    paddingHorizontal: S.sm,
    borderRadius: R.sm,
    marginBottom: 4,
  },
  resultRowActive: { backgroundColor: T.purpleSoft },
  resultName: { fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg1 },
  resultAddr: { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  selectedBanner: {
    backgroundColor: T.greenSoft,
    borderRadius: R.md,
    padding: S.md,
    marginBottom: S.lg,
  },
  selectedTitle: { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.greenInk },
  selectedSub: { fontSize: F.size.xs, color: T.greenInk, opacity: 0.85, marginTop: 2 },
  actions: { flexDirection: 'row', gap: S.sm },
  backBtn: {
    flex: 1,
    height: 48,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg2 },
  continueBtn: {
    flex: 2,
    height: 48,
    borderRadius: R.full,
    backgroundColor: T.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: { fontSize: F.size.md, fontWeight: F.weight.bold, color: '#fff' },
})
