'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { SunIcon } from 'lucide-react'
import { useToast } from '@/lib/hooks/toast'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import { sendDeviceCommand } from './device-command'
import LoadingSpinner from '@/components/loading-spinner'

interface BrightnessCommandWidgetProps {
  deviceId: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function BrightnessCommandWidget({
  deviceId,
  size,
}: BrightnessCommandWidgetProps) {
  const toast = useToast()
  const [brightness, setBrightness] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brightnessIsSet, setBrightnessIsSet] = useState(false)

  const device = useFindUniqueDevice({
    where: { id: deviceId },
    select: {
      telemetry: {
        select: {
          data: true,
        },
        where: {
          topicSuffix: 'STATUS_BRIGHTNESS',
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
    console.log('latest brightness status', latestStatus)
    const brightnessValue =
      (typeof latestStatus?.brightness === 'number'
        ? latestStatus.brightness
        : typeof latestStatus?.value === 'number'
          ? latestStatus.value
          : 500) / 10

    setBrightness(brightnessValue)
    setBrightnessIsSet(true)

    return () => {
      setBrightnessIsSet(false)
    }
  }, [device.data, device.isSuccess])

  const handleBrightnessChange = async (value: number[]) => {
    const newBrightness = value[0]
    if (newBrightness === brightness) return

    setIsSubmitting(true)
    try {
      const result = await sendDeviceCommand({
        deviceId,
        topicSuffix: 'COMMAND_BRIGHTNESS',
        payload: newBrightness * 10,
      })

      if (result.success) {
        setBrightness(newBrightness)
        toast.success(`Command sent: Set brightness to ${newBrightness}%`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error sending brightness command', error)
      toast.error('Failed to send brightness command to device')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (device.isLoading || !brightnessIsSet) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <SunIcon className="h-5 w-5 text-amber-500 mb-1" />
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <SunIcon className="h-5 w-5 text-amber-500 mb-1" />
          <div className="text-sm font-bold mb-1">{brightness}%</div>
          <Slider
            className="w-16"
            defaultValue={[brightness]}
            max={100}
            step={1}
            min={1}
            onValueCommit={handleBrightnessChange}
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
          <SunIcon className="h-4 w-4 text-amber-500 mr-2" />
          Brilho
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            {isSubmitting ? (
              <LoadingSpinner size="sm" className="h-2 w-2 mr-2" />
            ) : (
              <span className="text-2xl font-bold">{brightness}%</span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">
              Define a brilho para o dispositivo
            </span>
          </div>

          <div className="mb-6">
            <Slider
              defaultValue={[brightness]}
              max={100}
              step={1}
              min={1}
              onValueCommit={handleBrightnessChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
