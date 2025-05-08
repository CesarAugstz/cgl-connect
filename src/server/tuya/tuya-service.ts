import { TuyaContext } from '@tuya/tuya-connector-nodejs'
import { EventEmitter } from 'events'
import { db } from '../db'
import { DeviceStatus, Prisma, TopicSuffix } from '@prisma/client'

export interface TuyaServiceOptions {
  baseUrl: string
  accessKey: string
  secretKey: string
}

export class TuyaService extends EventEmitter {
  private context: TuyaContext
  private _isRunning = false
  private pollingInterval: NodeJS.Timeout | null = null

  public get isRunning(): boolean {
    return this._isRunning
  }

  constructor(options: TuyaServiceOptions) {
    super()

    this.context = new TuyaContext({
      baseUrl: options.baseUrl,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    })
  }

  /**
   * Start the Tuya service
   */
  public async start(): Promise<void> {
    if (this._isRunning) return

    this._isRunning = true

    this.pollingInterval = setInterval(async () => {
      await this.pollTuyaDevices()
    }, 10 * 1000) // Poll every minute

    console.log('Tuya service started')
  }

  /**
   * Poll all Tuya devices for status updates
   */
  private async pollTuyaDevices(devicesIds?: string[]): Promise<void> {
    try {
      const devices = await db.device.findMany({
        where: {
          tuyaId: { not: null },
          ...(devicesIds ? { id: { in: devicesIds } } : {}),
        },
        include: {
          deviceType: true,
        },
      })

      console.log('tuya devices', devices)

      for (const device of devices) {
        if (!device.tuyaId) continue

        try {
          const status = await this.context.deviceStatus.status({
            device_id: device.tuyaId,
          })

          console.log('tuya device status', status)
          console.log('tuya device json', JSON.stringify(status, null, 2))

          if (status.success && status.result) {
            for (const item of status.result as unknown as any[]) {
              console.log('tuya device item', item)
              const topicSuffix = this.mapTuyaCodeToTopicSuffix(item?.code)
              console.log('tuya device topic suffix', topicSuffix)
              if (!topicSuffix) continue

              await db.telemetry.create({
                data: {
                  deviceId: device.id,
                  topicSuffix,
                  data: item as Prisma.InputJsonValue,
                  receivedAt: new Date(),
                },
              })
            }

            await db.device.update({
              where: { id: device.id },
              data: { status: 'ONLINE' as DeviceStatus },
            })
          }
        } catch (error) {
          console.error(`Error polling Tuya device ${device.tuyaId}:`, error)
        }
      }
    } catch (error) {
      console.error('Error polling Tuya devices:', error)
      this.emit('error', error)
    }
  }

  /**
   * Map Tuya status codes to TopicSuffix enum
   */
  private mapTuyaCodeToTopicSuffix(code: string): TopicSuffix | null {
    switch (code) {
      case 'switch_led':
        return 'STATUS_ONOFF'
      case 'bright_value_v2':
        return 'STATUS_BRIGHTNESS'
      case 'colour_data_v2':
        return 'STATUS_COLOR'
      case 'temp_value_v2':
        return 'STATUS_TEMPERATURE'
      case 'work_mode':
      case 'scene_data_v2':
      case 'countdown_1':
      case 'music_data':
      case 'control_data':
      case 'rhythm_mode':
      case 'sleep_mode':
      case 'wakeup_mode':
      case 'power_memory':
      case 'do_not_disturb':
      case 'cycle_timing':
      case 'random_timing':
        return null
      default:
        return null
    }
  }

  /**
   * Send command to a Tuya device
   */
  public async sendCommand(
    deviceId: string,
    topicSuffix: TopicSuffix,
    value: any,
  ): Promise<boolean> {
    try {
      const device = await db.device.findUnique({
        where: { id: deviceId },
      })

      if (!device?.tuyaId) {
        throw new Error(`Device ${deviceId} not found or has no Tuya ID`)
      }

      const code = this.mapTopicSuffixToTuyaCode(topicSuffix)
      if (!code) {
        throw new Error(`No mapping for topic suffix: ${topicSuffix}`)
      }

      const result = await this.context.request({
        path: `/v1.0/iot-03/devices/${device.tuyaId}/commands`,
        method: 'POST',
        body: {
          commands: [{ code, value: this.formatTuyaValue(code, value) }],
        },
      })

      this.pollTuyaDevices([deviceId])

      return result.success === true
    } catch (error) {
      console.error('Error sending command to Tuya device:', error)
      throw error
    }
  }

  /**
   * Map TopicSuffix to Tuya command code
   */
  private mapTopicSuffixToTuyaCode(topicSuffix: TopicSuffix): string | null {
    switch (topicSuffix) {
      case 'COMMAND_ONOFF':
        return 'switch_led'
      case 'COMMAND_BRIGHTNESS':
        return 'bright_value_v2'
      case 'COMMAND_COLOR':
        return 'colour_data_v2'
      case 'COMMAND_TEMPERATURE':
        return 'temp_value_v2'
      default:
        return null
    }
  }

  /**
   * Format value for Tuya API based on command code
   */
  private formatTuyaValue(code: string, value: any): any {
    switch (code) {
      case 'switch_led':
        return value === 'on' || value === true
      case 'bright_value_v2':
        return parseInt(value, 10)
      case 'colour_data_v2':
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch (e) {
            console.error('Failed to parse color value:', e)
            return value
          }
        }
        return value
      default:
        return value
    }
  }

  /**
   * Stop the Tuya service
   */
  public async stop(): Promise<void> {
    if (!this._isRunning) return

    this._isRunning = false

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    console.log('Tuya service stopped')
  }
}
