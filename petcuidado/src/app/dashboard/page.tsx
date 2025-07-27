'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Calendar, Syringe, FileText } from 'lucide-react'
import { getCurrentUser, UserProfile } from '@/lib/auth'
import { getDashboardStats } from '@/lib/database'

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    totalPets: 0,
    consultasHoje: 0,
    vacinasPendentes: 0,
    prescricoesAtivas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          const dashboardStats = await getDashboardStats(currentUser.id, currentUser.role)
          setStats(dashboardStats)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const dashboardStats = [
    {
      title: user?.role === 'admin' ? "Total de Pets" : "Meus Pets",
      value: stats.totalPets.toString(),
      description: user?.role === 'admin' ? "Pets no sistema" : "Pets cadastrados",
      icon: Heart,
      color: "text-pink-600",
      href: "/pets"
    },
    {
      title: "Consultas Hoje",
      value: stats.consultasHoje.toString(),
      description: "Consultas agendadas para hoje",
      icon: Calendar,
      color: "text-blue-600",
      href: "/consultas"
    },
    {
      title: "Vacinas Pendentes",
      value: stats.vacinasPendentes.toString(),
      description: "Vacinas com prazo vencendo",
      icon: Syringe,
      color: "text-green-600",
      href: "/vacinas"
    },
    {
      title: "Prescrições Ativas",
      value: stats.prescricoesAtivas.toString(),
      description: "Tratamentos em andamento",
      icon: FileText,
      color: "text-purple-600",
      href: "/prescricoes"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo ao PetCuidado! Aqui você pode acompanhar a saúde dos seus pets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>
              Consultas agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma consulta agendada</p>
              <p className="text-sm">Agende uma consulta para seu pet</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vacinas em Atraso</CardTitle>
            <CardDescription>
              Vacinas que precisam ser aplicadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Syringe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Todas as vacinas em dia</p>
              <p className="text-sm">Parabéns! Seus pets estão protegidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao PetCuidado</CardTitle>
          <CardDescription>
            Sistema completo para cuidar da saúde dos seus pets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              O PetCuidado é sua plataforma completa para acompanhar a saúde e bem-estar dos seus pets. 
              Aqui você pode:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-blue-600" />
                <span>Cadastrar e gerenciar informações dos seus pets</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>Agendar e acompanhar consultas veterinárias</span>
              </li>
              <li className="flex items-center space-x-2">
                <Syringe className="h-4 w-4 text-yellow-600" />
                <span>Controlar o calendário de vacinas</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Acessar prescrições e histórico médico</span>
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              Comece explorando o menu lateral para acessar todas as funcionalidades disponíveis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
