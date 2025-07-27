'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TestTube, Plus, Search, Calendar, FileText, Download } from 'lucide-react'
import { Exame, UserProfile } from '@/lib/auth'
import { getExames } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export default function ExamesPage() {
  const [exames, setExames] = useState<Exame[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser?.role === 'tutor') {
          return
        }
        
        const examesData = currentUser?.role === 'admin' 
          ? await getExames() 
          : await getExames(undefined, currentUser?.id)
        setExames(examesData)
      } catch (error) {
        console.error('Error loading exames:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredExames = exames.filter(exame =>
    exame.tipo_exame.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exame.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exame.veterinario?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado': return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento': return 'bg-blue-100 text-blue-800'
      case 'concluido': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (user?.role === 'tutor') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <TestTube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">
            Esta seção é restrita a veterinários e administradores.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Exames</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Exames</h1>
          <p className="text-gray-600 mt-2">
            Gerencie exames e resultados
          </p>
        </div>
        <Link href="/exames/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Exame
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar exames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredExames.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum exame encontrado' : 'Nenhum exame registrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece solicitando o primeiro exame'
              }
            </p>
            {!searchTerm && (
              <Link href="/exames/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Primeiro Exame
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExames.map((exame) => (
            <Card key={exame.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TestTube className="h-5 w-5 text-purple-600" />
                      <span>{exame.tipo_exame}</span>
                    </CardTitle>
                    <CardDescription>
                      {exame.pet?.name}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exame.status)}`}>
                    {exame.status.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Data do exame: {formatDate(exame.data_exame)}</span>
                  </div>
                  
                  <p className="text-gray-600">
                    <strong>Veterinário:</strong> Dr. {exame.veterinario?.name}
                  </p>
                  
                  {exame.consulta && (
                    <p className="text-gray-600">
                      <strong>Consulta:</strong> {exame.consulta.motivo}
                    </p>
                  )}
                  
                  {exame.resultado && (
                    <div>
                      <p className="text-gray-600"><strong>Resultado:</strong></p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{exame.resultado}</p>
                    </div>
                  )}
                  
                  {exame.observacoes && (
                    <div>
                      <p className="text-gray-600"><strong>Observações:</strong></p>
                      <p className="text-sm">{exame.observacoes}</p>
                    </div>
                  )}
                  
                  {exame.arquivo_url && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="flex items-center space-x-1 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>Arquivo disponível</span>
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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
