import { useCallback, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProfileHeader } from './components/ProfileHeader'
import { SmartProfile } from './components/SmartProfile'
import { StatusCard } from './components/StatusCard'
import { SectionHeader } from './components/SectionHeader'
import { RecommendationCard } from './components/RecommendationCard'
import { PlanCard } from './components/PlanCard'
import { ActivityItem } from './components/ActivityItem'
import { FavoritesList } from './components/FavoritesList'
import { AchievementBadge } from './components/AchievementBadge'
import { SettingsList } from './components/SettingsList'
import { ProfileSkeleton } from './components/ProfileSkeleton'
import { useProfileStore } from './store/useProfileStore'
import { profileTheme } from './theme'

export function ProfileScreen() {
  const isLoading = useProfileStore(s => s.isLoading)
  const setLoading = useProfileStore(s => s.setLoading)
  const recommendations = useProfileStore(s => s.recommendations)
  const autoPlans = useProfileStore(s => s.autoPlans)
  const activity = useProfileStore(s => s.activity)
  const achievements = useProfileStore(s => s.achievements)
  const generatePlan = useProfileStore(s => s.generatePlan)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [setLoading])

  const handleGeneratePlan = useCallback(
    (planId: string) => generatePlan(planId),
    [generatePlan],
  )

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        <ProfileHeader />
        <SmartProfile />
        <StatusCard />

        <SectionHeader title="Para ti hoy" subtitle="Recomendaciones personalizadas" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalPad}
        >
          {recommendations.map(item => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <SectionHeader title="Auto planes" subtitle="Rutas generadas según tu perfil" />
        {autoPlans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onGenerate={handleGeneratePlan}
          />
        ))}

        <SectionHeader title="Actividad" subtitle="Tu historial reciente" />
        <View style={styles.activityCard}>
          {activity.map((item, index) => (
            <ActivityItem key={item.id} item={item} index={index} />
          ))}
        </View>

        <SectionHeader title="Favoritos y listas" />
        <FavoritesList />

        <SectionHeader title="Logros" subtitle="Desbloquea badges explorando" />
        <View style={styles.achievementsGrid}>
          {achievements.map((item, index) => (
            <AchievementBadge key={item.id} achievement={item} index={index} />
          ))}
        </View>

        <SectionHeader title="Ajustes" />
        <SettingsList />

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
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: profileTheme.spacing.lg,
  },
  footer: {
    height: 96,
  },
})
