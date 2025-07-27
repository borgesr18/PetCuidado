'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Syringe, Plus, Search, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { Vacina, UserProfile } from '@/lib/auth'
import { getVacinas } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export default function VacinasPage() {
  const [vacinas, setVacinas] = useState<Vacina[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        
        const vacinasData = await getVacinas()
        setVacinas(vacinasData)
      } catch (error) {
        console.error('Error loading vacinas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredVacinas = vacinas.filter(vacina =>
    vacina.nome_vacina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacina.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vacina.fabricante?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isVaccinePending = (proximaDose?: string) => {
    if (!proximaDose) return false
    const today = new Date()
    const doseDate = new Date(proximaDose)
    return doseDate <= today
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vacinas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vacinas</h1>
          <p className="text-gray-600 mt-2">
            Controle de vacinação dos pets
          </p>
        </div>
        <Link href="/vacinas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Vacina
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar vacinas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredVacinas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Syringe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma vacina encontrada' : 'Nenhuma vacina registrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece registrando a primeira vacina'
              }
            </p>
            {!searchTerm && (
              <Link href="/vacinas/nova">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Vacina
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacinas.map((vacina) => (
            <Card key={vacina.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Syringe className="h-5 w-5 text-green-600" />
                    <span>{vacina.nome_vacina}</span>
                  </div>
                  {isVaccinePending(vacina.proxima_dose) && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {vacina.pet?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Aplicada em: {formatDate(vacina.data_aplicacao)}</span>
                  </div>
                  
                  {vacina.proxima_dose && (
                    <div className={`flex items-center space-x-2 ${isVaccinePending(vacina.proxima_dose) ? 'text-orange-600' : 'text-gray-600'}`}>
                      {isVaccinePending(vacina.proxima_dose) ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>
                        Próxima dose: {formatDate(vacina.proxima_dose)}
                        {isVaccinePending(vacina.proxima_dose) && ' (Atrasada)'}
                      </span>
                    </div>
                  )}
                  
                  {vacina.veterinario && (
                    <p className="text-gray-600">
                      <strong>Veterinário:</strong> Dr. {vacina.veterinario.name}
                    </p>
                  )}
                  
                  {vacina.fabricante && (
                    <p className="text-gray-600">
                      <strong>Fabricante:</strong> {vacina.fabricante}
                    </p>
                  )}
                  
                  {vacina.lote && (
                    <p className="text-gray-600">
                      <strong>Lote:</strong> {vacina.lote}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
