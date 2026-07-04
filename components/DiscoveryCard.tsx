import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { CatCover, CategoryPill } from '@/components/CatCover'
import { T, F, S, R } from '@/lib/tokens'

type Props = {
  category: string
  title: string
  subtitle?: string
  badge?: ReactNode
  photoUri?: string | null
  onPress: () => void
}

export function DiscoveryCard({ category, title, subtitle, badge, photoUri, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.bannerWrap}>
        <CatCover category={category} variant="banner" photoUri={photoUri} />
        <View style={styles.pillPos}>
          <CategoryPill category={category} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        {badge ? <View style={styles.badgeRow}>{badge}</View> : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerWrap: { position: 'relative' },
  pillPos:    { position: 'absolute', left: 10, bottom: 10 },
  body:       { padding: S.md, gap: 4 },
  title:      { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, lineHeight: 20 },
  subtitle:   { fontSize: F.size.sm, color: T.fg3 },
  badgeRow:   { marginTop: 6 },
})
