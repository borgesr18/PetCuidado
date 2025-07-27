import { createSupabaseClient } from './supabase'

export type UserRole = 'admin' | 'tutor' | 'veterinario'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: 'cao' | 'gato'
  breed?: string
  birth_date?: string
  weight?: number
  color?: string
  microchip?: string
  photo_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Consulta {
  id: string
  pet_id: string
  veterinario_id: string
  tutor_id: string
  data_consulta: string
  motivo: string
  sintomas?: string
  diagnostico?: string
  tratamento?: string
  observacoes?: string
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
  created_at: string
  updated_at: string
  pet?: Pet
  veterinario?: UserProfile
  tutor?: UserProfile
}

export interface Vacina {
  id: string
  pet_id: string
  nome_vacina: string
  data_aplicacao: string
  proxima_dose?: string
  veterinario_id?: string
  lote?: string
  fabricante?: string
  observacoes?: string
  created_at: string
  updated_at: string
  pet?: Pet
  veterinario?: UserProfile
}

export interface Prescricao {
  id: string
  consulta_id: string
  pet_id: string
  veterinario_id: string
  medicamento: string
  dosagem: string
  frequencia: string
  duracao: string
  instrucoes?: string
  data_inicio: string
  data_fim?: string
  status: 'ativa' | 'concluida' | 'suspensa'
  created_at: string
  updated_at: string
  consulta?: Consulta
  pet?: Pet
  veterinario?: UserProfile
}

export interface Exame {
  id: string
  consulta_id?: string
  pet_id: string
  veterinario_id: string
  tipo_exame: string
  data_exame: string
  resultado?: string
  arquivo_url?: string
  observacoes?: string
  status: 'solicitado' | 'em_andamento' | 'concluido'
  created_at: string
  updated_at: string
  consulta?: Consulta
  pet?: Pet
  veterinario?: UserProfile
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
