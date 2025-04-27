'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormText } from '@/components/ui/form-fields/form-text'
import LoadingSpinner from '@/components/loading-spinner'
import {
  useCreateLocation,
  useFindUniqueLocation,
  useUpdateLocation,
} from '@/lib/zenstack-hooks'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  address: z.string().optional(),
})

type LocationFormValues = z.infer<typeof formSchema>

interface LocationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  locationId?: string
}

export default function LocationForm({
  isOpen,
  onClose,
  onSuccess,
  locationId,
}: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!locationId

  const { data: locationData, isLoading: isLoadingLocation } =
    useFindUniqueLocation(
      { where: { id: locationId } },
      { enabled: !!locationId },
    )

  const { mutate: createLocation } = useCreateLocation()
  const { mutate: updateLocation } = useUpdateLocation()

  const methods = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: locationData?.name || '',
      address: locationData?.address || '',
    },
  })

  const onSubmit = (values: LocationFormValues) => {
    setIsSubmitting(true)

    if (isEditMode && locationData) {
      updateLocation(
        {
          where: { id: locationData.id },
          data: values,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Erro ao atualizar localização:', error)
            setIsSubmitting(false)
          },
        },
      )
    } else {
      createLocation(
        {
          data: values,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Erro ao criar localização:', error)
            setIsSubmitting(false)
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
            {isEditMode ? 'Editar Localização' : 'Nova Localização'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize as informações da localização no formulário abaixo.'
              : 'Digite os detalhes para a nova localização.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingLocation ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormText
                name="name"
                label="Nome"
                placeholder="Digite o nome da localização"
                required
              />

              <FormText
                name="address"
                label="Endereço"
                placeholder="Digite o endereço (opcional)"
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
                      {isEditMode ? 'Atualizar Localização' : 'Criar Localização'}
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
