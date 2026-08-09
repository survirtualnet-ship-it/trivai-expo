import { memo, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Star, X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  visible: boolean
  placeName: string
  submitting?: boolean
  onClose: () => void
  onSubmit: (input: { rating: number; text: string }) => void
}

export const WriteReviewModal = memo(function WriteReviewModal({
  visible,
  placeName,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')

  useEffect(() => {
    if (visible) {
      setRating(5)
      setText('')
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Tu experiencia</Text>
              <Text style={styles.title} numberOfLines={2}>
                {placeName}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar">
              <X size={22} color={T.fg2} />
            </Pressable>
          </View>

          <Text style={styles.label}>¿Cómo lo calificas?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <Pressable
                key={i}
                onPress={() => {
                  void Haptics.selectionAsync()
                  setRating(i)
                }}
                hitSlop={6}
              >
                <Star
                  size={32}
                  color={i <= rating ? T.accent : T.border}
                  fill={i <= rating ? T.accent : 'transparent'}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Cuéntanos cómo fue</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ambiente, comida, tip para otros viajeros…"
            placeholderTextColor={T.fg3}
            multiline
            style={styles.input}
            maxLength={800}
          />

          <Pressable
            style={[styles.submit, submitting && styles.submitDisabled]}
            disabled={!!submitting}
            onPress={() => onSubmit({ rating, text })}
          >
            {submitting ? (
              <ActivityIndicator color={T.surface} />
            ) : (
              <Text style={styles.submitText}>Publicar reseña</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dismiss: { flex: 1 },
  sheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: S.xl,
    gap: S.md,
    paddingBottom: S.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.md,
  },
  eyebrow: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.xl,
    color: T.fg1,
    marginTop: 2,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg2,
    marginTop: S.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: S.sm,
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: R.lg,
    padding: S.md,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
    textAlignVertical: 'top',
    backgroundColor: T.muted,
  },
  submit: {
    marginTop: S.sm,
    backgroundColor: T.primary,
    borderRadius: R.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: T.surface,
  },
})
