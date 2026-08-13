import { supabase } from '@/lib/supabase'
import type { Product } from '@/src/company/types'

export type BusinessProductRow = {
  id: string
  place_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_featured: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function mapRow(row: BusinessProductRow): Product {
  return {
    id: row.id,
    companyId: row.place_id,
    name: row.name,
    price: Number(row.price),
    image: row.image_url ?? '',
    description: row.description ?? '',
    category: row.category ?? '',
    isFeatured: row.is_featured,
  }
}

export async function fetchBusinessProducts(placeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('business_products')
    .select('*')
    .eq('place_id', placeId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    if (__DEV__) console.warn('[fetchBusinessProducts]', error.message)
    return []
  }

  return (data as BusinessProductRow[]).map(mapRow)
}

export async function createBusinessProduct(
  placeId: string,
  input: Omit<Product, 'id' | 'companyId'>,
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('business_products')
    .insert({
      place_id: placeId,
      name: input.name,
      description: input.description || null,
      price: input.price,
      image_url: input.image || null,
      category: input.category || null,
      is_featured: input.isFeatured,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear el producto' }
  }
  return { ok: true, product: mapRow(data as BusinessProductRow) }
}

export async function updateBusinessProduct(
  productId: string,
  patch: Partial<Omit<Product, 'id' | 'companyId'>>,
): Promise<{ ok: boolean; error?: string }> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.name !== undefined) update.name = patch.name
  if (patch.description !== undefined) update.description = patch.description
  if (patch.price !== undefined) update.price = patch.price
  if (patch.image !== undefined) update.image_url = patch.image
  if (patch.category !== undefined) update.category = patch.category
  if (patch.isFeatured !== undefined) update.is_featured = patch.isFeatured

  const { error } = await supabase
    .from('business_products')
    .update(update)
    .eq('id', productId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function deleteBusinessProduct(
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('business_products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function fetchBusinessGallery(placeId: string): Promise<string[]> {
  const items = await import('./gallery').then(m => m.fetchBusinessGalleryItems(placeId))
  return items.map(i => i.imageUrl)
}

export async function addBusinessGalleryImage(
  placeId: string,
  imageUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('business_gallery').insert({
    place_id: placeId,
    image_url: imageUrl,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
