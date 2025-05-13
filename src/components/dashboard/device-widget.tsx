'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeviceStatus, TopicSuffix, WidgetSize } from '@prisma/client'
import { CheckCircle, WifiOff, AlertTriangle, X, Settings } from 'lucide-react'
import {
  useDeleteDashboardDevice,
  useUpdateDashboardDevice,
} from '@/lib/zenstack-hooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import LoadingSpinner from '@/components/loading-spinner'
import { cn } from '@/lib/utils'
import WidgetResolver from './widgets/widget-resolver'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DeviceWidgetProps {
  dashboardDevice: {
    id: string
    deviceId: string
    dashboardId: string
    layout: {
      width: WidgetSize
      height: WidgetSize
      order: number
    }
    device: {
      id: string
      name: string
      status: DeviceStatus
      baseTopic?: string | null
      description?: string | null
      deviceType: {
        name: string
        topicSuffixes: TopicSuffix[]
      }
    }
  }
  isEditMode: boolean
  onRemove: () => void
  onRefresh: () => void
}

export default function DeviceWidget({
  dashboardDevice,
  isEditMode,
  onRefresh,
}: DeviceWidgetProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [widgetSize, setWidgetSize] = useState<WidgetSize>(
    dashboardDevice.layout.width,
  )

  const { mutate: deleteDashboardDevice, isPending: isDeleting } =
    useDeleteDashboardDevice()
  const { mutate: updateDashboardDevice, isPending: isUpdating } =
    useUpdateDashboardDevice()

  const handleDeleteDevice = () => {
    deleteDashboardDevice(
      {
        where: { id: dashboardDevice.id },
      },
      {
        onSuccess: () => {
          onRefresh()
        },
        onError: error => {
          console.error('Error removing device from dashboard:', error)
        },
      },
    )
  }

  const handleSizeChange = (size: WidgetSize) => {
    setWidgetSize(size)
    updateDashboardDevice(
      {
        where: { id: dashboardDevice.id },
        data: {
          layout: {
            width: size,
            height: size,
            order: dashboardDevice.layout.order,
          },
        },
      },
      {
        onSuccess: () => {
          setIsResizing(false)
          onRefresh()
        },
        onError: error => {
          console.error('Error updating widget size:', error)
          setIsResizing(false)
        },
      },
    )
  }

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
            Unknown
          </Badge>
        )
    }
  }

  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'SMALL':
        return 'col-span-1 row-span-1'
      case 'LARGE':
        return 'col-span-2 row-span-2 md:col-span-1 lg:col-span-2'
      case 'MEDIUM':
      default:
        return 'col-span-1 row-span-1 md:col-span-1 lg:col-span-1'
    }
  }

  const formatTopicSuffix = (suffix: TopicSuffix) => {
    switch (suffix) {
      case 'STATUS_TEMPERATURE':
        return 'Temperatura'
      case 'STATUS_LIGHT_TEMPERATURE':
        return 'Temp da Luz'
      case 'STATUS_HUMIDITY':
        return 'Humidade'
      case 'STATUS_ONOFF':
        return 'Power'
      case 'STATUS_BRIGHTNESS':
        return 'Brilho'
      case 'STATUS_COLOR':
        return 'Cor'
      case 'COMMAND_ONOFF':
        return 'Power'
      case 'COMMAND_BRIGHTNESS':
        return 'Brilho'
      case 'COMMAND_COLOR':
        return 'Cor'
      case 'COMMAND_TEMPERATURE':
        return 'Temperatura'
      case 'COMMAND_LIGHT_TEMPERATURE':
        return 'Temp da Luz'
      default:
        throw new Error(`Unknown topic suffix: ${suffix}`)
    }
  }

  const renderWidgetContent = () => {
    if (isResizing) {
      return (
        <div className="flex flex-col gap-4 h-full justify-center items-center">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Tamanho</p>
            <Select
              value={widgetSize}
              onValueChange={value => handleSizeChange(value as WidgetSize)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMALL">Pequeno</SelectItem>
                <SelectItem value="MEDIUM">Médio </SelectItem>
                <SelectItem value="LARGE">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    const topicSuffixes = dashboardDevice.device.deviceType.topicSuffixes

    if (!topicSuffixes || topicSuffixes.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">
            No available telemetry data for this device
          </p>
        </div>
      )
    }

    if (
      topicSuffixes.length === 1 ||
      dashboardDevice.layout.width === 'SMALL'
    ) {
      return (
        <WidgetResolver
          deviceId={dashboardDevice.device.id}
          topicSuffix={topicSuffixes[0]}
          size={dashboardDevice.layout.width}
        />
      )
    }

    const commandTopics = topicSuffixes.filter(suffix =>
      suffix.startsWith('COMMAND'),
    )

    const statusTopics = topicSuffixes.filter(suffix =>
      suffix.startsWith('STATUS'),
    )

    return (
      <Tabs defaultValue={topicSuffixes[0]} className="h-full flex flex-col">
        {statusTopics.length > 0 && (
          <>
            Status
            <TabsList className="w-full mb-2">
              {topicSuffixes
                .filter(suffix => suffix.startsWith('STATUS'))
                .map(suffix => (
                  <TabsTrigger key={suffix} value={suffix}>
                    {formatTopicSuffix(suffix)}
                  </TabsTrigger>
                ))}
            </TabsList>
          </>
        )}

        {commandTopics.length > 0 && (
          <>
            Comandos
            <TabsList className="mb-2 w-full">
              {topicSuffixes
                .filter(suffix => suffix.startsWith('COMMAND'))
                .map(suffix => (
                  <TabsTrigger key={suffix} value={suffix}>
                    {formatTopicSuffix(suffix)}
                  </TabsTrigger>
                ))}
            </TabsList>
          </>
        )}

        {topicSuffixes.map(suffix => (
          <TabsContent key={suffix} value={suffix} className="flex-grow mt-0">
            <WidgetResolver
              deviceId={dashboardDevice.device.id}
              topicSuffix={suffix}
              size={dashboardDevice.layout.width}
            />
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  return (
    <Card
      className={cn(
        getSizeClasses(dashboardDevice.layout.width),
        'transition-all duration-300 flex flex-col h-full',
      )}
    >
      <CardHeader className="pb-2 flex flex-row justify-between">
        <div>
          <CardTitle className="text-md">
            {dashboardDevice.device.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(dashboardDevice.device.status)}
            <span className="text-xs text-muted-foreground">
              {dashboardDevice.device.deviceType.name}
            </span>
          </div>
        </div>

        {isEditMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsResizing(true)}>
                Alterar Tamanho
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDeleteDevice}
              >
                <X className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="flex-grow p-0 px-4">
        {renderWidgetContent()}
      </CardContent>

      {dashboardDevice.layout.width !== 'SMALL' && (
        <CardFooter className="pt-2 border-t text-xs text-muted-foreground">
          <p className="font-mono">Topic: {dashboardDevice.device.baseTopic}</p>
        </CardFooter>
      )}

      {(isDeleting || isUpdating) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
          <LoadingSpinner />
        </div>
      )}
    </Card>
  )
}
