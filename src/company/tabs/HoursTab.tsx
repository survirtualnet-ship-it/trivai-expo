import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  applyDayMode,
  DAY_KEYS,
  DAY_LABELS,
  formatDaySummary,
  getDayMode,
  normalizeSchedule,
  type DayKey,
  type DayMode,
} from '@/lib/business/hoursUtils'
import type { BusinessHoursSchedule, DayHours } from '@/lib/business/profileTypes'
import { companyTheme as t } from '../theme'

type Props = {
  hours: BusinessHoursSchedule | null
  canEdit: boolean
  onSave: (hours: BusinessHoursSchedule) => Promise<{ ok: boolean; error?: string }>
}

const MODES: { id: DayMode; label: string }[] = [
  { id: 'open', label: 'Abierto' },
  { id: 'closed', label: 'Cerrado' },
  { id: 'allDay', label: '24h' },
]

export function HoursTab({ hours, canEdit, onSave }: Props) {
  const [schedule, setSchedule] = useState(() => normalizeSchedule(hours))
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setSchedule(normalizeSchedule(hours))
    setDirty(false)
  }, [hours])

  const patchSchedule = useCallback((patch: Partial<BusinessHoursSchedule>) => {
    setSchedule(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  const patchDay = useCallback((key: DayKey, day: DayHours) => {
    setSchedule(prev => ({ ...prev, [key]: day }))
    setDirty(true)
  }, [])

  const setDayMode = useCallback(
    (key: DayKey, mode: DayMode) => {
      patchDay(key, applyDayMode(schedule[key], mode))
    },
    [patchDay, schedule],
  )

  const setSlotTime = useCallback(
    (key: DayKey, field: 'open' | 'close', value: string) => {
      const day = schedule[key]
      const slot = day?.slots?.[0] ?? { open: '9:00 AM', close: '6:00 PM' }
      patchDay(key, { slots: [{ ...slot, [field]: value }] })
    },
    [patchDay, schedule],
  )

  const handleSave = useCallback(async () => {
    if (!canEdit || saving) return
    setSaving(true)
    const result = await onSave(schedule)
    setSaving(false)
    if (result.ok) {
      setDirty(false)
      Alert.alert('Horarios', 'Guardado correctamente.')
      return
    }
    Alert.alert('Horarios', result.error ?? 'No se pudo guardar.')
  }, [canEdit, onSave, saving, schedule])

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.meta}>
        Los horarios son editables en Trivai. Google no los modifica automáticamente.
      </Text>

      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Cierre temporal</Text>
          <Text style={styles.bannerHint}>
            Indica que el negocio está cerrado por ahora (vacaciones, reformas, etc.).
          </Text>
        </View>
        <Switch
          value={schedule.temporarilyClosed ?? false}
          onValueChange={value => patchSchedule({ temporarilyClosed: value })}
          disabled={!canEdit}
          trackColor={{ false: t.border, true: t.accentSoft }}
          thumbColor={schedule.temporarilyClosed ? t.accent : t.surface}
        />
      </View>

      {DAY_KEYS.map(key => {
        const day = schedule[key]
        const mode = getDayMode(day)
        return (
          <View key={key} style={styles.dayCard}>
            <View style={styles.dayHead}>
              <Text style={styles.dayLabel}>{DAY_LABELS[key]}</Text>
              {!canEdit ? (
                <Text style={styles.daySummary}>{formatDaySummary(day)}</Text>
              ) : null}
            </View>

            {canEdit ? (
              <>
                <View style={styles.modeRow}>
                  {MODES.map(item => {
                    const active = mode === item.id
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setDayMode(key, item.id)}
                        style={[styles.modeChip, active && styles.modeChipActive]}
                      >
                        <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                          {item.label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                {mode === 'open' ? (
                  <View style={styles.slotRow}>
                    <View style={styles.slotField}>
                      <Text style={styles.slotLabel}>Abre</Text>
                      <TextInput
                        value={day?.slots?.[0]?.open ?? '9:00 AM'}
                        onChangeText={text => setSlotTime(key, 'open', text)}
                        placeholder="9:00 AM"
                        placeholderTextColor={t.textMuted}
                        style={styles.slotInput}
                      />
                    </View>
                    <View style={styles.slotField}>
                      <Text style={styles.slotLabel}>Cierra</Text>
                      <TextInput
                        value={day?.slots?.[0]?.close ?? '6:00 PM'}
                        onChangeText={text => setSlotTime(key, 'close', text)}
                        placeholder="6:00 PM"
                        placeholderTextColor={t.textMuted}
                        style={styles.slotInput}
                      />
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.readOnly}>{formatDaySummary(day)}</Text>
            )}
          </View>
        )
      })}

      {canEdit ? (
        <Pressable
          style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
          disabled={!dirty || saving}
          onPress={() => void handleSave()}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveLabel}>Guardar horarios</Text>
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
    gap: t.spacing.md,
  },
  meta: {
    color: t.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
  },
  bannerText: { flex: 1, gap: 4 },
  bannerTitle: { color: t.text, fontSize: 15, fontWeight: '700' },
  bannerHint: { color: t.textMuted, fontSize: 13, lineHeight: 18 },
  dayCard: {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    gap: t.spacing.md,
  },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  dayLabel: { color: t.text, fontSize: 15, fontWeight: '700' },
  daySummary: { color: t.textSecondary, fontSize: 13, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: t.spacing.sm },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'center',
    backgroundColor: t.surfaceMuted,
  },
  modeChipActive: {
    backgroundColor: t.accentSoft,
    borderColor: t.accent,
  },
  modeLabel: { color: t.textMuted, fontSize: 12, fontWeight: '700' },
  modeLabelActive: { color: t.accent },
  slotRow: { flexDirection: 'row', gap: t.spacing.md },
  slotField: { flex: 1, gap: t.spacing.xs },
  slotLabel: {
    color: t.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  slotInput: {
    backgroundColor: t.surfaceMuted,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 12,
    color: t.text,
    fontSize: 15,
  },
  readOnly: { color: t.textSecondary, fontSize: 14 },
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
