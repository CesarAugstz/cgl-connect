'use server'

import { getMqttService, startMqttService } from '@/server/mqtt'
import { getTuyaService, startTuyaService } from '@/server/tuya'

let mqttInitialized = false
let tuyaInitialized = false

/**
 * Initialize the MQTT service (server-only)
 */
export async function initializeMqttService() {
  console.log('call initialize mqtt')
  if (mqttInitialized) return
  try {
    await startMqttService()
    mqttInitialized = true
    console.log('MQTT service initialized successfully')
  } catch (error) {
    console.error('Failed to initialize MQTT service:', error)
  }

  return { initialized: mqttInitialized }
}

/**
 * Initialize the Tuya service (server-only)
 */
export async function initializeTuyaService() {
  console.log('call initialize tuya')
  if (tuyaInitialized) return
  try {
    await startTuyaService()
    tuyaInitialized = true
    console.log('Tuya service initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Tuya service:', error)
  }

  return { initialized: tuyaInitialized }
}

/**
 * Get the MQTT service status
 */
export async function getMqttServiceStatus() {
  if (!mqttInitialized) {
    return { status: 'not_initialized' }
  }

  try {
    const service = getMqttService()
    const isRunning = service.isRunning ? 'running' : 'stopped'
    return {
      status: isRunning,
      connected: service.isClientConnected(),
    }
  } catch (error) {
    return { status: 'error', error: String(error) }
  }
}

/**
 * Get the Tuya service status
 */
export async function getTuyaServiceStatus() {
  if (!tuyaInitialized) {
    return { status: 'not_initialized' }
  }

  try {
    const service = getTuyaService()
    const isRunning = service.isRunning ? 'running' : 'stopped'
    return {
      status: isRunning,
    }
  } catch (error) {
    return { status: 'error', error: String(error) }
  }
}
