import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import {
  fetchPlaceAutocomplete,
  fetchPlaceDetails,
  type PlaceAutocompleteResult,
} from '../../lib/googlePlaces'
import { onboardingTheme as t } from '../../lib/theme'
import type { BusinessSearchProps } from '../types'

export function BusinessSearchScreen({ navigation }: BusinessSearchProps) {
  const setBusinessData = useOnboardingStore(s => s.setBusinessData)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceAutocompleteResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchPlaceAutocomplete(query)
        setResults(list)
      } catch {
        setError('Error al buscar. Mostrando resultados de ejemplo.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(
    async (item: PlaceAutocompleteResult) => {
      setSelecting(true)
      setError(null)
      try {
        const details = await fetchPlaceDetails(item.placeId)
        if (!details) {
          setError('No pudimos cargar los detalles del lugar.')
          return
        }
        setBusinessData({
          name: details.name,
          address: details.address,
          placeId: item.placeId,
          lat: details.lat,
          lng: details.lng,
        })
        navigation.navigate('BusinessVerify')
      } catch {
        setError('No pudimos cargar los detalles del lugar.')
      } finally {
        setSelecting(false)
      }
    },
    [navigation, setBusinessData],
  )

  return (
    <OnboardingLayout
      title="Encuentra tu negocio"
      subtitle="Busca en Google Maps y selecciona tu establecimiento."
    >
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nombre del negocio..."
          placeholderTextColor={t.textMuted}
          style={styles.input}
          autoCorrect={false}
        />
        {loading ? <ActivityIndicator color={t.accent} size="small" /> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={item => item.placeId}
        style={styles.list}
        contentContainerStyle={results.length === 0 ? styles.listEmpty : undefined}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>No hay resultados. Prueba otro nombre.</Text>
          ) : (
            <Text style={styles.empty}>Escribe al menos 2 caracteres para buscar.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => void handleSelect(item)}
            disabled={selecting}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Ionicons name="business" size={20} color={t.accent} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>{item.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
          </Pressable>
        )}
      />

      {selecting ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Cargando negocio…</Text>
        </View>
      ) : null}
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: t.text,
    fontSize: t.font.body,
    paddingVertical: 12,
  },
  list: {
    flex: 1,
    marginTop: t.spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: t.border,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: t.text,
    fontSize: t.font.body,
    fontWeight: '600',
  },
  rowSub: {
    color: t.textSecondary,
    fontSize: t.font.caption,
  },
  empty: {
    color: t.textMuted,
    fontSize: t.font.body,
    paddingVertical: t.spacing.xl,
    textAlign: 'center',
  },
  error: {
    color: t.accentSecondary,
    fontSize: t.font.caption,
    marginTop: t.spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
  },
  loadingText: {
    color: t.text,
    fontSize: t.font.body,
  },
})
