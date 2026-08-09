import { useMemo } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ProfileHeader } from './components/ProfileHeader'
import { SmartProfile } from './components/SmartProfile'
import { StatusCard } from './components/StatusCard'
import { SectionHeader } from './components/SectionHeader'
import { RecommendationCard } from './components/RecommendationCard'
import { ActivityItem, type ProfileActivityRow } from './components/ActivityItem'
import { FavoritesList } from './components/FavoritesList'
import { SettingsList } from './components/SettingsList'
import { MyBusinessSection } from './components/MyBusinessSection'
import { ComingSoonCard } from './components/ComingSoonCard'
import { ProfileEmptyBlock } from './components/ProfileEmptyBlock'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { profileTheme } from './theme'
import { useUser } from '@/hooks/useUser'
import { useFavoritePlaces } from '@/hooks/useFavoritePlaces'
import { useLocationProfile } from '@/hooks/useLocationProfile'
import { usePlaces } from '@/hooks/usePlaces'
import { useRecommendedPlaces } from '@/hooks/useRecommendedPlaces'
import { fetchPersonalFeed } from '@/lib/activityFeed'
import { STALE } from '@/lib/queries/keys'
import type { ProfileRecommendation } from './store/useProfileStore'

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&q=80'

export function ProfileScreen() {
  const { user, profile, isAuthenticated, displayName, avatarUrl, loading: authLoading } =
    useUser()

  const location = useLocationProfile()
  const favorites = useFavoritePlaces()
  const nearby = usePlaces({ limit: 40 })
  const nearbyPlaces = nearby.places ?? []

  const rec = useRecommendedPlaces(nearbyPlaces, {
    limit: 8,
    coords: location.profile
      ? { lat: location.profile.latitude, lng: location.profile.longitude }
      : null,
    enabled: isAuthenticated && nearbyPlaces.length > 0,
  })

  const selfUser = useMemo(
    () => ({
      id: user?.id ?? '',
      name: profile?.full_name?.trim() || displayName || 'Tú',
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(displayName || 'T')}`,
    }),
    [user?.id, profile?.full_name, displayName, avatarUrl],
  )

  const activityQuery = useQuery({
    queryKey: ['activity', 'personal', user?.id ?? 'anon', 'profile'],
    queryFn: () => fetchPersonalFeed(user!.id, selfUser),
    enabled: !!user?.id,
    staleTime: STALE.user,
  })

  const activityRows = useMemo((): ProfileActivityRow[] => {
    return (activityQuery.data ?? []).slice(0, 8).map(a => ({
      id: a.id,
      placeId: a.place.id,
      placeName: a.place.name,
      imageUrl: a.place.imageUrl || PLACEHOLDER_IMG,
      timestamp: a.timestamp,
      type: a.type,
    }))
  }, [activityQuery.data])

  const recommendations = useMemo((): ProfileRecommendation[] => {
    return (rec.places ?? []).slice(0, 6).map((p, i) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      rating: Number(p.rating_avg ?? 0),
      imageUrl: p.photos?.find(u => typeof u === 'string' && u.trim())?.trim() || PLACEHOLDER_IMG,
      highlight: i === 0,
    }))
  }, [rec.places])

  const likedCategories = rec.profile?.likedCategories ?? []
  const signalLabel = likedCategories[0] ?? null
  const savesCount = rec.profile?.favorites?.length ?? favorites.total
  const viewsCount = rec.profile?.viewedPlaces?.length ?? 0

  const zone =
    location.profile?.district?.trim() ||
    location.profile?.region?.trim() ||
    null
  const city = location.profile?.city?.trim() || null

  if (authLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={profileTheme.accent} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        <ProfileHeader signalLabel={isAuthenticated ? signalLabel : null} />
        {isAuthenticated ? <LogoutButton /> : null}

        {isAuthenticated ? (
          <SmartProfile
            categories={likedCategories.slice(0, 6)}
            savesCount={savesCount}
            viewsCount={viewsCount}
            loading={rec.profileLoading}
          />
        ) : null}

        <StatusCard
          zone={zone}
          city={city}
          permissionDenied={location.permission === 'denied'}
        />

        <SectionHeader
          title="Para ti hoy"
          subtitle="Basado en lo que explorás — no en contenido inventado"
        />
        {!isAuthenticated ? (
          <ProfileEmptyBlock
            title="Personalizá tu feed"
            body="Iniciá sesión para ver recomendaciones según tu actividad real."
            ctaLabel="Iniciar sesión"
            onPress={() => router.push('/auth/login')}
          />
        ) : rec.isLoading || nearby.isLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={profileTheme.accent} />
          </View>
        ) : recommendations.length === 0 ? (
          <ProfileEmptyBlock
            title="Aún no hay picks para vos"
            body="Explorá o guardá lugares cerca. Cuando haya señales, aparecen acá."
            ctaLabel="Explorar"
            onPress={() => router.push('/(tabs)/')}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalPad}
          >
            {recommendations.map(item => (
              <RecommendationCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/place/${item.id}`)}
              />
            ))}
          </ScrollView>
        )}

        <SectionHeader title="Auto planes" subtitle="Rutas generadas según tu perfil" />
        <ComingSoonCard
          title="Planes automáticos"
          body="Todavía no generamos rutas. Cuando exista el motor de planes, lo vas a ver acá — sin demos falsas."
        />

        <SectionHeader title="Actividad" subtitle="Tu historial reciente" />
        {!isAuthenticated ? (
          <ProfileEmptyBlock
            title="Tu historial"
            body="Exploraciones, guardados y reseñas aparecen acá cuando iniciás sesión."
            ctaLabel="Iniciar sesión"
            onPress={() => router.push('/auth/login')}
          />
        ) : activityQuery.isLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={profileTheme.accent} />
          </View>
        ) : activityRows.length === 0 ? (
          <ProfileEmptyBlock
            title="Todavía no hay actividad"
            body="Abrí un lugar, guardalo o dejá una reseña. Eso se refleja acá al instante."
            ctaLabel="Ver Actividades"
            onPress={() => router.push('/(tabs)/activity')}
          />
        ) : (
          <View style={styles.activityCard}>
            {activityRows.map((item, index) => (
              <ActivityItem key={item.id} item={item} index={index} />
            ))}
            <Pressable
              style={styles.seeAll}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <Text style={styles.seeAllText}>Ver todo en Actividades →</Text>
            </Pressable>
          </View>
        )}

        <SectionHeader title="Favoritos y listas" />
        <FavoritesList
          groups={favorites.groups}
          total={favorites.total}
          loading={favorites.isLoading}
          authenticated={isAuthenticated}
        />

        <SectionHeader title="Logros" subtitle="Desbloquea badges explorando" />
        <ComingSoonCard
          title="Logros"
          body="No hay sistema de badges todavía. Preferimos dejarlo vacío a inventar progreso."
          delay={40}
        />

        <SectionHeader title="Ajustes" />
        <MyBusinessSection />
        <SettingsList />
        {isAuthenticated ? <LogoutButton /> : null}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: profileTheme.bg,
  },
  scroll: {
    paddingBottom: profileTheme.spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineLoading: {
    paddingVertical: profileTheme.spacing.xxl,
    alignItems: 'center',
  },
  horizontalPad: {
    paddingHorizontal: profileTheme.spacing.lg,
    paddingBottom: profileTheme.spacing.sm,
  },
  activityCard: {
    marginHorizontal: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.lg,
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    overflow: 'hidden',
  },
  seeAll: {
    paddingVertical: profileTheme.spacing.md,
    paddingHorizontal: profileTheme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: profileTheme.border,
  },
  seeAllText: {
    color: profileTheme.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    height: 96,
  },
})
