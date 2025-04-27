'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Edit, MoreVertical, Trash } from 'lucide-react'
import { useState } from 'react'
import { useDeleteUser } from '@/lib/zenstack-hooks'
import { dayJs } from '@/utils/dayjs'
import { Role } from '@prisma/client'

interface UserWithRelations {
  id: string
  email: string
  name?: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
  _count?: {
    devices: number
  }
}

interface UserTableProps {
  users: UserWithRelations[]
  onRefresh: () => void
  onClickEdit: (id: string) => void
}

export default function UserTable({
  users,
  onRefresh,
  onClickEdit
}: UserTableProps) {
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const { mutate: deleteUser } = useDeleteUser()

  const handleDelete = () => {
    if (userToDelete) {
      deleteUser(
        {
          where: { id: userToDelete }
        },
        {
          onSuccess: () => {
            setUserToDelete(null)
            onRefresh()
          }
        }
      )
    }
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'USER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (users.length === 0) {
    return <div className="text-center py-4">Nenhum usuário encontrado</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Dispositivos</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name || <span className="text-muted-foreground italic">Não definido</span>}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </Badge>
              </TableCell>
              <TableCell>{user._count?.devices || 0}</TableCell>
              <TableCell>{dayJs(user.updatedAt).fromNow()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onClickEdit(user.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setUserToDelete(user.id)}
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={open => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
