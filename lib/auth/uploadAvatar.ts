import { supabase } from '@/lib/supabase'

const BUCKET = 'avatars'

function mimeFromExt(ext: string): string {
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

export async function uploadAvatarFromUri(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri)
  if (!response.ok) throw new Error('No se pudo leer la imagen seleccionada.')

  const arrayBuffer = await response.arrayBuffer()
  const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { upsert: true, contentType: mimeFromExt(ext) })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
