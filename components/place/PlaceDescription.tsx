import { memo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const PREVIEW_LEN = 160

type Props = {
  text: string
}

export const PlaceDescription = memo(function PlaceDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return null

  const needsExpand = text.length > PREVIEW_LEN
  const shown = expanded || !needsExpand ? text : `${text.slice(0, PREVIEW_LEN).trim()}…`

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Acerca de</Text>
      <Text style={styles.body}>{shown}</Text>
      {needsExpand && (
        <TouchableOpacity onPress={() => setExpanded(v => !v)} hitSlop={8}>
          <Text style={styles.more}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
    backgroundColor: T.surface,
    marginTop: S.sm,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    marginBottom: S.sm,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg2,
    lineHeight: 22,
  },
  more: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
    marginTop: S.sm,
  },
})
