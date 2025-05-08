import { TuyaService } from './tuya-service'

let tuyaServiceInstance: TuyaService | null = null

export function getTuyaService(): TuyaService {
  if (!tuyaServiceInstance) {
    tuyaServiceInstance = new TuyaService({
      baseUrl: process.env.TUYA_BASEURL || 'https://openapi.tuyaus.com',
      accessKey: process.env.TUYA_CLIENTID || '',
      secretKey: process.env.TUYA_SECRET || '',
    })
  }

  return tuyaServiceInstance
}

export async function startTuyaService(): Promise<void> {
  const service = getTuyaService()
  await service.start()
}
