import { memo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Star } from 'lucide-react-native'
import { companyTheme as t } from '../theme'
import type { Review } from '../types'

type Props = {
  review: Review
  canReply?: boolean
  onReply?: (text: string) => void
}

export const ReviewItem = memo(function ReviewItem({
  review,
  canReply,
  onReply,
}: Props) {
  const [draft, setDraft] = useState(review.companyReply ?? '')
  const [editing, setEditing] = useState(false)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.user}>{review.userName}</Text>
        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              color={t.star}
              fill={i < review.rating ? t.star : 'transparent'}
            />
          ))}
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>{review.createdAt}</Text>

      {review.companyReply && !editing ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Respuesta del negocio</Text>
          <Text style={styles.replyText}>{review.companyReply}</Text>
        </View>
      ) : null}

      {canReply ? (
        <View style={styles.replyForm}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Responder reseña..."
            placeholderTextColor={t.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={() => {
              if (!draft.trim()) return
              onReply?.(draft.trim())
              setEditing(false)
            }}
            style={styles.replyBtn}
          >
            <Text style={styles.replyBtnText}>Publicar respuesta</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: t.spacing.md,
    gap: t.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  user: {
    color: t.text,
    fontSize: 15,
    fontWeight: '700',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    color: t.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  date: {
    color: t.textMuted,
    fontSize: 11,
  },
  replyBox: {
    backgroundColor: t.accentSoft,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
    marginTop: t.spacing.xs,
  },
  replyLabel: {
    color: t.accent,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  replyText: {
    color: t.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  replyForm: {
    gap: t.spacing.sm,
    marginTop: t.spacing.xs,
  },
  input: {
    backgroundColor: t.surfaceMuted,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.md,
    color: t.text,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  replyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 10,
  },
  replyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
})
