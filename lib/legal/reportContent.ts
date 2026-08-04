import { supabase } from '@/lib/supabase'
import { REPORT_HIDE_THRESHOLD } from './version'

export type ReportReviewResult = {
  ok: boolean
  hidden: boolean
  reportsCount: number
  error?: string
}

/**
 * Report UGC via security-definer RPC (bypasses author-only UPDATE RLS).
 * Auto-hides when reports exceed threshold — no human queue.
 */
export async function reportReview(
  reviewId: string,
  reporterId: string,
): Promise<ReportReviewResult> {
  if (!reviewId || !reporterId) {
    return { ok: false, hidden: false, reportsCount: 0, error: 'Datos incompletos' }
  }

  const { data, error } = await supabase.rpc('report_review', {
    p_review_id: reviewId,
  })

  if (error) {
    // Fallback if RPC not migrated yet — best-effort direct update
    return reportReviewDirect(reviewId, reporterId)
  }

  const result = data as {
    ok?: boolean
    hidden?: boolean
    reportsCount?: number
    error?: string
  } | null

  if (!result?.ok) {
    const msg =
      result?.error === 'cannot_report_own'
        ? 'No puedes reportar tu propio contenido'
        : result?.error === 'not_found'
          ? 'Reseña no encontrada'
          : result?.error ?? 'No se pudo reportar'
    return {
      ok: false,
      hidden: false,
      reportsCount: 0,
      error: msg,
    }
  }

  return {
    ok: true,
    hidden: !!result.hidden,
    reportsCount: result.reportsCount ?? 0,
  }
}

async function reportReviewDirect(
  reviewId: string,
  reporterId: string,
): Promise<ReportReviewResult> {
  const { data: existing, error: fetchErr } = await supabase
    .from('reviews')
    .select('id, reports_count, is_hidden, user_id')
    .eq('id', reviewId)
    .maybeSingle()

  if (fetchErr || !existing) {
    return {
      ok: false,
      hidden: false,
      reportsCount: 0,
      error: fetchErr?.message ?? 'Reseña no encontrada',
    }
  }

  if (existing.user_id === reporterId) {
    return {
      ok: false,
      hidden: !!existing.is_hidden,
      reportsCount: existing.reports_count ?? 0,
      error: 'No puedes reportar tu propio contenido',
    }
  }

  const nextCount = (existing.reports_count ?? 0) + 1
  const hide = nextCount > REPORT_HIDE_THRESHOLD

  const { error: updateErr } = await supabase
    .from('reviews')
    .update({
      reported: true,
      reports_count: nextCount,
      is_hidden: hide || !!existing.is_hidden,
    })
    .eq('id', reviewId)

  if (updateErr) {
    return {
      ok: false,
      hidden: false,
      reportsCount: existing.reports_count ?? 0,
      error:
        'Ejecuta supabase/legal-mvp.sql (función report_review) para habilitar reportes',
    }
  }

  return { ok: true, hidden: hide, reportsCount: nextCount }
}
