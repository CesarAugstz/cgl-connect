import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'
import { db } from '../db'
import { MqttClient, MqttMessage } from './mqtt'
import { DeviceStatus, Prisma, TopicSuffix } from '@prisma/client'
import { EventEmitter } from 'events'

export interface MqttServiceOptions {
  brokerUrl: string
  clientId?: string
  username?: string
  password?: string
}

export class MqttService extends EventEmitter {
  private client: MqttClient
  private _isRunning = false
  private topicToDeviceMap: Map<
    string,
    { deviceId: string; topicSuffix: TopicSuffix }
  > = new Map()

  public get isRunning(): boolean {
    return this._isRunning
  }

  public isClientConnected(): boolean {
    return this.client.isClientConnected()
  }

  constructor(options: MqttServiceOptions) {
    super()

    console.log(`new mqtt client on:`, {
      url: options.brokerUrl,
    })

    this.client = new MqttClient(options.brokerUrl, {
      clientId:
        options.clientId ||
        `cgl-connect-${Math.random().toString(16).substring(2, 10)}`,
      username: options.username,
      password: options.password,
      reconnectPeriod: 5000,
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker')
      this.emit('connect')

      if (this._isRunning) {
        this.resubscribeToAllTopics()
      }
    })

    this.client.on('error', error => {
      console.error('MQTT error:', error)
      this.emit('error', error)
    })

    this.client.on('offline', () => {
      console.log('MQTT client is offline')
      this.emit('offline')
    })

    this.client.on('message', this.handleMessage.bind(this))
  }

  /**
   * Builds a full MQTT topic from base topic and suffix
   */
  private buildFullTopic(baseTopic: string, suffix: TopicSuffix): string {
    const path = topicSuffixToPath[suffix]
    if (!path) {
      throw new Error(`No mapping found for topic suffix: ${suffix}`)
    }
    return `${baseTopic}/${path}`
  }

  /**
   * Handles an incoming MQTT message
   */
  private async handleMessage(message: MqttMessage) {
    try {
      const deviceInfo = this.topicToDeviceMap.get(message.topic)
      if (!deviceInfo) {
        console.warn(`Received message for unknown topic: ${message.topic}`)
        return
      }

      const { deviceId, topicSuffix } = deviceInfo

      let data: any
      try {
        data = JSON.parse(message.payload)
      } catch (e) {
        data = { raw: message.payload }
      }

      await db.telemetry.create({
        data: {
          deviceId,
          topicSuffix,
          data: data as Prisma.InputJsonValue,
          receivedAt: new Date(),
        },
      })

      await db.device.update({
        where: { id: deviceId },
        data: { status: 'ONLINE' as DeviceStatus },
      })

      this.emit('telemetry', {
        deviceId,
        topicSuffix,
        topic: message.topic,
        data,
      })
    } catch (error) {
      console.error('Error handling MQTT message:', error)
      this.emit('error', error)
    }
  }

  /**
   * Start the MQTT service
   */
  public async start(): Promise<void> {
    if (this._isRunning) {
      return
    }

    this._isRunning = true

    this.loadAndSubscribe()

    setInterval(async () => {
      await this.loadAndSubscribe()
    }, 60 * 1000)

    setInterval(async () => {
      await this.checkDeviceStatuses()
    }, 60 * 1000)

    console.log('MQTT service started')
  }

  /**
   * Load device configurations and subscribe to topics
   */
  private async loadAndSubscribe(): Promise<void> {
    try {
      this.topicToDeviceMap.clear()

      const devices = await db.device.findMany({
        include: {
          deviceType: true,
        },
      })

      console.log(`Found ${devices.length} devices to configure`)

      for (const device of devices) {
        const { baseTopic, id } = device

        if (!baseTopic) {
          console.warn(`Device ${id} has no base topic configured, skipping`)
          continue
        }

        const topicSuffixes = device.deviceType.topicSuffixes || []

        for (const suffix of topicSuffixes) {
          const fullTopic = this.buildFullTopic(baseTopic, suffix)
          this.topicToDeviceMap.set(fullTopic, {
            deviceId: id,
            topicSuffix: suffix,
          })

          await this.client.subscribe(fullTopic)
          console.log(
            `Subscribed to topic: ${fullTopic} for device: ${device.name}`,
          )
        }
      }
    } catch (error) {
      console.error('Error loading device configurations:', error)
      this.emit('error', error)
    }
  }

  /**
   * Resubscribe to all topics (used after reconnection)
   */
  private async resubscribeToAllTopics(): Promise<void> {
    const topics = Array.from(this.topicToDeviceMap.keys())
    if (topics.length > 0) {
      await this.client.subscribe(topics)
      console.log(`Resubscribed to ${topics.length} topics`)
    }
  }

  /**
   * Periodically check device statuses based on recent telemetry
   */
  private async checkDeviceStatuses(): Promise<void> {
    const timeThreshold = new Date()
    timeThreshold.setMinutes(timeThreshold.getMinutes() - 5)

    try {
      const devices = await db.device.findMany({
        select: {
          id: true,
          status: true,
          telemetry: {
            orderBy: {
              receivedAt: 'desc',
            },
            take: 1,
          },
        },
      })

      for (const device of devices) {
        let newStatus: DeviceStatus = 'UNKNOWN'

        const hasRecentTelemetry =
          device.telemetry.length > 0 &&
          device.telemetry[0].receivedAt >= timeThreshold

        if (hasRecentTelemetry) {
          newStatus = 'ONLINE'
        } else if (device.telemetry.length > 0) {
          newStatus = 'OFFLINE'
        }

        if (device.status !== newStatus) {
          await db.device.update({
            where: { id: device.id },
            data: { status: newStatus },
          })
          console.log(`Updated device ${device.id} status to ${newStatus}`)
        }
      }
    } catch (error) {
      console.error('Error checking device statuses:', error)
      this.emit('error', error)
    }
  }

  /**
   * Publish a message to a device topic
   */
  public async publishToDeviceTopic(
    deviceId: string,
    topicSuffix: TopicSuffix,
    message: any,
  ): Promise<void> {
    try {
      const device = await db.device.findUnique({
        where: { id: deviceId },
      })

      if (!device || !device.baseTopic) {
        throw new Error(`Device ${deviceId} not found or has no base topic`)
      }

      const fullTopic = this.buildFullTopic(device.baseTopic, topicSuffix)
      const messageStr =
        typeof message === 'string' ? message : JSON.stringify(message)

      await this.client.publish(fullTopic, messageStr)
      console.log(`Published message to ${fullTopic}`)
    } catch (error) {
      console.error('Error publishing message:', error)
      throw error
    }
  }

  /**
   * Stop the MQTT service
   */
  public async stop(): Promise<void> {
    if (!this._isRunning) {
      return
    }

    this._isRunning = false
    await this.client.disconnect()
    console.log('MQTT service stopped')
  }
}
