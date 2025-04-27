"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { DeviceStatus } from "@prisma/client";
import DeviceForm from "./device-form";
import { useDeleteDevice } from "@/lib/zenstack-hooks/device";
import { dayJs } from "@/utils/dayjs";
import DeviceActivityMenu from "./device-activity-menu";

interface DeviceWithRelations {
  id: string;
  name: string;
  description?: string | null;
  status: DeviceStatus;
  createdAt: Date;
  updatedAt: Date;
  baseTopic: string;
  deviceType: { id: string; name: string };
  location?: { id: string; name: string } | null;
  user?: { id: string; name?: string | null } | null;
}

interface DeviceTableProps {
  devices: DeviceWithRelations[];
  onRefresh: () => void;
}

export default function DeviceTable({ devices, onRefresh }: DeviceTableProps) {
  const [editingDevice, setEditingDevice] = useState<DeviceWithRelations | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  
  const { mutate: deleteDevice } = useDeleteDevice();

  const handleDelete = () => {
    if (deviceToDelete) {
      deleteDevice({ 
        where: { id: deviceToDelete } 
      }, {
        onSuccess: () => {
          setDeviceToDelete(null);
          onRefresh();
        }
      });
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case "ONLINE":
        return <Badge className="bg-green-500">Online</Badge>;
      case "OFFLINE":
        return <Badge variant="secondary" className="bg-gray-500">Offline</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (devices.length === 0) {
    return <div className="text-center py-4">Nenhum dispositivo encontrado</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead>Proprietário</TableHead>
            <TableHead>Tópico Base</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">{device.name}</TableCell>
              <TableCell>{device.deviceType.name}</TableCell>
              <TableCell>{device.location?.name || "—"}</TableCell>
              <TableCell>{getStatusBadge(device.status)}</TableCell>
              <TableCell>{dayJs(device.updatedAt).fromNow()}</TableCell>
              <TableCell>{device.user?.name || "—"}</TableCell>
              <TableCell className="font-mono text-xs">{device.baseTopic}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <DeviceActivityMenu deviceId={device.id} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingDevice(device)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeviceToDelete(device.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingDevice && (
        <DeviceForm
          isOpen={!!editingDevice}
          onClose={() => setEditingDevice(null)}
          onSuccess={() => {
            setEditingDevice(null);
            onRefresh();
          }}
          deviceId={editingDevice.id}
        />
      )}

      <AlertDialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o dispositivo
              e todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
