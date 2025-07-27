import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.enum(['cao', 'gato']),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  weight: z.number().positive().optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  notes: z.string().optional(),
})

export const consultaSchema = z.object({
  pet_id: z.string().min(1, 'Pet é obrigatório'),
  veterinario_id: z.string().min(1, 'Veterinário é obrigatório'),
  data_consulta: z.string().min(1, 'Data da consulta é obrigatória'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
  sintomas: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamento: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada']).default('agendada'),
})

export const vacinaSchema = z.object({
  pet_id: z.string().min(1, 'Pet é obrigatório'),
  nome_vacina: z.string().min(1, 'Nome da vacina é obrigatório'),
  data_aplicacao: z.string().min(1, 'Data de aplicação é obrigatória'),
  proxima_dose: z.string().optional(),
  veterinario_id: z.string().optional(),
  lote: z.string().optional(),
  fabricante: z.string().optional(),
  observacoes: z.string().optional(),
})

export const prescricaoSchema = z.object({
  consulta_id: z.string().min(1, 'Consulta é obrigatória'),
  pet_id: z.string().min(1, 'Pet é obrigatório'),
  medicamento: z.string().min(1, 'Medicamento é obrigatório'),
  dosagem: z.string().min(1, 'Dosagem é obrigatória'),
  frequencia: z.string().min(1, 'Frequência é obrigatória'),
  duracao: z.string().min(1, 'Duração é obrigatória'),
  instrucoes: z.string().optional(),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().optional(),
  status: z.enum(['ativa', 'concluida', 'suspensa']).default('ativa'),
})

export const exameSchema = z.object({
  consulta_id: z.string().optional(),
  pet_id: z.string().min(1, 'Pet é obrigatório'),
  tipo_exame: z.string().min(1, 'Tipo de exame é obrigatório'),
  data_exame: z.string().min(1, 'Data do exame é obrigatória'),
  resultado: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['solicitado', 'em_andamento', 'concluido']).default('solicitado'),
})

export type PetFormData = z.infer<typeof petSchema>
export type ConsultaFormData = z.infer<typeof consultaSchema>
export type VacinaFormData = z.infer<typeof vacinaSchema>
export type PrescricaoFormData = z.infer<typeof prescricaoSchema>
export type ExameFormData = z.infer<typeof exameSchema>
