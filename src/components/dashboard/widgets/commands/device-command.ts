'use server'

import { db } from '@/server/db'
import { publishMqtt } from './actions'
import { sendTuyaCommand } from './tuya-actions'
import { TopicSuffix } from '@prisma/client'

interface Props {
  deviceId: string
  topicSuffix: TopicSuffix
  payload: any
}

export async function sendDeviceCommand({
  deviceId,
  topicSuffix,
  payload,
}: Props) {
  try {
    const device = await db.device.findUnique({
      where: { id: deviceId },
      include: { deviceType: true },
    })

    if (!device) {
      throw new Error(`Device ${deviceId} not found`)
    }

    if (device.deviceType.isTuya && device.tuyaId)
      return await sendTuyaCommand(deviceId, topicSuffix, payload)

    return await publishMqtt(deviceId, topicSuffix as any, payload)
  } catch (error) {
    console.error('Failed to send device command:', error)
    return { success: false, error: String(error) }
  }
}
