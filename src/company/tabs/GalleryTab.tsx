import { ScrollView, StyleSheet, Text, Pressable, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { GalleryGrid } from '../components/GalleryGrid'
import { companyTheme as t } from '../theme'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { canUseBusinessFeature } from '@/lib/business/planFeatures'
import { getGalleryLimit } from '@/lib/business/planLimits'

type Props = {
  images: string[]
  tier: BusinessSubscriptionTier
  canEdit: boolean
  onUpload?: (uri: string) => Promise<void>
}

export function GalleryTab({ images, tier, canEdit, onUpload }: Props) {
  const limit = getGalleryLimit(tier)
  const canUpload = canEdit && canUseBusinessFeature(tier, 'gallery') && images.length < limit

  const handleUpload = async () => {
    if (!canUpload || !onUpload) return
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]?.uri) return
    await onUpload(result.assets[0].uri)
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.meta}>
        {images.length} / {limit} fotos · Plan {tier.toUpperCase()}
      </Text>
      {canUpload ? (
        <Pressable style={styles.uploadBtn} onPress={() => void handleUpload()}>
          <Text style={styles.uploadLabel}>+ Subir foto</Text>
        </Pressable>
      ) : null}
      <GalleryGrid images={images} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
    gap: t.spacing.md,
  },
  meta: {
    color: t.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  uploadBtn: {
    alignSelf: 'flex-start',
    backgroundColor: t.accentSoft,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderRadius: t.radius.full,
  },
  uploadLabel: {
    color: t.accent,
    fontWeight: '700',
    fontSize: 14,
  },
})
