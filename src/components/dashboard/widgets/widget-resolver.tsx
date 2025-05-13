'use client'

import { TopicSuffix } from '@prisma/client'
import { useFindManyTelemetry } from '@/lib/zenstack-hooks'
import { useState, useEffect } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import LoadingSpinner from '@/components/loading-spinner'

// Status Widgets
import LightTemperatureWidget from './status/light-temperature-widget'
import OnOffCommandWidget from './commands/onoff-command-widget'
import BrightnessCommandWidget from './commands/brightness-command-widget'
import ColorCommandWidget from './commands/color-command-widget'
import LightTemperatureCommandWidget from './commands/light-temperature-command-widget'
import BrightnessStatusWidget from './status/brightness-status-widget'
import ColorStatusWidget from './status/color-status-widget'
import HumidityWidget from './status/humidity-widget'
import OnOffStatusWidget from './status/onoff-status-widget'
import TemperatureWidget from './status/temperature-widget'

// Command Widgets
import TemperatureCommandWidget from './commands/temperature-command-widget'

interface WidgetResolverProps {
  deviceId: string
  topicSuffix: TopicSuffix
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function WidgetResolver({
  deviceId,
  topicSuffix,
  size,
}: WidgetResolverProps) {
  const [refreshInterval] = useState<number>(30000)

  const isCommandTopic = topicSuffix.startsWith('COMMAND_')
  const isStatusTopic = topicSuffix.startsWith('STATUS_')

  const {
    data: telemetryData,
    isLoading,
    refetch,
  } = useFindManyTelemetry(
    {
      where: {
        deviceId,
        topicSuffix,
      },
      orderBy: {
        receivedAt: 'desc',
      },
      take: size === 'LARGE' ? 50 : size === 'MEDIUM' ? 20 : 5,
    },
    {
      enabled: isStatusTopic,
    },
  )

  useEffect(() => {
    if (!isStatusTopic) return

    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refetch, refreshInterval, isStatusTopic])

  if (isLoading && isStatusTopic) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (isCommandTopic) {
    switch (topicSuffix) {
      case 'COMMAND_ONOFF':
        return <OnOffCommandWidget deviceId={deviceId} size={size} />
      case 'COMMAND_BRIGHTNESS':
        return <BrightnessCommandWidget deviceId={deviceId} size={size} />
      case 'COMMAND_COLOR':
        return <ColorCommandWidget deviceId={deviceId} size={size} />
      case 'COMMAND_LIGHT_TEMPERATURE':
        return <LightTemperatureCommandWidget deviceId={deviceId} size={size} />
      case 'COMMAND_TEMPERATURE':
        return <TemperatureCommandWidget deviceId={deviceId} size={size} />
      default:
        return (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Command widget for {topicSuffix} not implemented yet
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  if (!telemetryData || telemetryData.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  switch (topicSuffix) {
    case 'STATUS_LIGHT_TEMPERATURE':
      return <LightTemperatureWidget data={telemetryData} size={size} />
    case 'STATUS_HUMIDITY':
      return <HumidityWidget data={telemetryData} size={size} />
    case 'STATUS_ONOFF':
      return <OnOffStatusWidget data={telemetryData} size={size} />
    case 'STATUS_BRIGHTNESS':
      return <BrightnessStatusWidget data={telemetryData} size={size} />
    case 'STATUS_COLOR':
      return <ColorStatusWidget data={telemetryData} size={size} />
    case 'STATUS_TEMPERATURE':
      return <TemperatureWidget data={telemetryData} size={size} />
    default:
      return (
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Widget for {topicSuffix} not implemented yet
            </p>
          </CardContent>
        </Card>
      )
  }
}
