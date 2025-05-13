'use server'

import { getMqttService } from '@/server/mqtt'
import { TopicSuffix } from '@prisma/client'

export async function publishMqtt(
  deviceId: string,
  topicSuffix: TopicSuffix,
  payload: any,
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
