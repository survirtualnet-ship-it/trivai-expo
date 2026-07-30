import { memo } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Lock } from 'lucide-react-native'
import { companyTheme as t } from '../theme'

type Props = {
  label: string
  value: string
  onChangeText?: (text: string) => void
  editable?: boolean
  locked?: boolean
  multiline?: boolean
  keyboardType?: 'default' | 'phone-pad' | 'url' | 'email-address'
}

export const EditableField = memo(function EditableField({
  label,
  value,
  onChangeText,
  editable = true,
  locked = false,
  multiline = false,
  keyboardType = 'default',
}: Props) {
  const canEdit = editable && !locked && onChangeText

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {locked ? <Lock size={12} color={t.textMuted} /> : null}
      </View>
      {canEdit ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholderTextColor={t.textMuted}
          style={[styles.input, multiline && styles.multiline]}
        />
      ) : (
        <Text style={[styles.value, locked && styles.locked]}>{value || '—'}</Text>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    gap: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: t.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 12,
    color: t.text,
    fontSize: 15,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  value: {
    color: t.text,
    fontSize: 15,
    lineHeight: 22,
  },
  locked: {
    color: t.textSecondary,
    backgroundColor: t.surfaceMuted,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    overflow: 'hidden',
  },
})
