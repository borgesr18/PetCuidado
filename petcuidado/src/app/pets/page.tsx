'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Plus, Search, Calendar, Weight, Palette } from 'lucide-react'
import { Pet, UserProfile } from '@/lib/auth'
import { getPets } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        const petsData = currentUser?.role === 'admin' 
          ? await getPets() 
          : await getPets(currentUser?.id)
        setPets(petsData)
      } catch (error) {
        console.error('Error loading pets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pets</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Todos os Pets' : 'Meus Pets'}
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie as informações dos seus pets
          </p>
        </div>
        <Link href="/pets/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pet
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum pet encontrado' : 'Nenhum pet cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece adicionando o primeiro pet'
              }
            </p>
            {!searchTerm && (
              <Link href="/pets/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Pet
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{getSpeciesIcon(pet.species)}</span>
                    <span>{pet.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {pet.breed || pet.species === 'cao' ? 'Cão' : 'Gato'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{calculateAge(pet.birth_date)}</span>
                    </div>
                    {pet.weight && (
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4" />
                        <span>{pet.weight} kg</span>
                      </div>
                    )}
                    {pet.color && (
                      <div className="flex items-center space-x-2">
                        <Palette className="h-4 w-4" />
                        <span>{pet.color}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
