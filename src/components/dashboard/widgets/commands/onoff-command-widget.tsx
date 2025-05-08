'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { PowerIcon } from 'lucide-react'
import { useToast } from '@/lib/hooks/toast'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import { sendDeviceCommand } from './device-command'

interface OnOffCommandWidgetProps {
  deviceId: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function OnOffCommandWidget({
  deviceId,
  size,
}: OnOffCommandWidgetProps) {
  const toast = useToast()
  const [isOn, setIsOn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const device = useFindUniqueDevice({
    where: { id: deviceId },
    select: {
      telemetry: {
        select: {
          data: true,
        },
        where: {
          topicSuffix: 'STATUS_ONOFF',
        },
        orderBy: {
          receivedAt: 'desc',
        },
        take: 1,
      },
    },
  })

  useEffect(() => {
    if (!device.data || !device.isSuccess) return

    const latestStatus = device.data?.telemetry[0]?.data as any
    const isOnFromStatus =
      latestStatus?.state === true ||
      latestStatus?.status === 'ON' ||
      latestStatus?.value === 1 ||
      latestStatus?.value === true

    setIsOn(isOnFromStatus)
  }, [device.data, device.isSuccess])

  const handleToggle = async (newState: boolean) => {
    setIsSubmitting(true)
    try {
      const result = await sendDeviceCommand({
        deviceId,
        topicSuffix: 'COMMAND_ONOFF',
        payload: newState ? 'on' : 'off',
      })

      if (result.success) {
        setIsOn(newState)
        toast.success(`Comando enviado: ${newState ? 'Ligar' : 'Desligar'}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error sending command', error)
      toast.error('Erro ao enviar comando para o dispositivo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <PowerIcon
            className={`h-5 w-5 ${isOn ? 'text-green-500' : 'text-slate-400'} mb-1`}
          />
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PowerIcon
            className={`h-4 w-4 ${isOn ? 'text-green-500' : 'text-slate-400'} mr-2`}
          />
          Controle ON/OFF
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-lg font-medium">{isOn ? 'ON' : 'OFF'}</span>
              <p className="text-xs text-muted-foreground">
                Envie comando para ligar ou desligar o dispositivo
              </p>
            </div>
            <Switch
              checked={isOn}
              onCheckedChange={handleToggle}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
