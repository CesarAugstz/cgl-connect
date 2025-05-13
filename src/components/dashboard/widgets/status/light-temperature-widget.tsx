'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Thermometer } from 'lucide-react'
import { dayJs } from '@/utils/dayjs'

interface TemperatureWidgetProps {
  data: Array<{
    id: string
    receivedAt: Date
    data: any
  }>
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function LightTemperatureWidget({
  data,
  size,
}: TemperatureWidgetProps) {
  const latestTemp = useMemo(() => {
    if (!data || data.length === 0) return null

    const latest = data[0]
    return latest.data || '--'
  }, [data])

  const chartData = useMemo(() => {
    return data
      .map(item => ({
        time: dayJs(item.receivedAt).format('HH:mm'),
        value: parseFloat(item.data || 0),
        date: dayJs(item.receivedAt).toDate(),
      }))
      .reverse()
  }, [data])

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <Thermometer className="h-5 w-5 text-blue-500 mb-1" />
          <div className="text-2xl font-bold">{latestTemp}°C</div>
          <p className="text-xs text-muted-foreground">Temperature</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
          Temperature
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold">{latestTemp}°C</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {data.length > 0 && dayJs(data[0].receivedAt).fromNow()}
            </span>
          </div>

          {chartData.length > 1 && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={label => `Time: ${label}`}
                    formatter={value => [`${value}°C`, 'Temperature']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
