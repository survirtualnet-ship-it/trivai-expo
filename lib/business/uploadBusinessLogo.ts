import { supabase } from '@/lib/supabase'

const BUCKET = 'business-logos'

function mimeFromExt(ext: string): string {
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

/** Upload custom business logo (PRO+) — stored in Supabase Storage + trivai_business.custom_logo_url */
export async function uploadBusinessLogoFromUri(
  placeId: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri)
  if (!response.ok) throw new Error('No se pudo leer la imagen seleccionada.')

  const arrayBuffer = await response.arrayBuffer()
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg'
  const path = `${placeId}/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { upsert: true, contentType: mimeFromExt(ext) })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from('trivai_business')
    .update({ custom_logo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('place_id', placeId)

  if (updateError) throw updateError

  return publicUrl
}
