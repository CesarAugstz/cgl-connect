'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Thermometer } from 'lucide-react'
import { useToast } from '@/lib/hooks/toast'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import { sendDeviceCommand } from './device-command'
import LoadingSpinner from '@/components/loading-spinner'

interface TemperatureCommandWidgetProps {
  deviceId: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function TemperatureCommandWidget({
  deviceId,
  size,
}: TemperatureCommandWidgetProps) {
  const toast = useToast()
  const [temperature, setTemperature] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [temperatureIsSet, setTemperatureIsSet] = useState(false)

  const device = useFindUniqueDevice({
    where: { id: deviceId },
    select: {
      telemetry: {
        select: {
          data: true,
        },
        where: {
          topicSuffix: 'STATUS_TEMPERATURE',
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
    console.log('latest temperature status', latestStatus)
    const temperatureValue =
      (typeof latestStatus?.temperature === 'number'
        ? latestStatus.temperature
        : typeof latestStatus?.value === 'number'
          ? latestStatus.value
          : 500) / 10

    setTemperature(temperatureValue)
    setTemperatureIsSet(true)

    return () => {
      setTemperatureIsSet(false)
    }
  }, [device.data, device.isSuccess])

  const handleTemperatureChange = async (value: number[]) => {
    const newTemperature = value[0]
    if (newTemperature === temperature) return

    setIsSubmitting(true)
    try {
      const result = await sendDeviceCommand({
        deviceId,
        topicSuffix: 'COMMAND_TEMPERATURE',
        payload: newTemperature * 10,
      })

      if (result.success) {
        setTemperature(newTemperature)
        toast.success(`Command sent: Set temperature to ${newTemperature}K`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error sending temperature command', error)
      toast.error('Failed to send temperature command to device')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (device.isLoading || !temperatureIsSet) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <Thermometer className="h-5 w-5 text-blue-500 mb-1" />
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <Thermometer className="h-5 w-5 text-blue-500 mb-1" />
          <div className="text-sm font-bold mb-1">{temperature}K</div>
          <Slider
            className="w-16"
            defaultValue={[temperature]}
            max={100}
            step={1}
            min={1}
            onValueCommit={handleTemperatureChange}
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
          <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
          Temperatura da Luz
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            {isSubmitting ? (
              <LoadingSpinner size="sm" className="h-2 w-2 mr-2" />
            ) : (
              <span className="text-2xl font-bold">{temperature}K</span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">
              Define a temperatura da cor da luz
            </span>
          </div>

          <div className="mb-6">
            <Slider
              defaultValue={[temperature]}
              max={100}
              step={1}
              min={1}
              onValueCommit={handleTemperatureChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
