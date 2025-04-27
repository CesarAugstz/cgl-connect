'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PowerIcon } from 'lucide-react'
import { dayJs } from '@/utils/dayjs'

interface OnOffStatusWidgetProps {
  data: Array<{
    id: string
    receivedAt: Date
    data: any
  }>
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

export default function OnOffStatusWidget({ data, size }: OnOffStatusWidgetProps) {
  const isOn = useMemo(() => {
    if (!data || data.length === 0) return false
    const latest = data[0]
    return latest.data.state === true || 
           latest.data.status === 'ON' || 
           latest.data.value === 1 || 
           latest.data.value === true
  }, [data])

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <PowerIcon className={`h-5 w-5 ${isOn ? 'text-green-500' : 'text-slate-400'} mb-1`} />
          <div className="text-sm font-medium">{isOn ? 'ON' : 'OFF'}</div>
          <p className="text-xs text-muted-foreground">Status</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PowerIcon className={`h-4 w-4 ${isOn ? 'text-green-500' : 'text-slate-400'} mr-2`} />
          Status de Energia
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold">{isOn ? 'ON' : 'OFF'}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {data.length > 0 && `Última atualização ${dayJs(data[0].receivedAt).fromNow()}`}
            </span>
          </div>
          
          {size === 'LARGE' && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <div className="space-y-2 max-h-40 overflow-auto">
                {data.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {dayJs(item.receivedAt).format('MMM D, HH:mm:ss')}
                    </span>
                    <span className={
                      item.data.state === true || 
                      item.data.status === 'ON' || 
                      item.data.value === 1 || 
                      item.data.value === true 
                        ? "text-green-500" 
                        : "text-slate-500"
                    }>
                      {item.data.state === true || 
                       item.data.status === 'ON' || 
                       item.data.value === 1 || 
                       item.data.value === true ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
