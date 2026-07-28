import { useCallback, useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { PlaceHeader } from '@/components/place/PlaceHeader'
import { PlaceInfo } from '@/components/place/PlaceInfo'
import { PlaceTags } from '@/components/place/Tags'
import { ActionBar } from '@/components/place/ActionBar'
import { PlaceDescription } from '@/components/place/PlaceDescription'
import { PlaceExtraInfo } from '@/components/place/PlaceExtraInfo'
import { LocationPreview } from '@/components/place/LocationPreview'
import { SimilarPlaces } from '@/components/place/SimilarPlaces'
import { StickyCTA } from '@/components/place/StickyCTA'
import { PlaceDetailSkeleton } from '@/components/place/PlaceDetailSkeleton'
import { FadeInView } from '@/components/ui/FadeInView'
import {
  usePlaceDetail,
  usePlaceFavorite,
  useSimilarPlaces,
} from '@/hooks/usePlaceDetail'
import { useUser } from '@/hooks/useUser'
import {
  mapsDirectionsUrl,
  whatsappUrl,
  hasContact,
  hasDirections,
} from '@/lib/placeDetail'
import { sharePlace } from '@/lib/sharePlace'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useUser()

  const { place, isLoading, isError, refetch } = usePlaceDetail(id)
  const { isFavorite, toggle, isPending: favPending } = usePlaceFavorite(id)
  const similarQuery = useSimilarPlaces(id, place?.category)

  const openMaps = useCallback(() => {
    if (!place || !hasDirections(place)) return
    Linking.openURL(mapsDirectionsUrl(place.coordinates.lat, place.coordinates.lng))
  }, [place])

  const openWhatsApp = useCallback(() => {
    if (!place?.phone) return
    Linking.openURL(whatsappUrl(place.phone, place.name))
  }, [place])

  const handleShare = useCallback(() => {
    if (!place) return
    sharePlace(
      {
        id: place.id,
        name: place.name,
        description: place.description,
        category: place.category,
        photos: place.images,
        address: place.address,
      },
      user?.id,
    )
  }, [place, user?.id])

  const handleSave = useCallback(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    toggle()
  }, [user, toggle])

  const handleStickyPress = useCallback(() => {
    if (!place) return
    if (hasDirections(place)) openMaps()
    else if (hasContact(place)) openWhatsApp()
  }, [place, openMaps, openWhatsApp])

  const tagList = useMemo(() => place?.tags ?? [], [place?.tags])
  const idealFor = useMemo(() => place?.idealFor ?? [], [place?.idealFor])

  if (isLoading) return <PlaceDetailSkeleton />

  if (isError || !place) {
    return (
      <View style={styles.error} accessibilityRole="alert">
        <Text style={styles.errorTitle}>No pudimos cargar este lugar</Text>
        <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Reintentar">
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Volver">
          <Text style={styles.back}>Volver</Text>
        </Pressable>
      </View>
    )
  }

  const canGo = hasDirections(place)
  const canContact = hasContact(place)
  const showSticky = canGo || canContact
  const stickyMode = canGo ? 'go' as const : 'contact' as const

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={[styles.scroll, !showSticky && styles.scrollNoSticky]}
      >
        <PlaceHeader
          category={place.category}
          images={place.images}
          isFavorite={isFavorite}
          isFeatured={place.isFeatured}
          isSponsored={place.isSponsored}
          onShare={handleShare}
          onToggleFavorite={handleSave}
          favoritePending={favPending}
        />

        <FadeInView>
          <PlaceInfo place={place} />
        </FadeInView>

        <FadeInView delay={30}>
          <PlaceTags tags={tagList} idealFor={idealFor} />
        </FadeInView>

        {place.description ? (
          <FadeInView delay={50}>
            <PlaceDescription text={place.description} />
          </FadeInView>
        ) : null}

        <FadeInView delay={70}>
          <ActionBar
            isFavorite={isFavorite}
            favoritePending={favPending}
            showWhatsApp={canContact}
            showDirections={canGo}
            onDirections={canGo ? openMaps : undefined}
            onWhatsApp={canContact ? openWhatsApp : undefined}
            onSave={handleSave}
          />
        </FadeInView>

        <FadeInView delay={90}>
          <PlaceExtraInfo place={place} />
        </FadeInView>

        {canGo && (
          <FadeInView delay={110}>
            <LocationPreview place={place} onOpenMaps={openMaps} />
          </FadeInView>
        )}

        <FadeInView delay={130}>
          <SimilarPlaces
            places={similarQuery.data ?? []}
            loading={similarQuery.isLoading}
          />
        </FadeInView>
      </ScrollView>

      {showSticky && (
        <StickyCTA mode={stickyMode} onPress={handleStickyPress} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.surface,
  },
  scroll: {
    paddingBottom: 120,
  },
  scrollNoSticky: {
    paddingBottom: 48,
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.md,
    padding: S.xl,
    backgroundColor: T.surface,
  },
  errorTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    color: T.fg1,
    textAlign: 'center',
  },
  retry: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
  },
  back: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})
