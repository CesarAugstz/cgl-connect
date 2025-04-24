'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  AlertTriangle,
  WifiOff,
  Search,
  Filter
} from 'lucide-react'
import { dayJs } from '@/utils/dayjs'

type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'

interface Device {
  id: string
  name: string
  type: string
  location: string
  status: DeviceStatus
  lastActive: Date
  baseTopic: string
}

const mockDevices: Device[] = [
  {
    id: 'dev-001',
    name: 'Projetor Principal',
    type: 'Projetor',
    location: 'Sala 101 - Bloco A',
    status: 'ONLINE',
    lastActive: new Date(),
    baseTopic: 'devices/proj/sala101'
  },
  {
    id: 'dev-002',
    name: 'Ar-condicionado',
    type: 'HVAC',
    location: 'Sala 102 - Bloco A',
    status: 'OFFLINE',
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    baseTopic: 'devices/hvac/sala102'
  },
  {
    id: 'dev-003',
    name: 'Sensor de Presença',
    type: 'Sensor',
    location: 'Sala 103 - Bloco A',
    status: 'ONLINE',
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    baseTopic: 'devices/sensor/sala103'
  },
  {
    id: 'dev-004',
    name: 'Smart Board',
    type: 'Display',
    location: 'Sala 201 - Bloco B',
    status: 'UNKNOWN',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    baseTopic: 'devices/display/sala201'
  },
  {
    id: 'dev-005',
    name: 'Câmera de Segurança',
    type: 'Câmera',
    location: 'Corredor - Bloco B',
    status: 'ONLINE',
    lastActive: new Date(Date.now() - 10 * 60 * 1000),
    baseTopic: 'devices/camera/corredor'
  }
]

export default function DeviceList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [devices, setDevices] = useState<Device[]>(mockDevices)

  const filteredDevices = devices.filter(
    device =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.baseTopic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'ONLINE':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Online
          </Badge>
        )
      case 'OFFLINE':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
          >
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            Desconhecido
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Buscar dispositivos..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" title="Filtro">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Tópico MQTT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length > 0 ? (
              filteredDevices.map(device => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.type}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>{dayJs(device.lastActive).fromNow()}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {device.baseTopic}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-slate-500"
                >
                  Nenhum dispositivo encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
