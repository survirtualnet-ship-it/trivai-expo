import { useCallback, useMemo } from 'react'
import { FlatList, StyleSheet, type ListRenderItem } from 'react-native'
import { ReviewItem } from '../components/ReviewItem'
import { FLATLIST_PERF } from '../constants/listPerf'
import { companyTheme as t } from '../theme'
import type { Review } from '../types'

type Props = {
  reviews: Review[]
  canReply: boolean
  onReply: (reviewId: string, text: string) => void
}

const keyExtractor = (item: Review) => item.id

export function ReviewsTab({ reviews, canReply, onReply }: Props) {
  const renderItem: ListRenderItem<Review> = useCallback(
    ({ item }) => (
      <ReviewItem
        review={item}
        canReply={canReply && !item.companyReply}
        onReply={text => onReply(item.id, text)}
      />
    ),
    [canReply, onReply],
  )

  const contentStyle = useMemo(
    () => [styles.content, reviews.length === 0 && styles.emptyPad],
    [reviews.length],
  )

  return (
    <FlatList
      data={reviews}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      {...FLATLIST_PERF}
    />
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
  },
  emptyPad: {
    flexGrow: 1,
  },
})
