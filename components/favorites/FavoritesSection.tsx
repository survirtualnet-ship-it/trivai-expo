import { memo } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Section } from '@/components/ui/Section'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { deferredPush } from '@/lib/deferredNav'
import { S } from '@/lib/tokens'
import type { FavoriteGroup } from '@/lib/favoritesGrouping'

const CARD_W = Dimensions.get('window').width - S.lg * 2

type Props = {
  group: FavoriteGroup
}

export const FavoritesSection = memo(function FavoritesSection({ group }: Props) {
  return (
    <Section
      title={`${group.emoji} ${group.title}`}
      subtitle={`${group.places.length} guardados`}
      size="md"
      style={styles.wrap}
      contentStyle={styles.list}
    >
      {group.places.map(place => (
        <PlaceCard
          key={place.id}
          place={place}
          variant="vertical"
          width={CARD_W}
          showShare={false}
          onPress={() => deferredPush(`/lugares/${place.id}`)}
        />
      ))}
    </Section>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginBottom: S.xl,
  },
  list: {
    gap: S.md,
    paddingHorizontal: S.lg,
  },
})
