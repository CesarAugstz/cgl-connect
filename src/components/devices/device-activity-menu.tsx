'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ActivityIcon, RefreshCw } from 'lucide-react'
import LoadingSpinner from '@/components/loading-spinner'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import { DeviceStatus, TopicSuffix } from '@prisma/client'
import { dayJs } from '@/utils/dayjs'
import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'

interface DeviceActivityMenuProps {
  deviceId: string
}

export default function DeviceActivityMenu({
  deviceId,
}: DeviceActivityMenuProps) {
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const {
    data: device,
    isLoading,
    refetch,
  } = useFindUniqueDevice({
    where: { id: deviceId },
    include: {
      telemetry: {
        orderBy: {
          receivedAt: 'desc',
        },
        take: 5,
      },
    },
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 500)
  }

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'ONLINE':
        return <Badge className="bg-green-500">Online</Badge>
      case 'OFFLINE':
        return (
          <Badge variant="secondary" className="bg-gray-500">
            Offline
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getLastActivity = () => {
    if (!device?.telemetry || device.telemetry.length === 0) {
      return 'Nenhuma atividade registrada'
    }

    const lastActivity = device.telemetry[0].receivedAt
    return dayJs(lastActivity).fromNow()
  }

  // Function to get full topic path
  const getFullTopicPath = (baseTopic: string, suffix: TopicSuffix) => {
    const path = topicSuffixToPath[suffix]
    return path ? `${baseTopic}/${path}` : baseTopic
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ActivityIcon className="h-4 w-4" />
          Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Atividade do Dispositivo</DialogTitle>
          <DialogDescription>
            Visualize as informações mais recentes do dispositivo
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{device?.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{getStatusBadge(device?.status || 'UNKNOWN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last Activity:
                    </span>
                    <span>{getLastActivity()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Topic:</span>
                    <span className="font-mono text-sm">
                      {device?.baseTopic}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Telemetry</CardTitle>
              </CardHeader>
              <CardContent>
                {!device?.telemetry || device.telemetry.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No telemetry data available
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {device.telemetry.map(item => (
                      <div key={item.id} className="border p-3 rounded-md">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            Topic:{' '}
                            {getFullTopicPath(
                              device.baseTopic ?? '',
                              item.topicSuffix,
                            )}
                          </span>
                          <span>
                            {dayJs(item.receivedAt).format(
                              'MMM D, YYYY HH:mm:ss',
                            )}
                          </span>
                        </div>
                        <pre className="bg-slate-600 p-2 rounded text-xs overflow-x-auto text-white">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
