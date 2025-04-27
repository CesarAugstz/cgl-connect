'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Prisma, Role } from '@prisma/client'
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
  useCreateUser,
  useFindUniqueUser,
  useUpdateUser,
} from '@/lib/zenstack-hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/lib/hooks/toast'

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .or(z.string().length(0))
    .optional(),
  role: z.enum(['ADMIN', 'USER']),
})

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId?: string
}

export default function UserForm({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!userId
  const toast = useToast()

  const { data: userData, isLoading: isLoadingUser } = useFindUniqueUser(
    { where: { id: userId } },
    { enabled: !!userId },
  )

  const { mutate: createUser } = useCreateUser()
  const { mutate: updateUser } = useUpdateUser()

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: userData?.name || '',
      email: userData?.email || '',
      password: '',
      role: userData?.role || 'USER',
    },
  })

  const onSubmit = (values: UserFormValues) => {
    setIsSubmitting(true)

    const data: Omit<Prisma.UserUpdateInput, 'id' | 'createdAt' | 'updatedAt'> =
      {
        name: values.name,
        email: values.email,
        role: values.role,
      }

    if (values.password && values.password.length > 0) {
      data.password = values.password
    }

    if (isEditMode && userData) {
      updateUser(
        {
          where: { id: userData.id },
          data: data as any,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Error updating user:', error)
            setIsSubmitting(false)
            toast.exception(error)
          },
        },
      )
    } else {
      if (!data.password) {
        methods.setError('password', {
          type: 'manual',
          message: 'Password is required for new users',
        })
        setIsSubmitting(false)
        return
      }

      if (!data.email || typeof data.email !== 'string') {
        methods.setError('email', {
          type: 'manual',
          message: 'Email is required',
        })
        setIsSubmitting(false)
        return
      }

      createUser(
        {
          data: data as any,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Error creating user:', error)
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
            {isEditMode ? 'Editar Usuário' : 'Criar Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Edite os detalhes do usuário abaixo.'
              : 'Preencha os detalhes para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUser ? (
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
                placeholder="Digite o nome do usuário"
              />

              <FormText
                name="email"
                label="Email"
                placeholder="Digite o email do usuário"
              />

              <FormText
                name="password"
                label={
                  isEditMode
                    ? 'Senha (Deixe em branco para manter a atual)'
                    : 'Senha'
                }
                placeholder={
                  isEditMode ? 'Digite a nova senha' : 'Digite a senha'
                }
                type="password"
                required={!isEditMode}
              />

              <FormField
                control={methods.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.USER}>Usuário</SelectItem>
                          <SelectItem value={Role.ADMIN}>
                            Administrador
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : isEditMode ? (
                    'Salvar'
                  ) : (
                    'Criar'
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
