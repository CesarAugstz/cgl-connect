'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  Edit,
  AlertTriangle,
  Activity,
  Settings,
} from 'lucide-react'
import DeviceForm from '@/components/devices/device-form'
import LoadingSpinner from '@/components/loading-spinner'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import DeviceActivityMenu from '@/components/devices/device-activity-menu'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'
import { TopicSuffix } from '@prisma/client'
import { dayJs } from '@/utils/dayjs'

export default function DeviceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const {
    data: device,
    isLoading,
    refetch,
  } = useFindUniqueDevice({
    where: { id: deviceId },
    include: {
      deviceType: true,
      location: true,
      user: true,
      telemetry: {
        orderBy: {
          receivedAt: 'desc',
        },
        take: 10,
      },
      alerts: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/devices')}
            className="mr-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Dispositivos
          </Button>
        </div>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Dispositivo Não Encontrado</CardTitle>
            <CardDescription>
              O dispositivo que você está procurando não existe ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard/devices')}>
              Retornar à Lista de Dispositivos
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
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

  const getFullTopicPath = (baseTopic: string, suffix: TopicSuffix) => {
    const path = topicSuffixToPath[suffix]
    return path ? `${baseTopic}/${path}` : baseTopic
  }

  const groupedTelemetry = device.telemetry.reduce(
    (acc, item) => {
      if (!acc[item.topicSuffix]) {
        acc[item.topicSuffix] = []
      }
      acc[item.topicSuffix].push(item)
      return acc
    },
    {} as Record<TopicSuffix, typeof device.telemetry>,
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/devices')}
            className="mr-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Dispositivos
          </Button>
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <div className="ml-3">{getStatusBadge(device.status)}</div>
        </div>
        <div className="flex items-center gap-2">
          <DeviceActivityMenu deviceId={device.id} />
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Editar Dispositivo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Informações do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Tipo de Dispositivo
              </div>
              <div>
                {device.deviceType.name}
                {device.deviceType.isTuya && (
                  <Badge variant="outline" className="ml-2">
                    Tuya
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Descrição</div>
              <div>{device.description || 'Nenhuma descrição fornecida'}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Localização
              </div>
              <div>
                {device.location?.name || 'Nenhuma localização atribuída'}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">
                Usuário Atribuído
              </div>
              <div>{device.user?.name || 'Nenhum usuário atribuído'}</div>
            </div>

            {device.deviceType.isTuya ? (
              <div>
                <div className="text-sm font-medium text-gray-500">ID Tuya</div>
                <div className="font-mono text-sm">
                  {device.tuyaId || 'Não configurado'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Tópico Base
                </div>
                <div className="font-mono text-sm">{device.baseTopic}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-500">
                Última Atualização
              </div>
              <div>
                {dayJs(device.updatedAt).format(
                  'DD [de] MMMM [de] YYYY HH:mm:ss',
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Criado em</div>
              <div>
                {dayJs(device.createdAt).format(
                  'DD [de] MMMM [de] YYYY HH:mm:ss',
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="telemetry">
              <TabsList className="mb-4">
                <TabsTrigger value="telemetry" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Telemetria
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Alertas
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="telemetry">
                {!device.deviceType.topicSuffixes ||
                device.deviceType.topicSuffixes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum sufixo de tópico configurado para este tipo de
                    dispositivo
                  </div>
                ) : device.telemetry.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum dado de telemetria disponível para este dispositivo
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedTelemetry).map(([suffix, items]) => (
                      <Card key={suffix} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Tópico:{' '}
                            {getFullTopicPath(
                              device.baseTopic ?? '',
                              suffix as TopicSuffix,
                            )}
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {items.map((item, index) => (
                              <AccordionItem key={item.id} value={item.id}>
                                <AccordionTrigger className="py-3 hover:no-underline">
                                  <div className="flex justify-between items-center w-full pr-4">
                                    <span>Telemetria {index + 1}</span>
                                    <span className="text-sm text-gray-500">
                                      {dayJs(item.receivedAt).format(
                                        'DD/MM/YYYY HH:mm:ss',
                                      )}
                                    </span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                                    {JSON.stringify(item.data, null, 2)}
                                  </pre>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="alerts">
                {device.alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum alerta para este dispositivo
                  </div>
                ) : (
                  <div className="space-y-4">
                    {device.alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`border p-4 rounded-lg ${
                          alert.severity === 'HIGH'
                            ? 'border-red-300 bg-red-50'
                            : alert.severity === 'MEDIUM'
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-blue-300 bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">
                            Alerta{' '}
                            {alert.severity === 'HIGH'
                              ? 'Alto'
                              : alert.severity === 'MEDIUM'
                                ? 'Médio'
                                : 'Baixo'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dayJs(alert.createdAt).format(
                              'DD/MM/YYYY HH:mm:ss',
                            )}
                          </div>
                        </div>
                        <div>{alert.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Tópicos Disponíveis
                    </h3>
                    {device.deviceType.topicSuffixes &&
                    device.deviceType.topicSuffixes.length > 0 ? (
                      <div className="space-y-2">
                        {device.deviceType.topicSuffixes.map(suffix => (
                          <div
                            key={suffix}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                          >
                            <span className="font-medium">
                              {suffix.replace('_', ' ').toLowerCase()}
                            </span>
                            <span className="font-mono text-xs">
                              {getFullTopicPath(device.baseTopic ?? '', suffix)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        Nenhum tópico configurado para este tipo de dispositivo
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap">
                    <h3 className="text-lg font-medium mb-2">
                      Gerenciamento do Dispositivo
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Reiniciar Dispositivo
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        Atualizar Firmware
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                      >
                        Restaurar Configurações de Fábrica
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DeviceForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false)
          refetch()
        }}
        deviceId={device.id}
      />
    </div>
  )
}
