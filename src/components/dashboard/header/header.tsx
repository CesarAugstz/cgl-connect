'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import UserDropdown from './user-dropdown/user-dropdown'

export default function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
