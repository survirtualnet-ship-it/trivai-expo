import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { CalendarDays } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'

type DateCardProps = {
  dia: string
  num: number
  mes: string
  active: boolean
  onPress: () => void
}

export function DateCard({ dia, num, mes, active, onPress }: DateCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.dia, active && styles.textActive]}>{dia}</Text>
      <Text style={[styles.num, active && styles.textActive]}>{num}</Text>
      <Text style={[styles.mes, active && styles.textActive]}>{mes}</Text>
    </TouchableOpacity>
  )
}

export function DateCalendarButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.calendarBtn} onPress={onPress} activeOpacity={0.8}>
      <CalendarDays size={22} color={T.purple} strokeWidth={2} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 60,
    paddingVertical: S.md,
    borderRadius: R.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    gap: 2,
  },
  cardActive: {
    backgroundColor: T.green,
    borderColor: T.green,
  },
  dia: {
    fontSize: 11,
    fontWeight: F.weight.semibold,
    color: T.fg3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  num: {
    fontSize: 24,
    fontWeight: F.weight.bold,
    color: T.fg1,
    lineHeight: 28,
  },
  mes: {
    fontSize: 11,
    fontWeight: F.weight.medium,
    color: T.fg3,
  },
  textActive: {
    color: '#FFFFFF',
  },
  calendarBtn: {
    width: 60,
    height: 88,
    borderRadius: R.lg,
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
