import { useFormContext } from 'react-hook-form'
import { TopicSuffix } from '@prisma/client'
import { FormLabel, FormDescription } from '@/components/ui/form'
import { topicSuffixToPath } from '@/lib/mqtt/topicMapping'
import { Badge } from '@/components/ui/badge'
import { FormText } from '@/components/ui/form-fields/form-text'

interface MqttConfigSectionProps {
  deviceTypeId: string
  selectedTopicSuffixes: TopicSuffix[]
}

export function MqttConfigSection({ 
  deviceTypeId,
  selectedTopicSuffixes 
}: MqttConfigSectionProps) {
  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-lg font-medium">Configuração MQTT</h3>

      <FormText
        name="baseTopic"
        label="Tópico Base"
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
                {selectedTopicSuffixes.map((suffix) => (
                  <Badge key={suffix} className="flex items-center">
                    <div className="text-sm">{topicSuffixToPath[suffix]}</div>
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
            Esses tópicos serão determinados pelo tipo de dispositivo e serão configurados automaticamente.
          </FormDescription>
        </div>
      )}
    </div>
  )
}
