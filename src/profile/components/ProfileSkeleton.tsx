import { memo, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { profileTheme } from '../theme'

function Bone({ style }: { style: object }) {
  const opacity = useSharedValue(0.35)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.75, { duration: 900 }), -1, true)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={[styles.bone, style, animatedStyle]} />
}

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.wrap}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Bone style={styles.header} />
          <Bone style={styles.block} />
          <Bone style={styles.blockShort} />
          <Bone style={styles.row} />
          <Bone style={styles.row} />
          <Bone style={styles.block} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: profileTheme.bg,
  },
  wrap: {
    flex: 1,
  },
  scroll: {
    padding: profileTheme.spacing.lg,
    gap: profileTheme.spacing.lg,
  },
  bone: {
    backgroundColor: profileTheme.surfaceElevated,
    borderRadius: profileTheme.radius.md,
  },
  header: {
    height: 220,
    borderRadius: profileTheme.radius.lg,
  },
  block: {
    height: 160,
  },
  blockShort: {
    height: 120,
  },
  row: {
    height: 72,
  },
})
