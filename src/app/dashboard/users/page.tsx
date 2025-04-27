'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { useFindManyUser } from '@/lib/zenstack-hooks'
import UserTable from '@/components/users/user-table'
import UserForm from '@/components/users/user-form'
import LoadingSpinner from '@/components/loading-spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | undefined>()

  const {
    data: users,
    isLoading,
    refetch
  } = useFindManyUser({
    include: {
      _count: {
        select: {
          devices: true
        }
      }
    }
  })

  const handleAddNew = () => {
    setEditingUserId(undefined)
    setIsFormOpen(true)
  }

  const handleEditClick = (id: string) => {
    setEditingUserId(id)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    refetch()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Adicionar Novo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie todos os seus usuários a partir deste painel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <UserTable
              users={users || []}
              onRefresh={refetch}
              onClickEdit={handleEditClick}
            />
          )}
        </CardContent>
      </Card>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        userId={editingUserId}
      />
    </div>
  )
}
