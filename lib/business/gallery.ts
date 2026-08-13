import { supabase } from '@/lib/supabase'
import type { GalleryItem } from './profileTypes'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { getGalleryLimit } from './planLimits'

const BUCKET = 'business-gallery'

function mimeFromExt(ext: string): string {
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

type GalleryRow = {
  id: string
  place_id: string
  image_url: string
  sort_order: number
  is_cover: boolean
  media_type: string
  created_at: string
}

function mapGalleryRow(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    placeId: row.place_id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    mediaType: row.media_type === 'video' ? 'video' : 'image',
    createdAt: row.created_at,
  }
}

export async function fetchBusinessGalleryItems(placeId: string): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('business_gallery')
    .select('*')
    .eq('place_id', placeId)
    .order('sort_order', { ascending: true })

  if (error) {
    if (__DEV__) console.warn('[fetchBusinessGalleryItems]', error.message)
    return []
  }
  return (data as GalleryRow[]).map(mapGalleryRow)
}

export async function uploadBusinessGalleryImage(
  placeId: string,
  uri: string,
  tier: BusinessSubscriptionTier,
): Promise<{ ok: true; item: GalleryItem } | { ok: false; error: string }> {
  const items = await fetchBusinessGalleryItems(placeId)
  const limit = getGalleryLimit(tier)
  if (items.length >= limit) {
    return { ok: false, error: `Límite de galería (${limit} fotos) alcanzado para tu plan.` }
  }

  const response = await fetch(uri)
  if (!response.ok) return { ok: false, error: 'No se pudo leer la imagen.' }

  const arrayBuffer = await response.arrayBuffer()
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg'
  const path = `${placeId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { upsert: false, contentType: mimeFromExt(ext) })

  if (uploadError) return { ok: false, error: uploadError.message }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const sortOrder = items.length

  const { data, error } = await supabase
    .from('business_gallery')
    .insert({
      place_id: placeId,
      image_url: urlData.publicUrl,
      sort_order: sortOrder,
      is_cover: items.length === 0,
      media_type: 'image',
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo guardar en galería' }
  }

  return { ok: true, item: mapGalleryRow(data as GalleryRow) }
}

export async function deleteBusinessGalleryItem(
  itemId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('business_gallery').delete().eq('id', itemId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function setGalleryCover(
  placeId: string,
  itemId: string,
): Promise<{ ok: boolean; error?: string }> {
  await supabase
    .from('business_gallery')
    .update({ is_cover: false })
    .eq('place_id', placeId)

  const { error } = await supabase
    .from('business_gallery')
    .update({ is_cover: true })
    .eq('id', itemId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function reorderGalleryItem(
  itemId: string,
  sortOrder: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('business_gallery')
    .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
    .eq('id', itemId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
