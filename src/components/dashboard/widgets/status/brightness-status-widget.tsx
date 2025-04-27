'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { SunIcon } from 'lucide-react'
import { dayJs } from '@/utils/dayjs'

interface BrightnessStatusWidgetProps {
  data: Array<{
    id: string
    receivedAt: Date
    data: any
  }>
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function BrightnessStatusWidget({ data, size }: BrightnessStatusWidgetProps) {
  const latestBrightness = useMemo(() => {
    if (!data || data.length === 0) return 0
    const latest = data[0]
    return typeof latest.data.brightness === 'number' ? latest.data.brightness : 
           typeof latest.data.value === 'number' ? latest.data.value : 0
  }, [data])

  const chartData = useMemo(() => {
    return data.map(item => ({
      time: dayJs(item.receivedAt).format('HH:mm'),
      value: typeof item.data.brightness === 'number' ? item.data.brightness : 
             typeof item.data.value === 'number' ? item.data.value : 0,
      date: dayJs(item.receivedAt).toDate(),
    })).reverse()
  }, [data])

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <SunIcon className="h-5 w-5 text-amber-500 mb-1" />
          <div className="text-2xl font-bold">{latestBrightness}%</div>
          <p className="text-xs text-muted-foreground">Brightness</p>
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
            <span className="text-2xl font-bold">{latestBrightness}%</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {data.length > 0 && dayJs(data[0].receivedAt).fromNow()}
            </span>
          </div>
          
          {chartData.length > 1 && (
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value) => [`${value}%`, 'Brightness']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
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
