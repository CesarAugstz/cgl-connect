'use client'

import { FormProvider } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/loading-spinner'
import { DeviceBasicInfoSection } from './form-sections/basic-info-section'
import { DeviceRelationsSection } from './form-sections/relations-section'
import { MqttConfigSection } from './form-sections/mqtt-config-section'
import { useDeviceForm } from './hooks/useDeviceForm'

interface DeviceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  deviceId?: string
}

export default function DeviceForm({
  isOpen,
  onClose,
  onSuccess,
  deviceId,
}: DeviceFormProps) {
  const {
    methods,
    isSubmitting,
    isLoading,
    isEditMode,
    selectedTopicSuffixes,
    deviceTypes,
    locations,
    users,
    isTuyaDevice,
    handleDeviceTypeChange,
    onSubmit,
  } = useDeviceForm({ deviceId, onSuccess, isOpen })

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Dispositivo' : 'Adicionar Novo Dispositivo'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize as informações do dispositivo no formulário abaixo.'
              : 'Insira os detalhes para o novo dispositivo.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <DeviceBasicInfoSection />

              <DeviceRelationsSection
                deviceTypes={deviceTypes}
                locations={locations}
                users={users}
                onDeviceTypeChange={handleDeviceTypeChange}
              />

              <MqttConfigSection
                deviceTypeId={methods.watch('deviceTypeId')}
                selectedTopicSuffixes={selectedTopicSuffixes}
                isTuyaDevice={isTuyaDevice}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      {isEditMode
                        ? 'Atualizar Dispositivo'
                        : 'Criar Dispositivo'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
