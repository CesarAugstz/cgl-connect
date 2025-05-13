import { TopicSuffix } from '@prisma/client'

export const topicSuffixToPath: Record<TopicSuffix, string> = {
  STATUS_ONOFF: 'status/onoff',
  STATUS_BRIGHTNESS: 'status/brightness',
  STATUS_COLOR: 'status/color',
  STATUS_TEMPERATURE: 'status/temperature',
  STATUS_LIGHT_TEMPERATURE: 'status/light-temperature',
  STATUS_HUMIDITY: 'status/humidity',
  COMMAND_ONOFF: 'command/onoff',
  COMMAND_BRIGHTNESS: 'command/brightness',
  COMMAND_COLOR: 'command/color',
  COMMAND_TEMPERATURE: 'command/temperature',
  COMMAND_LIGHT_TEMPERATURE: 'command/light-temperature',
}

export const pathToTopicSuffix: Record<string, TopicSuffix> = Object.entries(
  topicSuffixToPath,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key as TopicSuffix
    return acc
  },
  {} as Record<string, TopicSuffix>,
)

export function extractTopicSuffix(
  fullTopic: string,
  baseTopic: string,
): TopicSuffix | undefined {
  if (!fullTopic.startsWith(baseTopic + '/')) {
    return undefined
  }

  const path = fullTopic.substring(baseTopic.length + 1)
  return pathToTopicSuffix[path]
}
