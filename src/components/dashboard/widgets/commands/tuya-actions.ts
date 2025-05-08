'use server'

import { getTuyaService } from '@/server/tuya'
import { TopicSuffix } from '@prisma/client'

export async function sendTuyaCommand(
  deviceId: string,
  topicSuffix: TopicSuffix,
  payload: any,
) {
  try {
    const service = getTuyaService()
    const success = await service.sendCommand(deviceId, topicSuffix, payload)
    return { success }
  } catch (error) {
    console.error('Failed to send Tuya command:', error)
    return { success: false, error: String(error) }
  }
}
