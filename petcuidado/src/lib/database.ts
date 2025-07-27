import { supabase } from './supabase'
import { Pet, Consulta, Vacina, Prescricao, Exame, UserProfile } from './auth'

export async function getPets(userId?: string) {
  let query = supabase
    .from('pets')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Pet[]
}

export async function getPetById(id: string) {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Pet
}

export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single()

  if (error) throw error
  return data as Pet
}

export async function updatePet(id: string, updates: Partial<Pet>) {
  const { data, error } = await supabase
    .from('pets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Pet
}

export async function deletePet(id: string) {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getConsultas(petId?: string, userId?: string) {
  let query = supabase
    .from('consultas')
    .select(`
      *,
      pet:pets(*),
      veterinario:profiles!consultas_veterinario_id_fkey(*),
      tutor:profiles!consultas_tutor_id_fkey(*)
    `)
    .order('data_consulta', { ascending: false })

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  if (userId) {
    query = query.or(`tutor_id.eq.${userId},veterinario_id.eq.${userId}`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Consulta[]
}

export async function createConsulta(consulta: Omit<Consulta, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('consultas')
    .insert(consulta)
    .select()
    .single()

  if (error) throw error
  return data as Consulta
}

export async function getVacinas(petId?: string) {
  let query = supabase
    .from('vacinas')
    .select(`
      *,
      pet:pets(*),
      veterinario:profiles(*)
    `)
    .order('data_aplicacao', { ascending: false })

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Vacina[]
}

export async function createVacina(vacina: Omit<Vacina, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('vacinas')
    .insert(vacina)
    .select()
    .single()

  if (error) throw error
  return data as Vacina
}

export async function getPrescricoes(petId?: string, userId?: string) {
  let query = supabase
    .from('prescricoes')
    .select(`
      *,
      consulta:consultas(*),
      pet:pets(*),
      veterinario:profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  if (userId) {
    query = query.eq('veterinario_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Prescricao[]
}

export async function createPrescricao(prescricao: Omit<Prescricao, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('prescricoes')
    .insert(prescricao)
    .select()
    .single()

  if (error) throw error
  return data as Prescricao
}

export async function getExames(petId?: string, userId?: string) {
  let query = supabase
    .from('exames')
    .select(`
      *,
      consulta:consultas(*),
      pet:pets(*),
      veterinario:profiles(*)
    `)
    .order('data_exame', { ascending: false })

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  if (userId) {
    query = query.eq('veterinario_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Exame[]
}

export async function createExame(exame: Omit<Exame, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('exames')
    .insert(exame)
    .select()
    .single()

  if (error) throw error
  return data as Exame
}

export async function getVeterinarios() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'veterinario')
    .order('name')

  if (error) throw error
  return data as UserProfile[]
}

export async function getDashboardStats(userId: string, userRole: string) {
  const stats = {
    totalPets: 0,
    consultasHoje: 0,
    vacinasPendentes: 0,
    prescricoesAtivas: 0,
  }

  try {
    if (userRole === 'admin') {
      const { count: petsCount } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
      stats.totalPets = petsCount || 0
    } else {
      const { count: petsCount } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      stats.totalPets = petsCount || 0
    }

    const hoje = new Date().toISOString().split('T')[0]
    const { count: consultasCount } = await supabase
      .from('consultas')
      .select('*', { count: 'exact', head: true })
      .gte('data_consulta', hoje)
      .lt('data_consulta', `${hoje}T23:59:59`)
      .eq(userRole === 'admin' ? '' : 'tutor_id', userRole === 'admin' ? '' : userId)

    stats.consultasHoje = consultasCount || 0

    const { count: vacinasCount } = await supabase
      .from('vacinas')
      .select('*', { count: 'exact', head: true })
      .lte('proxima_dose', new Date().toISOString().split('T')[0])
      .not('proxima_dose', 'is', null)

    stats.vacinasPendentes = vacinasCount || 0

    const { count: prescricoesCount } = await supabase
      .from('prescricoes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativa')

    stats.prescricoesAtivas = prescricoesCount || 0
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }

  return stats
}
