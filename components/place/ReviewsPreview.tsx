import { memo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Star, MessageSquare, Flag } from 'lucide-react-native'
import { router } from 'expo-router'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceReview } from '@/lib/queries/placeDetail'
import { reportReview } from '@/lib/legal'

type Props = {
  reviews: PlaceReview[]
  onWriteReview?: () => void
  /** Logged-in user id — required to report */
  userId?: string | null
  onReported?: () => void
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
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const [reportingId, setReportingId] = useState<string | null>(null)
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

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reseñas</Text>
          <Text style={styles.sub}>
            {reviews.length === 0 ? 'Sin reseñas aún' : `${reviews.length} opiniones`}
          </Text>
        </View>
        {onWriteReview && (
          <TouchableOpacity style={styles.writeBtn} onPress={onWriteReview}>
            <MessageSquare size={14} color={T.primary} />
            <Text style={styles.writeText}>Escribir</Text>
          </TouchableOpacity>
        )}
      </View>

      {reviews.length === 0 ? (
        <Text style={styles.empty}>Sé el primero en compartir tu experiencia</Text>
      ) : (
        preview.map(r => {
          const name = r.profile?.full_name ?? r.profile?.username ?? 'Usuario'
          const ini = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          const fecha = new Date(r.created_at).toLocaleDateString('es-BO', {
            day: 'numeric',
            month: 'short',
          })
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
              </View>
            </View>
          )
        })
      )}

      {reviews.length > 3 && !showAll && (
        <TouchableOpacity onPress={() => setShowAll(true)}>
          <Text style={styles.seeAll}>Ver todas ({reviews.length})</Text>
        </TouchableOpacity>
      )}
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
  empty: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
    paddingVertical: S.lg,
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
  seeAll: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
    textAlign: 'center',
    marginTop: S.md,
  },
})
