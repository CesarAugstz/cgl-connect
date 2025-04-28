'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { useFindManyDashboard } from '@/lib/zenstack-hooks'
import LoadingSpinner from '@/components/loading-spinner'
import DashboardForm from '@/components/dashboard/dashboard-form'
import DashboardSharingModal from '@/components/dashboard/dashboard-sharing-modal'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DashboardCard from '@/components/dashboard/dashboard-card'

export default function DashboardsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDashboardId, setEditingDashboardId] = useState<
    string | undefined
  >()
  const [sharingDashboardId, setSharingDashboardId] = useState<
    string | undefined
  >()

  const {
    data: dashboards,
    isLoading,
    refetch,
  } = useFindManyDashboard({
    include: {
      owner: true,
      _count: {
        select: {
          devices: true,
        },
      },
    },
  })

  const handleAddNew = () => {
    setEditingDashboardId(undefined)
    setIsFormOpen(true)
  }

  const handleEditClick = (id: string) => {
    setEditingDashboardId(id)
    setIsFormOpen(true)
  }

  const handleShareClick = (id: string) => {
    setSharingDashboardId(id)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    refetch()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboards</h1>
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
            Criar Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Dashboards</CardTitle>
          <CardDescription>
            Gerencie todos os seus dashboards de IoT a partir deste painel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboards?.map(dashboard => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  onEdit={() => handleEditClick(dashboard.id)}
                  onShare={() => handleShareClick(dashboard.id)}
                />
              ))}

              {dashboards?.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui dashboards.
                  </p>
                  <Button onClick={handleAddNew}>
                    Criar seu primeiro dashboard
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DashboardForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        dashboardId={editingDashboardId}
      />

      {sharingDashboardId && (
        <DashboardSharingModal
          dashboardId={sharingDashboardId}
          isOpen={!!sharingDashboardId}
          onClose={() => setSharingDashboardId(undefined)}
        />
      )}
    </div>
  )
}
