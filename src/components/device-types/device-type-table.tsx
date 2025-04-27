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
import { TopicSuffix } from '@prisma/client'
import { useState } from 'react'
import { useDeleteDeviceType } from '@/lib/zenstack-hooks'
import { dayJs } from '@/utils/dayjs'
import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'

interface DeviceTypeWithRelations {
  id: string
  name: string
  topicSuffixes: TopicSuffix[]
  createdAt: Date
  updatedAt: Date
  _count?: {
    devices: number
  }
}

interface DeviceTypeTableProps {
  deviceTypes: DeviceTypeWithRelations[]
  onRefresh: () => void
  onClickEdit: (id: string) => void
}

export default function DeviceTypeTable({
  deviceTypes,
  onRefresh,
  onClickEdit
}: DeviceTypeTableProps) {
  const [deviceTypeToDelete, setDeviceTypeToDelete] = useState<string | null>(null)
  const { mutate: deleteDeviceType } = useDeleteDeviceType()

  const handleDelete = () => {
    if (deviceTypeToDelete) {
      deleteDeviceType(
        {
          where: { id: deviceTypeToDelete }
        },
        {
          onSuccess: () => {
            setDeviceTypeToDelete(null)
            onRefresh()
          }
        }
      )
    }
  }

  if (deviceTypes.length === 0) {
    return <div className="text-center py-4">Nenhum tipo de dispositivo encontrado</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tópicos Suportados</TableHead>
            <TableHead>Dispositivos</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviceTypes.map(deviceType => (
            <TableRow key={deviceType.id}>
              <TableCell className="font-medium">{deviceType.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {deviceType.topicSuffixes.map(suffix => (
                    <Badge key={suffix} variant="outline" className="text-xs">
                      {topicSuffixToPath[suffix]}
                    </Badge>
                  ))}
                  {deviceType.topicSuffixes.length === 0 && (
                    <span className="text-muted-foreground text-sm">Nenhum</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{deviceType._count?.devices || 0}</TableCell>
              <TableCell>{dayJs(deviceType.updatedAt).fromNow()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onClickEdit(deviceType.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeviceTypeToDelete(deviceType.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
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
        open={!!deviceTypeToDelete}
        onOpenChange={open => !open && setDeviceTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              tipo de dispositivo. Quaisquer dispositivos usando este tipo podem ser afetados.
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
