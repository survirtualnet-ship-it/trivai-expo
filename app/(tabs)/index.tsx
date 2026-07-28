import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeSection } from '@/components/home/HomeSection'
import { HomeSearchBar } from '@/components/home/HomeSearchBar'
import { HomeCategories } from '@/components/home/HomeCategories'
import { useUser } from '@/hooks/useUser'
import { deferredPush } from '@/lib/deferredNav'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

function greetingForHour(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function firstName(fullName?: string | null) {
  const name = fullName?.trim()
  if (!name) return null
  return name.split(/\s+/)[0] ?? null
}

export default function Home() {
  const { profile } = useUser()
  const cityName = profile?.city ?? 'Santa Cruz'
  const name = firstName(profile?.full_name)
  const greeting = greetingForHour()

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {greeting}{name ? `, ${name}` : ''}
          </Text>
          <Text style={styles.subtext}>
            Descubre {cityName} con calma
          </Text>
        </View>

        <HomeSearchBar onPress={() => deferredPush('/buscar')} />

        <HomeSection title="Para ti" type="for_you" />
        <HomeSection title="Tendencias" type="trending" />
        <HomeCategories />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.surface,
  },
  scroll: {
    paddingTop: S.md,
    paddingBottom: S.xxxl + S.lg,
  },
  header: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xl,
    gap: 6,
  },
  greeting: {
    fontFamily: FONT.semibold,
    fontSize: F.size.h1,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.6,
  },
  subtext: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    letterSpacing: -0.1,
  },
})
