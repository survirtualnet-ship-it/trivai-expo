import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { ExplorerPlaceCard } from '@/components/explorer/ExplorerPlaceCard'
import { ExplorerCategoryChips } from '@/components/explorer/CategoryChips'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { ExplorerChipId } from '@/lib/explorerCategories'
import type { ExplorerPlace } from '@/lib/explorerRanking'

type Props = {
  places: ExplorerPlace[]
  selectedId?: string | null
  loading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  chipId: ExplorerChipId
  onChipSelect: (id: ExplorerChipId) => void
  onSelect: (id: string) => void
  onOpenDetail: (id: string) => void
  onEndReached?: () => void
}

export const ExplorerBottomSheetList = memo(function ExplorerBottomSheetList({
  places,
  selectedId,
  loading,
  hasNextPage,
  isFetchingNextPage,
  chipId,
  onChipSelect,
  onSelect,
  onOpenDetail,
  onEndReached,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null)
  const listRef = useRef<{ scrollToIndex: (opts: { index: number; animated?: boolean }) => void } | null>(null)
  const snapPoints = useMemo(() => ['16%', '46%', '90%'], [])

  useEffect(() => {
    if (!selectedId) return
    sheetRef.current?.snapToIndex(1)
    const index = places.findIndex(p => p.id === selectedId)
    if (index >= 0) {
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index, animated: true })
        } catch {
          // FlatList may not have measured yet
        }
      })
    }
  }, [selectedId, places])

  const openPlace = useCallback((id: string) => {
    onSelect(id)
    onOpenDetail(id)
  }, [onSelect, onOpenDetail])

  const renderItem = useCallback(({ item }: { item: ExplorerPlace }) => (
    <ExplorerPlaceCard
      place={item}
      focused={item.id === selectedId}
      onPress={() => openPlace(item.id)}
    />
  ), [selectedId, openPlace])

  const ListHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {loading && places.length === 0
          ? 'Explorando…'
          : places.length === 1
            ? '1 lugar'
            : `${places.length} lugares`}
      </Text>
      <Text style={styles.headerSub}>Desliza para explorar el mapa</Text>
      <View style={styles.chips}>
        <ExplorerCategoryChips selected={chipId} onSelect={onChipSelect} />
      </View>
    </View>
  ), [loading, places.length, chipId, onChipSelect])

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      animateOnMount
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
    >
      {loading && places.length === 0 ? (
        <View style={styles.loading}>
          <ListHeader />
          <ActivityIndicator color={T.fg3} />
        </View>
      ) : (
        <BottomSheetFlatList
          ref={listRef as never}
          data={places}
          keyExtractor={(item: ExplorerPlace) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptySub}>Prueba otra búsqueda o categoría</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={T.fg3} style={styles.footer} />
            ) : hasNextPage ? (
              <Pressable
                onPress={() => onEndReached?.()}
                style={({ pressed }) => [styles.moreBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.moreText}>Cargar más</Text>
              </Pressable>
            ) : (
              <View style={styles.footerSpacer} />
            )
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => { if (hasNextPage) onEndReached?.() }}
          onEndReachedThreshold={0.35}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: T.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  handle: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleIndicator: {
    backgroundColor: T.fg4,
    width: 36,
    height: 5,
    borderRadius: R.full,
  },
  header: {
    paddingBottom: S.md,
  },
  headerTitle: {
    paddingHorizontal: S.lg,
    fontFamily: FONT.semibold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.5,
  },
  headerSub: {
    paddingHorizontal: S.lg,
    marginTop: 2,
    marginBottom: S.md,
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  chips: {
    marginHorizontal: -S.lg,
  },
  listContent: {
    paddingBottom: S.xxxl + S.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
    marginLeft: S.lg + 64 + S.md,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    paddingTop: S.sm,
    gap: S.xl,
  },
  footer: {
    paddingVertical: S.xl,
  },
  footerSpacer: {
    height: S.xl,
  },
  moreBtn: {
    alignItems: 'center',
    paddingVertical: S.lg,
  },
  moreText: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  empty: {
    paddingHorizontal: S.lg,
    paddingVertical: S.xxxl,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  emptySub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})
