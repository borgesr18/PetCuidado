'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Weight, Palette, Microchip, Edit, Trash2, Syringe, FileText, TestTube } from 'lucide-react'
import { Pet, Consulta, Vacina } from '@/lib/auth'
import { getPetById, getConsultas, getVacinas, deletePet } from '@/lib/database'

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [vacinas, setVacinas] = useState<Vacina[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const petId = params.id as string
        const [petData, consultasData, vacinasData] = await Promise.all([
          getPetById(petId),
          getConsultas(petId),
          getVacinas(petId)
        ])
        
        setPet(petData)
        setConsultas(consultasData)
        setVacinas(vacinasData)
      } catch (error) {
        console.error('Error loading pet data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleDelete = async () => {
    if (!pet) return
    
    if (confirm(`Tem certeza que deseja excluir ${pet.name}? Esta ação não pode ser desfeita.`)) {
      try {
        await deletePet(pet.id)
        router.push('/pets')
      } catch (error) {
        console.error('Error deleting pet:', error)
        alert('Erro ao excluir pet. Tente novamente.')
      }
    }
  }

  const getSpeciesIcon = (species: string) => {
    return species === 'cao' ? '🐕' : '🐱'
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'Idade não informada'
    
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth()
    
    if (ageInMonths < 12) {
      return `${ageInMonths} ${ageInMonths === 1 ? 'mês' : 'meses'}`
    } else {
      const years = Math.floor(ageInMonths / 12)
      return `${years} ${years === 1 ? 'ano' : 'anos'}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pet não encontrado</h1>
        <Link href="/pets">
          <Button>Voltar para Pets</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/pets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getSpeciesIcon(pet.species)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-600">
                {pet.breed || (pet.species === 'cao' ? 'Cão' : 'Gato')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/pets/${pet.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Idade</p>
                  <p className="font-medium">{calculateAge(pet.birth_date)}</p>
                </div>
              </div>
              
              {pet.weight && (
                <div className="flex items-center space-x-3">
                  <Weight className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Peso</p>
                    <p className="font-medium">{pet.weight} kg</p>
                  </div>
                </div>
              )}
              
              {pet.color && (
                <div className="flex items-center space-x-3">
                  <Palette className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Cor</p>
                    <p className="font-medium">{pet.color}</p>
                  </div>
                </div>
              )}
              
              {pet.microchip && (
                <div className="flex items-center space-x-3">
                  <Microchip className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Microchip</p>
                    <p className="font-medium">{pet.microchip}</p>
                  </div>
                </div>
              )}
              
              {pet.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Observações</p>
                  <p className="text-sm">{pet.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Consultas Recentes</span>
                </CardTitle>
                <CardDescription>Últimas consultas veterinárias</CardDescription>
              </div>
              <Link href={`/consultas/nova?pet=${pet.id}`}>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {consultas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma consulta registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultas.slice(0, 3).map((consulta) => (
                    <div key={consulta.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{consulta.motivo}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(consulta.data_consulta)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Dr. {consulta.veterinario?.name}
                      </p>
                      {consulta.diagnostico && (
                        <p className="text-sm mt-2">{consulta.diagnostico}</p>
                      )}
                    </div>
                  ))}
                  {consultas.length > 3 && (
                    <Link href={`/consultas?pet=${pet.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver todas as consultas
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5" />
                  <span>Vacinas</span>
                </CardTitle>
                <CardDescription>Histórico de vacinação</CardDescription>
              </div>
              <Link href={`/vacinas/nova?pet=${pet.id}`}>
                <Button size="sm">
                  <Syringe className="h-4 w-4 mr-2" />
                  Nova Vacina
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {vacinas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Syringe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma vacina registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vacinas.slice(0, 3).map((vacina) => (
                    <div key={vacina.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{vacina.nome_vacina}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(vacina.data_aplicacao)}
                        </span>
                      </div>
                      {vacina.proxima_dose && (
                        <p className="text-sm text-gray-600">
                          Próxima dose: {formatDate(vacina.proxima_dose)}
                        </p>
                      )}
                      {vacina.veterinario && (
                        <p className="text-sm text-gray-600">
                          Dr. {vacina.veterinario.name}
                        </p>
                      )}
                    </div>
                  ))}
                  {vacinas.length > 3 && (
                    <Link href={`/vacinas?pet=${pet.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver todas as vacinas
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
