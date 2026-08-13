import { supabase } from '@/lib/supabase'
import type { BusinessMenu, MenuItem, MenuSection } from './profileTypes'

export async function fetchBusinessMenu(placeId: string): Promise<BusinessMenu | null> {
  const { data: menu, error } = await supabase
    .from('business_menu')
    .select('id, place_id, title')
    .eq('place_id', placeId)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !menu) {
    if (error && __DEV__) console.warn('[fetchBusinessMenu]', error.message)
    return null
  }

  const { data: sections } = await supabase
    .from('business_menu_sections')
    .select('id, menu_id, name, sort_order')
    .eq('menu_id', menu.id)
    .order('sort_order')

  const sectionRows = sections ?? []
  const sectionIds = sectionRows.map(s => s.id)

  let itemRows: Array<{
    id: string
    section_id: string
    name: string
    description: string | null
    price: number
    currency: string
    image_url: string | null
    sort_order: number
    is_available: boolean
  }> = []

  if (sectionIds.length > 0) {
    const { data: items } = await supabase
      .from('business_menu_items')
      .select('*')
      .in('section_id', sectionIds)
      .eq('is_available', true)
      .order('sort_order')
    itemRows = items ?? []
  }

  const mappedSections: MenuSection[] = sectionRows.map(sec => ({
    id: sec.id,
    menuId: sec.menu_id,
    name: sec.name,
    sortOrder: sec.sort_order,
    items: itemRows
      .filter(i => i.section_id === sec.id)
      .map(
        (i): MenuItem => ({
          id: i.id,
          sectionId: i.section_id,
          name: i.name,
          description: i.description,
          price: Number(i.price),
          currency: i.currency,
          imageUrl: i.image_url,
          sortOrder: i.sort_order,
          isAvailable: i.is_available,
        }),
      ),
  }))

  return {
    id: menu.id,
    placeId: menu.place_id,
    title: menu.title,
    sections: mappedSections,
  }
}

export async function countMenuItems(placeId: string): Promise<number> {
  const menu = await fetchBusinessMenu(placeId)
  if (!menu) return 0
  return menu.sections.reduce((sum, s) => sum + s.items.length, 0)
}

export async function ensureBusinessMenu(
  placeId: string,
  title = 'Menú',
): Promise<{ ok: true; menuId: string } | { ok: false; error: string }> {
  const existing = await fetchBusinessMenu(placeId)
  if (existing) return { ok: true, menuId: existing.id }

  const { data, error } = await supabase
    .from('business_menu')
    .insert({ place_id: placeId, title })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear el menú' }
  }
  return { ok: true, menuId: data.id }
}
