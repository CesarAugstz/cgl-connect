'use server'

import { getMqttService } from '@/server/mqtt'

export async function publishMqtt(
  deviceId: string,
  topicSuffix: 'COMMAND_ONOFF' | 'COMMAND_BRIGHTNESS' | 'COMMAND_COLOR' | 'COMMAND_TEMPERATURE',
  payload: any
) {
  try {
    const service = getMqttService()
    await service.publishToDeviceTopic(deviceId, topicSuffix, payload)
    return { success: true }
  } catch (error) {
    console.error('Failed to publish MQTT message:', error)
    return { success: false, error: String(error) }
  }
}

