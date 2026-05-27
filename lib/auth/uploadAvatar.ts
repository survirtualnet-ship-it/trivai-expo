import { supabase } from '@/lib/supabase'

const BUCKET = 'avatars'

export async function uploadAvatarFromUri(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri)
  const blob = await response.blob()
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || `image/${ext}` })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
