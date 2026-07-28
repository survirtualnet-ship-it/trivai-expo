import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Heart, Users, Baby } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { IdealForTag } from '@/lib/placeDetail'

const ICONS: Record<IdealForTag, typeof Heart> = {
  Pareja: Heart,
  Amigos: Users,
  Familia: Baby,
}

type Props = {
  tags: IdealForTag[]
}

export const IdealFor = memo(function IdealFor({ tags }: Props) {
  if (!tags.length) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Ideal para</Text>
      <View style={styles.row}>
        {tags.map(tag => {
          const Icon = ICONS[tag]
          return (
            <View key={tag} style={styles.chip}>
              <Icon size={16} color={T.primary} />
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingVertical: S.xl,
    backgroundColor: T.surface,
    marginTop: S.sm,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    marginBottom: S.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: S.lg,
    paddingVertical: 12,
    borderRadius: R.xl,
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: 'rgba(108, 76, 241, 0.12)',
  },
  chipText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.purpleInk,
  },
})
