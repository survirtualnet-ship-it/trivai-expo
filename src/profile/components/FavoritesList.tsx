import { memo } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { profileTheme } from '../theme'
import type { FavoriteGroup } from '@/lib/favoritesGrouping'
import { ProfileEmptyBlock } from './ProfileEmptyBlock'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80'

type Props = {
  groups: FavoriteGroup[]
  total: number
  loading?: boolean
  authenticated: boolean
}

export const FavoritesList = memo(function FavoritesList({
  groups,
  total,
  loading,
  authenticated,
}: Props) {
  if (!authenticated) {
    return (
      <ProfileEmptyBlock
        title="Tus favoritos viven acá"
        body="Iniciá sesión para guardar lugares y armar tus listas."
        ctaLabel="Iniciar sesión"
        onPress={() => router.push('/auth/login')}
      />
    )
  }

  if (loading) {
    return (
      <View style={styles.pad}>
        <Text style={styles.muted}>Cargando favoritos…</Text>
      </View>
    )
  }

  if (total === 0) {
    return (
      <ProfileEmptyBlock
        title="Todavía no guardaste nada"
        body="Tocá el corazón en un lugar y aparece acá, agrupado por tipo."
        ctaLabel="Explorar lugares"
        onPress={() => router.push('/(tabs)/')}
      />
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync()
          router.push('/perfil/favoritos')
        }}
        style={({ pressed }) => [styles.card, styles.allCard, pressed && styles.pressed]}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Todos</Text>
          <Text style={styles.count}>{total} lugares</Text>
        </View>
      </Pressable>
      {groups.map(group => {
        const cover =
          group.places.find(p => p.photos?.[0])?.photos?.[0]?.trim() || PLACEHOLDER
        return (
          <Pressable
            key={group.id}
            onPress={() => {
              void Haptics.selectionAsync()
              router.push('/perfil/favoritos')
            }}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Image source={{ uri: cover }} style={styles.cover} />
            <View style={styles.overlay} />
            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={2}>
                {group.title}
              </Text>
              <Text style={styles.count}>{group.places.length} lugares</Text>
            </View>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: profileTheme.spacing.lg,
    gap: profileTheme.spacing.md,
  },
  pad: {
    paddingHorizontal: profileTheme.spacing.lg,
  },
  muted: {
    color: profileTheme.textMuted,
    fontSize: 14,
  },
  card: {
    width: 160,
    height: 200,
    borderRadius: profileTheme.radius.lg,
    overflow: 'hidden',
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
  },
  allCard: {
    backgroundColor: profileTheme.accentSoft,
    borderColor: 'rgba(109,94,247,0.35)',
    justifyContent: 'flex-end',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,26,0.55)',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: profileTheme.spacing.lg,
    gap: profileTheme.spacing.xs,
  },
  title: {
    color: profileTheme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  count: {
    color: profileTheme.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
})
