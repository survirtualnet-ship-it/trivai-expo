import { memo, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const PREVIEW_LEN = 180

type Props = {
  text: string
}

export const PlaceDescription = memo(function PlaceDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!text?.trim()) return null

  const needsExpand = text.length > PREVIEW_LEN
  const shown = expanded || !needsExpand ? text : `${text.slice(0, PREVIEW_LEN).trim()}…`

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Acerca de</Text>
      <Text style={styles.body}>{shown}</Text>
      {needsExpand && (
        <Pressable onPress={() => setExpanded(v => !v)} hitSlop={8}>
          <Text style={styles.more}>{expanded ? 'Ver menos' : 'Más'}</Text>
        </Pressable>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xxl,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
    marginBottom: S.md,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg2,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  more: {
    fontFamily: FONT.medium,
    fontSize: F.size.md,
    color: T.fg3,
    marginTop: S.sm,
  },
})
