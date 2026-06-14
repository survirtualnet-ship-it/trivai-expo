import { supabase } from './supabase'

export const XP = {
  review:    20,
  asistir:   10,
  favorito:   5,
  evento:    30,
  lugar:     25,
  amigo:     15,
} as const

export async function grantXP(userId: string, amount: number) {
  const { data } = await supabase
    .from('profiles')
    .select('xp_points')
    .eq('id', userId)
    .single()
  const current = (data as any)?.xp_points ?? 0
  await supabase
    .from('profiles')
    .update({ xp_points: current + amount })
    .eq('id', userId)
}
