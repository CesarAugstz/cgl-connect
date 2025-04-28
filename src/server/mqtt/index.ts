import { MqttService } from './mqtt-service';

let mqttServiceInstance: MqttService | null = null;

export function getMqttService(): MqttService {
  if (!mqttServiceInstance) {
    mqttServiceInstance = new MqttService({
      brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clientId: process.env.MQTT_CLIENT_ID,
    });
  }
  
  return mqttServiceInstance;
}

export async function startMqttService(): Promise<void> {
  const service = getMqttService();
  await service.start();
}
