'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Settings,
  Users,
  Library,
  Tablet,
  MapPin,
} from 'lucide-react'

interface Route {
  name: string
  path: string
  icon: React.ReactNode
  disabled?: boolean
}

export default function Sidebar() {
  const pathname = usePathname()

  const routes: Route[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Dispositivos',
      path: '/dashboard/devices',
      icon: <Tablet className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Tipo de Dispositivos',
      path: '/dashboard/device-types',
      icon: <Library className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Localizações',
      path: '/dashboard/locations',
      icon: <MapPin className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Usuários',
      path: '/dashboard/users',
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Configurações',
      path: '/dashboard/settings',
      icon: <Settings className="mr-2 h-5 w-5" />,
      disabled: true,
    },
  ] as const

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="py-4 px-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            UFMT IoT
          </h1>
        </div>
      </div>
      <div className="py-4 flex flex-col flex-1 overflow-y-auto">
        <nav className="px-3 space-y-1">
          {routes.map(route => (
            <Link href={route.disabled ? '#' : route.path} key={route.path}>
              <Button
                disabled={route?.disabled}
                variant="ghost"
                className={cn(
                  'w-full justify-start cursor-pointer',
                  pathname === route.path
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {route.icon}
                {route.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
