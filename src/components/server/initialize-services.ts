import {
  initializeMqttService,
  initializeTuyaService,
} from '@/server/actions/mqtt-actions'

export async function InitializeServices() {
  await initializeMqttService()
  await initializeTuyaService()

  return null
}
