import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import { EditableField } from '../components/EditableField'
import type { SocialLinks } from '@/lib/business/profileTypes'
import { companyTheme as t } from '../theme'

type Props = {
  social: SocialLinks
  canEdit: boolean
  onSave: (social: SocialLinks) => Promise<{ ok: boolean; error?: string }>
}

const FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: '@tu_negocio o URL' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/tu-negocio' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@tu_negocio' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@canal' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/company/...' },
  { key: 'x', label: 'X (Twitter)', placeholder: '@tu_negocio' },
]

function emptySocial(): SocialLinks {
  return {
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
    x: '',
  }
}

function normalizeSocial(raw: SocialLinks | undefined): SocialLinks {
  const base = emptySocial()
  if (!raw) return base
  for (const field of FIELDS) {
    base[field.key] = raw[field.key] ?? ''
  }
  return base
}

function trimSocial(input: SocialLinks): SocialLinks {
  const out: SocialLinks = {}
  for (const field of FIELDS) {
    const value = input[field.key]?.trim()
    out[field.key] = value ? value : null
  }
  return out
}

export function SocialTab({ social, canEdit, onSave }: Props) {
  const [draft, setDraft] = useState(() => normalizeSocial(social))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setDraft(normalizeSocial(social))
    setDirty(false)
  }, [social])

  const updateField = useCallback((key: keyof SocialLinks, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!canEdit || saving) return
    setSaving(true)
    const result = await onSave(trimSocial(draft))
    setSaving(false)
    if (result.ok) {
      setDirty(false)
      Alert.alert('Redes sociales', 'Guardado correctamente.')
      return
    }
    Alert.alert('Redes sociales', result.error ?? 'No se pudo guardar.')
  }, [canEdit, draft, onSave, saving])

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.meta}>
        Agrega tus perfiles para que los turistas te encuentren en otras plataformas.
      </Text>

      {FIELDS.map(field => (
        <EditableField
          key={field.key}
          label={field.label}
          value={draft[field.key] ?? ''}
          editable={canEdit}
          keyboardType="url"
          onChangeText={canEdit ? text => updateField(field.key, text) : undefined}
        />
      ))}

      {canEdit ? (
        <Pressable
          style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
          disabled={!dirty || saving}
          onPress={() => void handleSave()}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveLabel}>Guardar redes</Text>
          )}
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
  },
  meta: {
    color: t.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: t.spacing.md,
  },
  saveBtn: {
    marginTop: t.spacing.sm,
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
