import { useEffect, useRef, type ReactNode } from 'react'
import { Animated, type StyleProp, type ViewStyle } from 'react-native'

type Props = {
  children: ReactNode
  /** Skip animation (e.g. item already seen). */
  animate?: boolean
  delay?: number
  duration?: number
  style?: StyleProp<ViewStyle>
}

const ENTER_OFFSET = 5

/** Subtle opacity + translate fade-in. Uses native driver for performance. */
export function FadeInView({
  children,
  animate = true,
  delay = 0,
  duration = 260,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current
  const translateY = useRef(new Animated.Value(animate ? ENTER_OFFSET : 0)).current

  useEffect(() => {
    if (!animate) return

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ])

    animation.start()
    return () => animation.stop()
  }, [animate, delay, duration, opacity, translateY])

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  )
}

export function discoverItemEnterDelay(index: number, cap = 200): number {
  return Math.min(index * 40, cap)
}
