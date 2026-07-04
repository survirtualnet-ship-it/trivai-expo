import { View, Text, Image, StyleSheet, type ReactNode } from 'react-native'
import { T, F, S } from '@/lib/tokens'

type Props = {
  title?: string
  subtitle?: ReactNode
  left?: ReactNode
  right?: ReactNode
}

/** Header estilo mockup: iconos a los lados, logo centrado y título debajo */
export function TrivaiHeader({ title, subtitle, left, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>
        <View style={styles.center}>
          <Image
            source={require('../assets/logo-trivai.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Trivai"
          />
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
      {subtitle ? <View style={styles.subtitleWrap}>{subtitle}</View> : null}
    </View>
  )
}

/** Tagline de marca: Descubre. Conecta. Disfruta. */
export function Tagline() {
  return (
    <Text style={styles.tagline}>
      <Text style={{ color: T.green }}>Descubre. </Text>
      <Text style={{ color: T.orange }}>Conecta. </Text>
      <Text style={{ color: T.purple }}>Disfruta.</Text>
    </Text>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xs,
    backgroundColor: T.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  side: {
    width: 76,
    flexDirection: 'row',
    gap: S.sm,
    paddingTop: 6,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    height: 36,
    width: 126,
  },
  title: {
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    marginTop: 2,
  },
  subtitleWrap: {
    alignItems: 'center',
    marginTop: 2,
  },
  tagline: {
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    textAlign: 'center',
  },
})
