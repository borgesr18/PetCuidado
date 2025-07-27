'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Search, Calendar, Clock, AlertCircle } from 'lucide-react'
import { Prescricao, UserProfile } from '@/lib/auth'
import { getPrescricoes } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export default function PrescricoesPage() {
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        const prescricoesData = currentUser?.role === 'admin' 
          ? await getPrescricoes() 
          : await getPrescricoes(undefined, currentUser?.id)
        setPrescricoes(prescricoesData)
      } catch (error) {
        console.error('Error loading prescricoes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPrescricoes = prescricoes.filter(prescricao =>
    prescricao.medicamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescricao.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescricao.veterinario?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800'
      case 'concluida': return 'bg-blue-100 text-blue-800'
      case 'suspensa': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const isExpiringSoon = (dataFim?: string) => {
    if (!dataFim) return false
    const today = new Date()
    const endDate = new Date(dataFim)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Prescrições</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Prescrições</h1>
          <p className="text-gray-600 mt-2">
            Gerencie prescrições médicas
          </p>
        </div>
        {user?.role === 'veterinario' && (
          <Link href="/prescricoes/nova">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar prescrições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPrescricoes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma prescrição encontrada' : 'Nenhuma prescrição registrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'As prescrições aparecerão aqui quando forem criadas'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescricoes.map((prescricao) => (
            <Card key={prescricao.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>{prescricao.medicamento}</span>
                    </CardTitle>
                    <CardDescription>
                      {prescricao.pet?.name}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescricao.status)}`}>
                      {prescricao.status}
                    </span>
                    {isExpiringSoon(prescricao.data_fim) && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600"><strong>Dosagem:</strong></p>
                      <p>{prescricao.dosagem}</p>
                    </div>
                    <div>
                      <p className="text-gray-600"><strong>Frequência:</strong></p>
                      <p>{prescricao.frequencia}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600"><strong>Duração:</strong></p>
                    <p>{prescricao.duracao}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {formatDate(prescricao.data_inicio)}</span>
                    </span>
                    {prescricao.data_fim && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Fim: {formatDate(prescricao.data_fim)}</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600">
                    <strong>Veterinário:</strong> Dr. {prescricao.veterinario?.name}
                  </p>
                  
                  {prescricao.instrucoes && (
                    <div>
                      <p className="text-gray-600"><strong>Instruções:</strong></p>
                      <p className="text-sm">{prescricao.instrucoes}</p>
                    </div>
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
