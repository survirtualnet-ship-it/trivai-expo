import { memo, useCallback, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Building2, BarChart3, Pencil, ExternalLink, MessageCircle } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { updatePlaceFromCompany } from '@/src/company/utils/fromPlace'
import type { Company } from '@/src/company/types'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  placeId: string
  placeName: string
  description: string
  category: string
  phone?: string | null
  website?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  businessModeActive: boolean
  unansweredReviews?: number
  onRespondReviews?: () => void
}

/**
 * Inline owner tools on place detail — no isolated dashboard required.
 */
export const OwnerBusinessPanel = memo(function OwnerBusinessPanel({
  placeId,
  placeName,
  description,
  category,
  phone,
  website,
  address,
  latitude,
  longitude,
  businessModeActive,
  unansweredReviews = 0,
  onRespondReviews,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(description)
  const [saving, setSaving] = useState(false)

  const openAdvanced = useCallback(() => {
    router.push(`/empresa/${placeId}`)
  }, [placeId])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const company: Company = {
        id: placeId,
        name: placeName,
        category: category || 'Negocio',
        description: draft.trim(),
        email: '',
        location: {
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
          address: address ?? '',
        },
        phone: phone ?? '',
        whatsapp: phone ?? '',
        website: website ?? '',
        coverImage: '',
        profileImage: '',
        rating: 0,
        isDemoCompany: false,
      }
      const result = await updatePlaceFromCompany(company)
      if (!result.ok) {
        Alert.alert('No se pudo guardar', result.error ?? 'Intenta de nuevo')
        return
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }, [
    placeId,
    placeName,
    category,
    draft,
    phone,
    website,
    address,
    latitude,
    longitude,
  ])

  return (
    <View style={styles.wrap}>
      <View style={styles.badges}>
        <View style={styles.badge}>
          <Building2 size={14} color={T.primary} />
          <Text style={styles.badgeText}>Tu negocio</Text>
        </View>
        {businessModeActive ? (
          <View style={[styles.badge, styles.badgeActive]}>
            <Text style={styles.badgeActiveText}>Modo empresa activo</Text>
          </View>
        ) : null}
      </View>

      {!businessModeActive ? (
        <>
          <Text style={styles.title}>Este es tu negocio</Text>
          <Text style={styles.sub}>
            Activa “Mi negocio” en el toggle para editar info y ver herramientas
            sin salir de la app.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Gestionar en Trivai</Text>
          <Text style={styles.sub}>
            Edita tu información aquí. El panel avanzado queda para métricas y
            configuración profunda.
          </Text>
        </>
      )}

      {businessModeActive && editing ? (
        <View style={styles.editBox}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            style={styles.input}
            placeholder="Describe tu negocio…"
            placeholderTextColor={T.fg3}
          />
          <View style={styles.editActions}>
            <Pressable
              onPress={() => {
                setDraft(description)
                setEditing(false)
              }}
              style={styles.ghostBtn}
            >
              <Text style={styles.ghostLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleSave()}
              style={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={T.surface} />
              ) : (
                <Text style={styles.primaryLabel}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {businessModeActive && !editing ? (
        <Pressable
          onPress={() => {
            setDraft(description)
            setEditing(true)
          }}
          style={styles.actionRow}
        >
          <Pencil size={18} color={T.primary} />
          <Text style={styles.actionLabel}>Editar descripción</Text>
        </Pressable>
      ) : null}

      {businessModeActive ? (
        <Pressable
          onPress={() => {
            if (onRespondReviews) onRespondReviews()
            else {
              Alert.alert(
                'Responder reseñas',
                'Desplázate a la sección de actividad reciente para responder.',
              )
            }
          }}
          style={styles.actionRow}
        >
          <MessageCircle size={18} color={T.primary} />
          <Text style={styles.actionLabel}>
            {unansweredReviews > 0
              ? `Responder reseñas (${unansweredReviews})`
              : 'Responder reseñas'}
          </Text>
        </Pressable>
      ) : null}

      {businessModeActive ? (
        <Pressable onPress={openAdvanced} style={styles.actionRow}>
          <BarChart3 size={18} color={T.primary} />
          <Text style={styles.actionLabel}>Ver métricas y panel avanzado</Text>
          <ExternalLink size={16} color={T.fg3} />
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.lg,
    padding: S.lg,
    backgroundColor: T.purpleSoft,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.primary,
    gap: S.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: T.surface,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: T.primary,
  },
  badgeActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  badgeText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
  },
  badgeActiveText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.surface,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg2,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.surface,
    borderRadius: R.md,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
  },
  actionLabel: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg1,
  },
  editBox: { gap: S.sm },
  input: {
    minHeight: 96,
    backgroundColor: T.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: T.border,
    padding: S.md,
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: S.sm,
  },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: S.lg,
  },
  ghostLabel: {
    fontFamily: FONT.semibold,
    color: T.fg2,
  },
  primaryBtn: {
    backgroundColor: T.primary,
    paddingVertical: 10,
    paddingHorizontal: S.lg,
    borderRadius: R.full,
    minWidth: 96,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: FONT.bold,
    color: T.surface,
  },
})
