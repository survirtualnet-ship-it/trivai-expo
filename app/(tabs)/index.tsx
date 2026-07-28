import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Compass } from 'lucide-react-native'
import { HomeSection } from '@/components/home/HomeSection'
import { DiscoverHeader } from '@/components/ui/DiscoverHeader'
import { useUser } from '@/hooks/useUser'
import { useLocale } from '@/hooks/useLocale'
import { deferredPush } from '@/lib/deferredNav'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function Home() {
  const { profile, isAuthenticated, signOut } = useUser()
  const { locale, setLocale } = useLocale()
  const cityName = profile?.city ?? 'Santa Cruz de la Sierra'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <DiscoverHeader
          cityName={cityName}
          locale={locale}
          isAuthenticated={isAuthenticated}
          notifCount={0}
          onLocaleChange={setLocale}
          onSignIn={() => deferredPush('/auth')}
          onSignOut={handleSignOut}
          onNotifPress={() => deferredPush('/notificaciones')}
        />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>¿Qué hacemos hoy?</Text>
          <Text style={styles.heroSub}>Recomendaciones para ti en {cityName}</Text>
        </View>

        <HomeSection title="Para ti" type="for_you" />
        <HomeSection title="Tendencias" type="trending" />
        <HomeSection title="Cerca" type="nearby" />

        <TouchableOpacity
          style={styles.discoverLink}
          onPress={() => deferredPush('/discover')}
          activeOpacity={0.9}
        >
          <Compass size={20} color={T.primary} />
          <Text style={styles.discoverLinkText}>Explorar todo en Descubrir</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: S.xxxl },
  hero: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
  },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  heroSub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 4,
  },
  discoverLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    marginHorizontal: S.lg,
    marginTop: S.md,
    paddingVertical: S.lg,
    borderRadius: R.xl,
    backgroundColor: T.surface,
    ...SHADOW.sm,
  },
  discoverLinkText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.primary,
  },
})
