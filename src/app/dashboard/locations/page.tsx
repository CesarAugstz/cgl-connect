'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, PlusCircle, RefreshCw } from 'lucide-react'
import { useFindManyLocation } from '@/lib/zenstack-hooks'
import LocationForm from '@/components/locations/location-form'
import LoadingSpinner from '@/components/loading-spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import LocationTable from '@/components/locations/location-table'

export default function LocationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLocationId, setEditingLocationId] = useState<
    string | undefined
  >()

  const {
    data: locations,
    isLoading,
    refetch,
  } = useFindManyLocation({
    include: {
      _count: {
        select: {
          devices: true,
        },
      },
    },
  })

  const handleAddNew = () => {
    setEditingLocationId(undefined)
    setIsFormOpen(true)
  }

  const handleEditClick = (id: string) => {
    setEditingLocationId(id)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    refetch()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Localizações</h1>
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
            Adicionar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Localizações</CardTitle>
          <CardDescription>
            Gerencie todas as suas localizações de IoT a partir deste painel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <LocationTable
              locations={locations || []}
              onRefresh={refetch}
              onClickEdit={handleEditClick}
            />
          )}
        </CardContent>
      </Card>

      <LocationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        locationId={editingLocationId}
      />
    </div>
  )
}
