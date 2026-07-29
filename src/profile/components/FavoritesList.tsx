import { memo } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'

export const FavoritesList = memo(function FavoritesList() {
  const lists = useProfileStore(s => s.favoriteLists)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {lists.map(list => (
        <Pressable
          key={list.id}
          onPress={() => void Haptics.selectionAsync()}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Image source={{ uri: list.coverUrl }} style={styles.cover} />
          <View style={styles.overlay} />
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>{list.title}</Text>
            <Text style={styles.count}>{list.count} lugares</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: profileTheme.spacing.lg,
    gap: profileTheme.spacing.md,
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
