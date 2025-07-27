import { createSupabaseClient } from './supabase'

export type UserRole = 'admin' | 'tutor' | 'veterinario'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  created_at: string
}

export async function getCurrentUser() {
  const supabase = createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as UserProfile | null
}

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = createSupabaseClient()
  return await supabase.auth.signOut()
}

export async function signUp(email: string, password: string, userData: { name: string, role: UserRole }) {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  return { data, error }
}
