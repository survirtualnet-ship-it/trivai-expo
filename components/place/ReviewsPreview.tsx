import { memo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Pressable,
} from 'react-native'
import { Star, MessageSquare, Flag, Building2 } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceReview } from '@/lib/queries/placeDetail'
import { reportReview } from '@/lib/legal'

type Props = {
  reviews: PlaceReview[]
  onWriteReview?: () => void
  userId?: string | null
  onReported?: () => void
  /** Owner in business mode can reply inline */
  canReply?: boolean
  onReply?: (reviewId: string, text: string) => Promise<boolean>
  replySubmittingId?: string | null
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          color={i <= rating ? T.accent : T.border}
          fill={i <= rating ? T.accent : 'transparent'}
        />
      ))}
    </View>
  )
}

export const ReviewsPreview = memo(function ReviewsPreview({
  reviews,
  onWriteReview,
  userId,
  onReported,
  canReply,
  onReply,
  replySubmittingId,
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const preview = showAll ? reviews : reviews.slice(0, 3)

  const handleReport = (reviewId: string) => {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    Alert.alert(
      'Reportar contenido',
      '¿Este contenido viola las normas de la comunidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: async () => {
            setReportingId(reviewId)
            const result = await reportReview(reviewId, userId)
            setReportingId(null)
            if (!result.ok) {
              Alert.alert('No se pudo reportar', result.error ?? 'Intenta de nuevo')
              return
            }
            Alert.alert(
              result.hidden ? 'Contenido oculto' : 'Gracias',
              result.hidden
                ? 'Este contenido recibió suficientes reportes y se ocultó automáticamente.'
                : 'Tu reporte fue registrado. Revisaremos el contenido de forma automática.',
            )
            onReported?.()
          },
        },
      ],
    )
  }

  const submitReply = async (reviewId: string) => {
    if (!onReply) return
    const text = (replyDrafts[reviewId] ?? '').trim()
    if (!text) return
    const ok = await onReply(reviewId, text)
    if (ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }))
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Actividad reciente</Text>
          <Text style={styles.sub}>
            {reviews.length === 0
              ? 'Sé parte del primer momento de este lugar'
              : `${reviews.length} ${reviews.length === 1 ? 'reseña' : 'reseñas'} · más recientes primero`}
          </Text>
        </View>
        {onWriteReview ? (
          <TouchableOpacity style={styles.writeBtn} onPress={onWriteReview}>
            <MessageSquare size={14} color={T.primary} />
            <Text style={styles.writeText}>Escribir</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>
            Sé el primero en compartir tu experiencia
          </Text>
          <Text style={styles.emptyHint}>
            Una sola reseña ya enciende el perfil de este lugar en Trivai.
          </Text>
          {onWriteReview ? (
            <Pressable style={styles.emptyCta} onPress={onWriteReview}>
              <Text style={styles.emptyCtaText}>Escribir reseña</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        preview.map(r => {
          const name = r.profile?.full_name ?? r.profile?.username ?? 'Usuario'
          const ini = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
          const fecha = new Date(r.created_at).toLocaleDateString('es', {
            day: 'numeric',
            month: 'short',
          })
          const showReplyForm = canReply && !r.response

          return (
            <View key={r.id} style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.ini}>{ini}</Text>
              </View>
              <View style={styles.body}>
                <View style={styles.top}>
                  <Text style={styles.name}>{name.split(' ')[0]}</Text>
                  <View style={styles.topRight}>
                    <Text style={styles.date}>{fecha}</Text>
                    <TouchableOpacity
                      onPress={() => handleReport(r.id)}
                      hitSlop={8}
                      accessibilityLabel="Reportar reseña"
                      disabled={reportingId === r.id}
                    >
                      {reportingId === r.id ? (
                        <ActivityIndicator size="small" color={T.fg4} />
                      ) : (
                        <Flag size={14} color={T.fg4} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <ReviewStars rating={r.rating} />
                {r.text ? <Text style={styles.text}>{r.text}</Text> : null}

                {r.response ? (
                  <View style={styles.replyBox}>
                    <View style={styles.replyHead}>
                      <Building2 size={14} color={T.primary} />
                      <Text style={styles.replyLabel}>Respuesta del negocio</Text>
                      <Text style={styles.replyDate}>
                        {new Date(r.response.created_at).toLocaleDateString('es', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.replyText}>{r.response.text}</Text>
                  </View>
                ) : null}

                {showReplyForm ? (
                  <View style={styles.replyForm}>
                    <TextInput
                      value={replyDrafts[r.id] ?? ''}
                      onChangeText={v =>
                        setReplyDrafts(prev => ({ ...prev, [r.id]: v }))
                      }
                      placeholder="Responde a tu visitante…"
                      placeholderTextColor={T.fg3}
                      style={styles.replyInput}
                      multiline
                    />
                    <Pressable
                      style={styles.replyBtn}
                      disabled={replySubmittingId === r.id}
                      onPress={() => void submitReply(r.id)}
                    >
                      {replySubmittingId === r.id ? (
                        <ActivityIndicator color={T.surface} size="small" />
                      ) : (
                        <Text style={styles.replyBtnText}>Publicar respuesta</Text>
                      )}
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          )
        })
      )}

      {reviews.length > 3 && !showAll ? (
        <TouchableOpacity onPress={() => setShowAll(true)}>
          <Text style={styles.seeAll}>Ver todas ({reviews.length})</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginTop: S.sm,
    padding: S.lg,
    backgroundColor: T.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: S.md,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 2,
    maxWidth: 240,
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.purpleSoft,
    paddingHorizontal: S.md,
    paddingVertical: 8,
    borderRadius: R.full,
  },
  writeText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
  },
  emptyBox: {
    paddingVertical: S.lg,
    gap: S.sm,
    alignItems: 'center',
  },
  empty: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.fg1,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: S.md,
  },
  emptyCta: {
    marginTop: S.sm,
    backgroundColor: T.primary,
    paddingHorizontal: S.xl,
    paddingVertical: 12,
    borderRadius: R.full,
  },
  emptyCtaText: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: T.surface,
  },
  card: {
    flexDirection: 'row',
    gap: S.md,
    paddingVertical: S.md,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ini: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.primary,
  },
  body: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.fg1,
  },
  date: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  text: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg2,
    marginTop: 6,
    lineHeight: 18,
  },
  replyBox: {
    marginTop: S.md,
    padding: S.md,
    borderRadius: R.md,
    backgroundColor: T.muted,
    borderLeftWidth: 3,
    borderLeftColor: T.primary,
    gap: 6,
  },
  replyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyLabel: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
  },
  replyDate: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg4,
  },
  replyText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
    lineHeight: 18,
  },
  replyForm: {
    marginTop: S.md,
    gap: S.sm,
  },
  replyInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: R.md,
    padding: S.md,
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
    textAlignVertical: 'top',
    backgroundColor: T.muted,
  },
  replyBtn: {
    alignSelf: 'flex-end',
    backgroundColor: T.primary,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
    minWidth: 140,
    alignItems: 'center',
  },
  replyBtnText: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.surface,
  },
  seeAll: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
    textAlign: 'center',
    marginTop: S.md,
  },
})
