import { memo, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Star, MapPin, Sparkles, ChevronRight } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'
import { firstPhoto } from '@/lib/discoverCardUtils'
import type { ExplorerPlace } from '@/lib/explorerRanking'

type Props = {
  places: ExplorerPlace[]
  selectedId?: string | null
  loading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onSelect: (id: string) => void
  onOpenDetail: (id: string) => void
  onEndReached?: () => void
}

const ListRow = memo(function ListRow({
  place,
  focused,
  onSelect,
  onOpenDetail,
}: {
  place: ExplorerPlace
  focused?: boolean
  onSelect: (id: string) => void
  onOpenDetail: (id: string) => void
}) {
  const photo = firstPhoto(place.photos)
  const minutes = place._dist != null ? distToMinutes(place._dist) : null

  return (
    <TouchableOpacity
      style={[styles.row, focused && styles.rowFocused]}
      onPress={() => onSelect(place.id)}
      activeOpacity={0.92}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.thumb} />
      ) : (
        <CatCover category={place.category} variant="thumb" style={styles.thumb} />
      )}
      <View style={styles.rowBody}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{place.name}</Text>
          <Text style={styles.price}>{place.priceTier}</Text>
        </View>
        <View style={styles.metaRow}>
          {(place.rating_avg ?? 0) > 0 && (
            <View style={styles.rating}>
              <Star size={11} color={T.accent} fill={T.accent} />
              <Text style={styles.meta}>{place.rating_avg?.toFixed(1)}</Text>
            </View>
          )}
          <Text style={styles.cat}>{getCatLabel(place.category)}</Text>
          {minutes != null && (
            <View style={styles.dist}>
              <MapPin size={10} color={T.fg3} />
              <Text style={styles.meta}>{minutes} min</Text>
            </View>
          )}
        </View>
        <View style={styles.whyRow}>
          <Sparkles size={11} color={T.primary} />
          <Text style={styles.why} numberOfLines={2}>{place.whyRecommended}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.chevron} onPress={() => onOpenDetail(place.id)}>
        <ChevronRight size={20} color={T.fg3} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
})

export const ExplorerBottomSheetList = memo(function ExplorerBottomSheetList({
  places,
  selectedId,
  loading,
  hasNextPage,
  isFetchingNextPage,
  onSelect,
  onOpenDetail,
  onEndReached,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['20%', '48%', '88%'], [])

  const renderItem = useCallback(({ item }: { item: ExplorerPlace }) => (
    <ListRow
      place={item}
      focused={item.id === selectedId}
      onSelect={onSelect}
      onOpenDetail={onOpenDetail}
    />
  ), [selectedId, onSelect, onOpenDetail])

  const ListHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {loading ? 'Explorando…' : `${places.length} lugares cerca`}
      </Text>
      <Text style={styles.headerSub}>Personalizado para ti</Text>
    </View>
  ), [loading, places.length])

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
    >
      {loading && places.length === 0 ? (
        <View style={styles.loading}>
          <ListHeader />
          <ActivityIndicator color={T.primary} />
        </View>
      ) : (
        <BottomSheetFlatList
          data={places}
          keyExtractor={(item: ExplorerPlace) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={
            isFetchingNextPage
              ? () => <ActivityIndicator color={T.primary} style={styles.footer} />
              : null
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => { if (hasNextPage) onEndReached?.() }}
          onEndReachedThreshold={0.35}
        />
      )}
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: T.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    ...SHADOW.lg,
  },
  handleIndicator: {
    backgroundColor: T.border2,
    width: 40,
  },
  header: {
    paddingHorizontal: S.lg,
    paddingBottom: S.md,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  headerSub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: S.lg,
    paddingBottom: S.xxxl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    paddingTop: S.lg,
    gap: S.lg,
  },
  footer: {
    paddingVertical: S.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.bg,
    borderRadius: R.xl,
    padding: S.md,
    marginBottom: S.md,
    ...SHADOW.sm,
  },
  rowFocused: {
    borderWidth: 2,
    borderColor: T.primary,
    backgroundColor: T.purpleSoft,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: T.fg1,
  },
  price: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    color: T.fg2,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
  },
  dist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  why: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.purpleInk,
    lineHeight: 15,
  },
  chevron: {
    padding: 4,
  },
})
