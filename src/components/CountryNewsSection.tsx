import { memo } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatNewsAge, type NewsItem } from '@/services/newsService'
import type { Locale } from '../data/mock'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'

type Props = {
  title: string
  subtitle: string | null
  items: NewsItem[]
  locale: Locale
  isLoading: boolean
}

export const CountryNewsSection = memo(function CountryNewsSection({
  title,
  subtitle,
  items,
  locale,
  isLoading,
}: Props) {
  const openLink = (url: string) => {
    void Linking.openURL(url)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.card}>
        {isLoading ? (
          <Text style={styles.meta}>
            {locale === 'EN' ? 'Loading news…' : 'Cargando noticias…'}
          </Text>
        ) : items.length === 0 ? (
          <Text style={styles.meta}>
            {locale === 'EN'
              ? 'No news available for this country.'
              : 'No hay noticias disponibles para este país.'}
          </Text>
        ) : (
          items.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => openLink(item.link)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && styles.pressed,
              ]}
              accessibilityRole="link"
              accessibilityLabel={item.title}
            >
              <View style={styles.copy}>
                <Text style={styles.headline} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {[item.source, formatNewsAge(item.publishedAt, locale)]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
            </Pressable>
          ))
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.section,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 20,
  },
  meta: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
})
