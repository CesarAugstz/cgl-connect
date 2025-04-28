'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon, Pencil, Check } from 'lucide-react'
import DeviceWidget from './device-widget'
import LoadingSpinner from '@/components/loading-spinner'
import { useFindManyDashboardDevice } from '@/lib/zenstack-hooks'
import AddDeviceToDashboardDialog from './add-device-to-dashboard-dialog'

interface DashboardWidgetsContainerProps {
  dashboardId: string
}

export default function DashboardWidgetsContainer({ dashboardId }: DashboardWidgetsContainerProps) {
  const [isAddingDevice, setIsAddingDevice] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const {
    data: dashboardDevices,
    isLoading,
    refetch,
  } = useFindManyDashboardDevice({
    where: { dashboardId },
    include: {
      device: {
        include: {
          deviceType: true,
        },
      },
    },
    orderBy: { layout: 'asc' },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dispositivos</h2>
        <div className="flex gap-2">
          {isEditMode ? (
            <Button 
              onClick={() => setIsEditMode(false)}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Concluído
            </Button>
          ) : (
            <Button 
              onClick={() => setIsEditMode(true)}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Editar Layout
            </Button>
          )}
          
          <Button 
            onClick={() => setIsAddingDevice(true)}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Adicionar Dispositivo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {(!dashboardDevices || dashboardDevices.length === 0) ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">Nenhum dispositivo adicionado ainda</h3>
              <p className="text-muted-foreground mb-6">
                Adicione dispositivos a este dashboard para monitorá-los e controlá-los
              </p>
              <Button onClick={() => setIsAddingDevice(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicione seu primeiro dispositivo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dashboardDevices.map(dashboardDevice => (
                <DeviceWidget
                  key={dashboardDevice.id}
                  dashboardDevice={dashboardDevice}
                  isEditMode={isEditMode}
                  onRemove={() => refetch()}
                  onRefresh={() => refetch()}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      <AddDeviceToDashboardDialog
        isOpen={isAddingDevice}
        onClose={() => setIsAddingDevice(false)}
        dashboardId={dashboardId}
        onDeviceAdded={() => {
          setIsAddingDevice(false)
          refetch()
        }}
      />
    </div>
  )
}
