import { useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { PlaceHeader } from '@/components/place/PlaceHeader'
import { PlaceInfo } from '@/components/place/PlaceInfo'
import { ActionBar } from '@/components/place/ActionBar'
import { PlaceDescription } from '@/components/place/PlaceDescription'
import { IdealFor } from '@/components/place/IdealFor'
import { PlaceExtraInfo } from '@/components/place/PlaceExtraInfo'
import { StickyCTA } from '@/components/place/StickyCTA'
import { PlaceDetailSkeleton } from '@/components/place/PlaceDetailSkeleton'
import { FadeInView } from '@/components/ui/FadeInView'
import {
  usePlaceDetail,
  usePlaceFavorite,
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

  const openMaps = useCallback(() => {
    if (!place) return
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

  if (isLoading) return <PlaceDetailSkeleton />

  if (isError || !place) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>No pudimos cargar este lugar</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retry}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const stickyMode = hasDirections(place) ? 'go' as const : 'contact' as const

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <PlaceHeader
          name={place.name}
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

        <ActionBar
          isFavorite={isFavorite}
          favoritePending={favPending}
          showWhatsApp={!!place.phone}
          onDirections={openMaps}
          onWhatsApp={place.phone ? openWhatsApp : undefined}
          onSave={handleSave}
        />

        <FadeInView delay={40}>
          <IdealFor tags={place.idealFor} />
        </FadeInView>

        {place.description ? (
          <FadeInView delay={60}>
            <PlaceDescription text={place.description} />
          </FadeInView>
        ) : null}

        <FadeInView delay={80}>
          <PlaceExtraInfo place={place} />
        </FadeInView>
      </ScrollView>

      <StickyCTA mode={stickyMode} onPress={handleStickyPress} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: 120 },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.md,
    padding: S.xl,
  },
  errorTitle: {
    fontFamily: FONT.bold,
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
