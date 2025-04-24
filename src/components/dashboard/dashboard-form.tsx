'use client'

import { useState } from 'react'
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
import {
  useCreateDashboard,
  useFindUniqueDashboard,
  useUpdateDashboard,
} from '@/lib/zenstack-hooks'
import { useToast } from '@/lib/hooks/toast'
import { useSession } from 'next-auth/react'
import DashboardFormFields, { DashboardFormValues } from './dashboard-form-fields'

interface DashboardFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dashboardId?: string
}

export default function DashboardForm({
  isOpen,
  onClose,
  onSuccess,
  dashboardId,
}: DashboardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!dashboardId
  const toast = useToast()
  const { data: session } = useSession()

  const { data: dashboardData, isLoading: isLoadingDashboard } = useFindUniqueDashboard(
    { where: { id: dashboardId } },
    { enabled: !!dashboardId },
  )

  const { mutate: createDashboard } = useCreateDashboard()
  const { mutate: updateDashboard } = useUpdateDashboard()

  const handleSubmit = (values: DashboardFormValues) => {
    setIsSubmitting(true)

    const data = {
      name: values.name,
      description: values.description,
      isPublic: values.isPublic,
    }

    if (isEditMode && dashboardData) {
      updateDashboard(
        {
          where: { id: dashboardData.id },
          data,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
            toast.success('Painel atualizado com sucesso')
          },
          onError: error => {
            console.error('Erro ao atualizar painel:', error)
            setIsSubmitting(false)
            toast.exception(error)
          },
        },
      )
    } else {
      createDashboard(
        {
          data: {
            ...data,
            ownerId: session!.user!.id,
          },
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
            toast.success('Painel criado com sucesso')
          },
          onError: error => {
            console.error('Erro ao criar painel:', error)
            setIsSubmitting(false)
            toast.exception(error)
          },
        },
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Painel' : 'Criar Novo Painel'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize as informações do painel no formulário abaixo.'
              : 'Preencha os dados para criar um novo painel.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDashboard ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <DashboardFormFields
            defaultValues={{
              name: dashboardData?.name || '',
              description: dashboardData?.description || '',
              isPublic: dashboardData?.isPublic || false,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          >
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
                  <>{isEditMode ? 'Atualizar Painel' : 'Criar Painel'}</>
                )}
              </Button>
            </DialogFooter>
          </DashboardFormFields>
        )}
      </DialogContent>
    </Dialog>
  )
}
