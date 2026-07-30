import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Star } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { companyTheme as t } from '../theme'
import { ActionButtons } from './ActionButtons'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { Company } from '../types'

type Props = {
  company: Company
  editMode: boolean
  isOwner: boolean
  onToggleEdit: () => void
  onSave: () => void
}

export const CompanyHeader = memo(function CompanyHeader({
  company,
  editMode,
  isOwner,
  onToggleEdit,
  onSave,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri: company.coverImage }} style={styles.cover} />
      <View style={styles.overlay} />

      <View style={styles.profileRow}>
        <Image source={{ uri: company.profileImage }} style={styles.avatar} />
        <View style={styles.meta}>
          <Text style={styles.name}>{company.name}</Text>
          <Text style={styles.category}>{company.category}</Text>
          <View style={styles.ratingRow}>
            <Star size={14} color={t.star} fill={t.star} />
            <Text style={styles.rating}>{company.rating.toFixed(1)}</Text>
            {company.isDemoCompany ? (
              <View style={styles.demoPill}>
                <Text style={styles.demoPillText}>Demo</Text>
              </View>
            ) : (
              <Text style={styles.ratingHint}>· Perfil verificado</Text>
            )}
          </View>
        </View>
      </View>

      <ActionButtons company={company} />

      {isOwner ? (
        <View style={styles.ownerBar}>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync()
              if (editMode) onSave()
              else onToggleEdit()
            }}
            style={({ pressed }) => [
              styles.editBtn,
              editMode && styles.saveBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.editLabel, editMode && styles.saveLabel]}>
              {editMode ? 'Guardar perfil' : 'Editar perfil'}
            </Text>
          </Pressable>
          {editMode ? (
            <Pressable
              onPress={() => {
                void Haptics.selectionAsync()
                onToggleEdit()
              }}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <LogoutButton />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: t.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    paddingBottom: t.spacing.lg,
  },
  cover: {
    width: '100%',
    height: 160,
    backgroundColor: t.surfaceMuted,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    marginTop: -36,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: t.radius.lg,
    borderWidth: 3,
    borderColor: t.surface,
    backgroundColor: t.surfaceMuted,
  },
  meta: {
    flex: 1,
    paddingBottom: t.spacing.xs,
    gap: 2,
  },
  name: {
    color: t.text,
    fontSize: 20,
    fontWeight: '800',
  },
  category: {
    color: t.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    color: t.text,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingHint: {
    color: t.textMuted,
    fontSize: 12,
  },
  demoPill: {
    backgroundColor: t.accentSoft,
    borderRadius: t.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: t.accent,
  },
  demoPillText: {
    color: t.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  ownerBar: {
    flexDirection: 'row',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    marginTop: t.spacing.md,
  },
  editBtn: {
    flex: 1,
    backgroundColor: t.accentSoft,
    borderRadius: t.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.accent,
  },
  saveBtn: {
    backgroundColor: t.accent,
  },
  editLabel: {
    color: t.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  saveLabel: {
    color: '#fff',
  },
  cancelBtn: {
    paddingHorizontal: t.spacing.lg,
    justifyContent: 'center',
  },
  cancelLabel: {
    color: t.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
})
