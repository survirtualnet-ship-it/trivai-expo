import { memo, useMemo } from 'react'
import { Text, StyleSheet, type TextStyle } from 'react-native'
import { T, F } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  text: string
  query: string
  style?: TextStyle
  highlightStyle?: TextStyle
  numberOfLines?: number
}

/** Splits `text` and bold/highlight substrings matching `query` (Spotlight-style). */
export const HighlightedText = memo(function HighlightedText({
  text,
  query,
  style,
  highlightStyle,
  numberOfLines,
}: Props) {
  const parts = useMemo(() => splitHighlight(text, query), [text, query])

  return (
    <Text style={[styles.base, style]} numberOfLines={numberOfLines}>
      {parts.map((part, i) => (
        <Text
          key={`${part.value}-${i}`}
          style={part.hit ? [styles.hit, highlightStyle] : undefined}
        >
          {part.value}
        </Text>
      ))}
    </Text>
  )
})

function splitHighlight(text: string, query: string): { value: string; hit: boolean }[] {
  const q = query.trim()
  if (!q || !text) return [{ value: text, hit: false }]

  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const out: { value: string; hit: boolean }[] = []
  let start = 0

  while (start < text.length) {
    const idx = lower.indexOf(needle, start)
    if (idx === -1) {
      out.push({ value: text.slice(start), hit: false })
      break
    }
    if (idx > start) out.push({ value: text.slice(start, idx), hit: false })
    out.push({ value: text.slice(idx, idx + needle.length), hit: true })
    start = idx + needle.length
  }

  return out.length ? out : [{ value: text, hit: false }]
}

const styles = StyleSheet.create({
  base: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  hit: {
    fontFamily: FONT.semibold,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
})
