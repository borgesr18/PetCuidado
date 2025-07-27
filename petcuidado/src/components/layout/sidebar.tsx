'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  Heart, 
  Calendar, 
  Syringe, 
  FileText, 
  TestTube, 
  Settings, 
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  userRole: 'admin' | 'tutor' | 'veterinario'
}

const menuItems = {
  tutor: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Heart, label: 'Meus Pets', href: '/pets' },
    { icon: Calendar, label: 'Consultas', href: '/consultas' },
    { icon: Syringe, label: 'Vacinas', href: '/vacinas' },
    { icon: FileText, label: 'Prescrições', href: '/prescricoes' },
  ],
  veterinario: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Heart, label: 'Pets', href: '/pets' },
    { icon: Calendar, label: 'Agenda', href: '/consultas' },
    { icon: Syringe, label: 'Vacinas', href: '/vacinas' },
    { icon: FileText, label: 'Prescrições', href: '/prescricoes' },
    { icon: TestTube, label: 'Exames', href: '/exames' },
  ],
  admin: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Heart, label: 'Pets', href: '/pets' },
    { icon: Calendar, label: 'Consultas', href: '/consultas' },
    { icon: Syringe, label: 'Vacinas', href: '/vacinas' },
    { icon: FileText, label: 'Prescrições', href: '/prescricoes' },
    { icon: TestTube, label: 'Exames', href: '/exames' },
    { icon: Settings, label: 'Administração', href: '/admin' },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const items = menuItems[userRole] || menuItems.tutor

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PetCuidado</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <Separator />

          {/* User info */}
          <div className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {userRole === 'admin' && 'Administrador'}
              {userRole === 'tutor' && 'Tutor'}
              {userRole === 'veterinario' && 'Veterinário'}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
