'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaletteIcon } from 'lucide-react'
import { useToast } from '@/lib/hooks/toast'
import { HexColorPicker } from 'react-colorful'
import { useFindUniqueDevice } from '@/lib/zenstack-hooks'
import { sendDeviceCommand } from './device-command'

interface ColorCommandWidgetProps {
  deviceId: string
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
}

function hsvToHex(h: number, s: number, v: number): string {
  s = s / 1000
  v = v / 1000

  let r, g, b

  const i = Math.floor(h / 60)
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
    default:
      r = 0
      g = 0
      b = 0
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  hex = hex.replace(/^#/, '')

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = max === 0 ? 0 : delta / max
  let v = max

  if (delta === 0) {
    h = 0
  } else if (max === r) {
    h = ((g - b) / delta) % 6
  } else if (max === g) {
    h = (b - r) / delta + 2
  } else {
    h = (r - g) / delta + 4
  }

  h = Math.round(h * 60)
  if (h < 0) h += 360

  s = Math.round(s * 1000)
  v = Math.round(v * 1000)

  return { h, s, v }
}

export default function ColorCommandWidget({
  deviceId,
  size,
}: ColorCommandWidgetProps) {
  const toast = useToast()
  const [color, setColor] = useState('#ff0000')

  const device = useFindUniqueDevice({
    where: { id: deviceId },
    select: {
      telemetry: {
        select: {
          data: true,
        },
        where: {
          topicSuffix: 'STATUS_COLOR',
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
    if (latestStatus?.value) {
      try {
        const colorData =
          typeof latestStatus.value === 'string'
            ? JSON.parse(latestStatus.value)
            : latestStatus.value

        if (
          colorData.h !== undefined &&
          colorData.s !== undefined &&
          colorData.v !== undefined
        ) {
          const hexColor = hsvToHex(colorData.h, colorData.s, colorData.v)
          setColor(hexColor)
        }
      } catch (error) {
        console.error('Error parsing color data:', error)
      }
    }
  }, [device.data, device.isSuccess])

  const handleColorChange = async (newColor: string) => {
    console.log('handle color', newColor, color)

    try {
      const hsvColor = hexToHsv(newColor)

      const result = await sendDeviceCommand({
        deviceId,
        topicSuffix: 'COMMAND_COLOR',
        payload: hsvColor,
      })

      if (result.success) {
        setColor(newColor)
        toast.success('Command sent: Color updated')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error sending color command', error)
      toast.error('Falha ao enviar comando de cor para o dispositivo')
    } finally {
    }
  }

  if (size === 'SMALL') {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <div
            className="h-10 w-10 rounded-full mb-1 border border-slate-200"
            style={{ backgroundColor: color }}
          />
          <p className="text-xs text-muted-foreground">Set Color</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PaletteIcon className="h-4 w-4 mr-2" />
          Controle de Cor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div
              className="h-8 w-8 rounded-full mr-2 border border-slate-200"
              style={{ backgroundColor: color }}
            />
            <div>
              <div className="font-mono text-sm">{color}</div>
              <span className="text-xs text-muted-foreground">
                Defina a cor para o dispositivo
              </span>
            </div>
          </div>

          <div className="mt-2">
            <HexColorPicker
              color={color}
              onChange={setColor}
              onMouseUp={() => handleColorChange(color)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
