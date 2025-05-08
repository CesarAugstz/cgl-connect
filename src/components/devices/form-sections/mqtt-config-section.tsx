import { TopicSuffix } from '@prisma/client'
import { FormLabel, FormDescription } from '@/components/ui/form'
import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'
import { Badge } from '@/components/ui/badge'
import { FormText } from '@/components/ui/form-fields/form-text'

interface MqttConfigSectionProps {
  deviceTypeId: string
  selectedTopicSuffixes: TopicSuffix[]
  isTuyaDevice: boolean
}

export function MqttConfigSection({
  deviceTypeId,
  selectedTopicSuffixes,
  isTuyaDevice,
}: MqttConfigSectionProps) {
  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-lg font-medium">Configuração de Comunicação</h3>

      {isTuyaDevice ? (
        <div className="space-y-4">
          <FormText
            name="tuyaId"
            label="ID do Dispositivo Tuya"
            placeholder="ex: eb3fa211f18580f8aazsqj"
            description="ID do dispositivo na plataforma Tuya"
            required
          />
          <FormDescription className="mt-2">
            Este dispositivo será gerenciado através da API Tuya Cloud.
          </FormDescription>
        </div>
      ) : (
        <>
          <FormText
            name="baseTopic"
            label="Tópico Base MQTT"
            placeholder="ex: casa/sala/dispositivo1"
            description="Tópico base para este dispositivo (ex: casa/sala/dispositivo1)"
            required
          />

          {deviceTypeId && (
            <div>
              <FormLabel className="block mb-2">Tópicos Disponíveis</FormLabel>
              <div className="bg-gray-50 p-3 rounded-md">
                {selectedTopicSuffixes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTopicSuffixes.map(suffix => (
                      <Badge key={suffix} className="flex items-center">
                        <div className="text-sm">
                          {topicSuffixToPath[suffix]}
                        </div>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Nenhum tópico disponível para este tipo de dispositivo
                  </div>
                )}
              </div>
              <FormDescription className="mt-2">
                Esses tópicos serão determinados pelo tipo de dispositivo e
                serão configurados automaticamente.
              </FormDescription>
            </div>
          )}
        </>
      )}
    </div>
  )
}
