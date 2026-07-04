import { View, Text, Image, StyleSheet, type ReactNode } from 'react-native'
import { T, F, S } from '@/lib/tokens'

type Props = {
  title?: string
  subtitle?: ReactNode
  left?: ReactNode
  right?: ReactNode
  /** Fondo blanco para pantallas light (ej. Eventos) */
  light?: boolean
}

/** Fecha actual, ej. "Viernes, 4 de julio" */
export function fechaHoy() {
  const f = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })
  return f.charAt(0).toUpperCase() + f.slice(1)
}

/** Ciudad + fecha bajo el título del header */
export function HeaderCityDate() {
  return (
    <Text style={styles.cityDate}>
      <Text style={styles.city}>Santa Cruz de la Sierra</Text>
      {' · '}{fechaHoy()}
    </Text>
  )
}

/** Header estilo mockup: iconos a los lados, logo centrado y título debajo */
export function TrivaiHeader({ title, subtitle, left, right, light }: Props) {
  return (
    <View style={[styles.wrap, light && styles.wrapLight]}>
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
          {title ? <HeaderCityDate /> : null}
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
  wrapLight: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
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
    height: 43,
    width: 151,
  },
  title: {
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    marginTop: 4,
  },
  cityDate: {
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
    marginTop: 2,
  },
  city: {
    color: T.purple,
    fontWeight: F.weight.semibold,
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
