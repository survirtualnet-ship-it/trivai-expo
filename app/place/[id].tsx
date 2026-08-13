import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Text,
  Pressable,
  Alert,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { PlaceHeader } from '@/components/place/PlaceHeader'
import { PlaceInfo } from '@/components/place/PlaceInfo'
import { PlaceTags } from '@/components/place/Tags'
import { ActionBar } from '@/components/place/ActionBar'
import { PlaceDescription } from '@/components/place/PlaceDescription'
import { PlaceExtraInfo } from '@/components/place/PlaceExtraInfo'
import { LocationPreview } from '@/components/place/LocationPreview'
import { SimilarPlaces } from '@/components/place/SimilarPlaces'
import { PlaceLiveSection } from '@/components/place/PlaceLiveSection'
import { ClaimBusinessBanner } from '@/components/place/ClaimBusinessBanner'
import { OwnerBusinessPanel } from '@/components/place/OwnerBusinessPanel'
import { ReviewsPreview } from '@/components/place/ReviewsPreview'
import { WriteReviewModal } from '@/components/place/WriteReviewModal'
import { PlaceLifeBadges } from '@/components/place/PlaceLifeBadges'
import { OwnerPendingReviewsBanner } from '@/components/place/OwnerPendingReviewsBanner'
import { StickyCTA } from '@/components/place/StickyCTA'
import { PlaceDetailSkeleton } from '@/components/place/PlaceDetailSkeleton'
import { FadeInView } from '@/components/ui/FadeInView'
import { useIsBusinessMode } from '@/src/appMode'
import {
  usePlaceDetail,
  usePlaceFavorite,
  usePlaceReviews,
  useSimilarPlaces,
} from '@/hooks/usePlaceDetail'
import { useHybridPlace } from '@/hooks/useHybridPlace'
import { useLocationProfile } from '@/hooks/useLocationProfile'
import { useUser } from '@/hooks/useUser'
import {
  mapsDirectionsUrl,
  whatsappUrl,
  hasContact,
  hasDirections,
} from '@/lib/placeDetail'
import { sharePlace } from '@/lib/sharePlace'
import {
  computePlaceLifeBadges,
  createPlaceReview,
  createReviewResponse,
  unansweredReviewCount,
} from '@/lib/reviews'
import type { PlaceReview } from '@/lib/queries/placeDetail'
import { placeKeys } from '@/lib/queries/keys'
import { logPlaceView } from '@/lib/userActivity'
import { trackPlaceEvent } from '@/lib/analytics/analytics'
import { isPlaceUuid } from '@/lib/analytics/utils'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, displayName } = useUser()
  const { profile } = useLocationProfile()
  const countryCode = profile?.countryCode || ''
  const businessModeActive = useIsBusinessMode()
  const queryClient = useQueryClient()
  const scrollRef = useRef<ScrollView>(null)
  const reviewsY = useRef(0)
  const viewedPlaceRef = useRef<string | null>(null)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null)

  const { place, raw, isLoading, isError, refetch } = usePlaceDetail(id)
  const resolvedPlaceId = raw?.id ?? place?.id
  const googlePlaceId =
    (raw as { google_place_id?: string } | undefined)?.google_place_id ?? null
  const placeCity =
    (raw as { city?: string } | undefined)?.city ?? place?.address ?? null

  const trackForPlace = useCallback(
    (
      eventType: Parameters<typeof trackPlaceEvent>[2],
      metadata?: Record<string, string | number | boolean | null | undefined>,
    ) => {
      if (!resolvedPlaceId || !isPlaceUuid(resolvedPlaceId)) return
      trackPlaceEvent(resolvedPlaceId, googlePlaceId, eventType, {
        userId: user?.id,
        city: placeCity,
        country: countryCode || null,
        metadata,
      })
    },
    [resolvedPlaceId, googlePlaceId, user?.id, placeCity, countryCode],
  )

  // Log explore signal + business analytics view (once per place open)
  useEffect(() => {
    if (!resolvedPlaceId || !isPlaceUuid(resolvedPlaceId)) return
    if (viewedPlaceRef.current === resolvedPlaceId) return
    viewedPlaceRef.current = resolvedPlaceId
    trackForPlace('VIEW_PLACE')
    if (user?.id) logPlaceView(user.id, resolvedPlaceId)
  }, [user?.id, resolvedPlaceId, trackForPlace])

  const hybridQuery = useHybridPlace(resolvedPlaceId)
  const reviewsQuery = usePlaceReviews(resolvedPlaceId)
  const { isFavorite, toggle, isPending: favPending } = usePlaceFavorite(resolvedPlaceId)
  const similarQuery = useSimilarPlaces(resolvedPlaceId, place?.category)

  const reviews = reviewsQuery.data ?? []
  const hybrid = hybridQuery.data
  const pendingCount = unansweredReviewCount(reviews)
  const lifeBadges = useMemo(
    () =>
      computePlaceLifeBadges({
        claimed: hybrid?.claimed ?? false,
        reviews,
        placeCreatedAt: (raw as { created_at?: string } | undefined)?.created_at,
      }),
    [hybrid?.claimed, reviews, raw],
  )

  const scrollToReviews = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(reviewsY.current - 24, 0), animated: true })
  }, [])

  const openWriteReview = useCallback(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setReviewOpen(true)
  }, [user])

  const handlePublishReview = useCallback(
    async ({ rating, text }: { rating: number; text: string }) => {
      if (!user?.id || !resolvedPlaceId) return
      setSubmittingReview(true)
      try {
        const result = await createPlaceReview({
          placeId: resolvedPlaceId,
          userId: user.id,
          rating,
          text,
          authorName: displayName,
        })
        if (!result.ok) {
          Alert.alert('No se pudo publicar', result.error)
          return
        }

        // Immediate UI update — no full reload
        queryClient.setQueryData<PlaceReview[]>(
          placeKeys.reviews(resolvedPlaceId),
          old => [result.review, ...(old ?? [])],
        )
        void queryClient.invalidateQueries({ queryKey: placeKeys.detail(id ?? '') })
        void queryClient.invalidateQueries({
          queryKey: placeKeys.detail(resolvedPlaceId),
        })
        void queryClient.invalidateQueries({ queryKey: ['activity'] })
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        trackForPlace('REVIEW_CREATED', { review_id: result.review.id })
        setReviewOpen(false)
        setTimeout(scrollToReviews, 200)
      } finally {
        setSubmittingReview(false)
      }
    },
    [user?.id, resolvedPlaceId, displayName, queryClient, id, scrollToReviews, trackForPlace],
  )

  const handleReply = useCallback(
    async (reviewId: string, text: string) => {
      if (!user?.id || !resolvedPlaceId) return false
      setReplySubmittingId(reviewId)
      try {
        const result = await createReviewResponse({
          reviewId,
          businessId: resolvedPlaceId,
          ownerId: user.id,
          text,
        })
        if (!result.ok) {
          Alert.alert('No se pudo responder', result.error)
          return false
        }
        queryClient.setQueryData<PlaceReview[]>(
          placeKeys.reviews(resolvedPlaceId),
          old =>
            (old ?? []).map(r =>
              r.id === reviewId ? { ...r, response: result.response } : r,
            ),
        )
        trackForPlace('REVIEW_RESPONSE', { review_id: reviewId })
        return true
      } finally {
        setReplySubmittingId(null)
      }
    },
    [user?.id, resolvedPlaceId, queryClient, trackForPlace],
  )

  const openMaps = useCallback(() => {
    if (!place || !hasDirections(place)) return
    trackForPlace('DIRECTIONS')
    Linking.openURL(mapsDirectionsUrl(place.coordinates.lat, place.coordinates.lng))
  }, [place, trackForPlace])

  const openWhatsApp = useCallback(() => {
    if (!place?.phone) return
    trackForPlace('WHATSAPP_CLICK')
    Linking.openURL(whatsappUrl(place.phone, place.name))
  }, [place, trackForPlace])

  const handleShare = useCallback(() => {
    if (!place) return
    trackForPlace('SHARE')
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
  }, [place, user?.id, trackForPlace])

  const handleSave = useCallback(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!isFavorite) trackForPlace('FAVORITE')
    toggle()
  }, [user, toggle, isFavorite, trackForPlace])

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
  const canOwnerReply = !!(hybrid?.isOwner && businessModeActive && user)

  // Prefer live review count in header when enrichment exists
  const placeForInfo = {
    ...place,
    reviewCount: Math.max(place.reviewCount, reviews.length),
    rating:
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : place.rating,
  }

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={[styles.scroll, !showSticky && styles.scrollNoSticky]}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          // keep scroll position helpers warm
          void e
        }}
        scrollEventThrottle={16}
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
          <PlaceInfo place={placeForInfo} countryCode={countryCode} />
        </FadeInView>

        <PlaceLifeBadges badges={lifeBadges} />

        {hybrid?.isOwner && businessModeActive ? (
          <OwnerPendingReviewsBanner
            count={pendingCount}
            onPress={scrollToReviews}
          />
        ) : null}

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

        <FadeInView delay={80}>
          <PlaceLiveSection
            live={hybrid?.live ?? null}
            claimed={hybrid?.claimed ?? false}
          />
        </FadeInView>

        {hybridQuery.isLoading ? null : hybrid?.isOwner ? (
          <FadeInView delay={85}>
            <OwnerBusinessPanel
              placeId={place.id}
              placeName={place.name}
              description={place.description ?? ''}
              category={place.category}
              phone={place.phone}
              website={place.website}
              address={place.address}
              latitude={place.coordinates?.lat}
              longitude={place.coordinates?.lng}
              businessModeActive={businessModeActive}
              unansweredReviews={pendingCount}
              onRespondReviews={scrollToReviews}
            />
          </FadeInView>
        ) : (
          <FadeInView delay={85}>
            <ClaimBusinessBanner
              placeName={place.name}
              claimed={hybrid?.claimed ?? false}
              isOwner={hybrid?.isOwner ?? false}
              isAuthenticated={!!user}
            />
          </FadeInView>
        )}

        <View
          onLayout={e => {
            reviewsY.current = e.nativeEvent.layout.y
          }}
        >
          <FadeInView delay={90}>
            <ReviewsPreview
              reviews={reviews}
              userId={user?.id}
              onWriteReview={openWriteReview}
              onReported={() => reviewsQuery.refetch()}
              canReply={canOwnerReply}
              onReply={handleReply}
              replySubmittingId={replySubmittingId}
            />
          </FadeInView>
        </View>

        <FadeInView delay={100}>
          <PlaceExtraInfo place={place} />
        </FadeInView>

        {canGo ? (
          <FadeInView delay={110}>
            <LocationPreview place={place} onOpenMaps={openMaps} />
          </FadeInView>
        ) : null}

        <FadeInView delay={130}>
          <SimilarPlaces
            places={similarQuery.data ?? []}
            loading={similarQuery.isLoading}
          />
        </FadeInView>
      </ScrollView>

      {showSticky ? (
        <StickyCTA mode={stickyMode} onPress={handleStickyPress} />
      ) : null}

      <WriteReviewModal
        visible={reviewOpen}
        placeName={place.name}
        submitting={submittingReview}
        onClose={() => setReviewOpen(false)}
        onSubmit={input => void handlePublishReview(input)}
      />
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
