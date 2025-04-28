'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function DashboardHeader() {
  const router = useRouter()
  const session = useSession()

  return (
    <header className="bg-slate-200 border-md shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            UFMT Painel IoT
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700">
              Bem-vindo, {session.data?.user?.name || 'Usuário'}
            </div>
            <button
              onClick={() => {
                router.push('/login')
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
