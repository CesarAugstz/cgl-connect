import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DeviceStatus, TopicSuffix } from '@prisma/client'
import {
  useFindManyDeviceType,
  useFindManyLocation,
  useFindManyUser,
  useFindUniqueDevice,
  useCreateDevice,
  useUpdateDevice,
} from '@/lib/zenstack-hooks'

const formSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    description: z.string().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'UNKNOWN']),
    deviceTypeId: z.string({ required_error: 'Device type is required' }),
    locationId: z.string().optional().nullable(),
    userId: z.string().optional().nullable(),
    baseTopic: z.string().optional(),
    tuyaId: z.string().optional(),
  })
  .refine(
    data => {
      return !!data.baseTopic || !!data.tuyaId
    },
    {
      message: 'Either MQTT Base Topic or Tuya ID must be provided',
      path: ['baseTopic', 'tuyaId'],
    },
  )

export type DeviceFormValues = z.infer<typeof formSchema>

interface UseDeviceFormProps {
  deviceId?: string
  onSuccess: () => void
  isOpen: boolean
}

export function useDeviceForm({
  deviceId,
  onSuccess,
  isOpen,
}: UseDeviceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTopicSuffixes, setSelectedTopicSuffixes] = useState<
    TopicSuffix[]
  >([])
  const [isTuyaDevice, setIsTuyaDevice] = useState(false)

  const isEditMode = !!deviceId

  const { data: editingDeviceData, isLoading: loadingDevice } =
    useFindUniqueDevice(
      {
        where: { id: deviceId },
        include: {
          deviceType: true,
          location: true,
          user: true,
        },
      },
      {
        enabled: isEditMode && isOpen,
      },
    )

  const { data: deviceTypes, isLoading: loadingDeviceTypes } =
    useFindManyDeviceType()
  const { data: locations, isLoading: loadingLocations } = useFindManyLocation()
  const { data: users, isLoading: loadingUsers } = useFindManyUser()

  // Mutations
  const { mutate: createDevice } = useCreateDevice()
  const { mutate: updateDevice } = useUpdateDevice()

  // Form setup
  const methods = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'UNKNOWN' as DeviceStatus,
      deviceTypeId: '',
      locationId: null,
      userId: null,
      baseTopic: '',
      tuyaId: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return

    if (isEditMode && editingDeviceData) {
      const selectedDeviceType = deviceTypes?.find(
        dt => dt.id === editingDeviceData.deviceType.id,
      )
      const isTuya = selectedDeviceType?.isTuya || false
      setIsTuyaDevice(isTuya)

      methods.reset({
        name: editingDeviceData.name,
        description: editingDeviceData.description || '',
        status: editingDeviceData.status,
        deviceTypeId: editingDeviceData.deviceType.id,
        locationId: editingDeviceData.location?.id || null,
        userId: editingDeviceData.user?.id || null,
        baseTopic: editingDeviceData.baseTopic || '',
        tuyaId: editingDeviceData.tuyaId || '',
      })

      if (editingDeviceData.deviceType?.topicSuffixes)
        setSelectedTopicSuffixes(editingDeviceData.deviceType.topicSuffixes)

      return
    }

    methods.reset({
      name: '',
      description: '',
      status: 'UNKNOWN',
      deviceTypeId: '',
      locationId: null,
      userId: null,
      baseTopic: '',
      tuyaId: '',
    })
    setSelectedTopicSuffixes([])
    setIsTuyaDevice(false)
  }, [editingDeviceData, methods, isOpen, isEditMode, deviceTypes])

  const handleDeviceTypeChange = (deviceTypeId: string) => {
    const deviceType = deviceTypes?.find(dt => dt.id === deviceTypeId)

    if (deviceType) {
      setIsTuyaDevice(deviceType.isTuya || false)

      if (deviceType.topicSuffixes)
        return setSelectedTopicSuffixes(deviceType.topicSuffixes)

      return setSelectedTopicSuffixes([])
    }

    setSelectedTopicSuffixes([])
    setIsTuyaDevice(false)
  }

  const onSubmit = (values: DeviceFormValues) => {
    setIsSubmitting(true)

    const deviceFormattedData = {
      name: values.name,
      description: values.description,
      status: values.status,
      deviceTypeId: values.deviceTypeId,
      locationId: values.locationId || null,
      userId: values.userId || null,
      baseTopic: isTuyaDevice ? null : values.baseTopic,
      tuyaId: isTuyaDevice ? values.tuyaId : null,
    }

    if (isEditMode && editingDeviceData) {
      updateDevice(
        {
          where: { id: editingDeviceData.id },
          data: deviceFormattedData,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Error updating device:', error)
            setIsSubmitting(false)
          },
        },
      )
    } else {
      createDevice(
        {
          data: deviceFormattedData,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false)
            onSuccess()
          },
          onError: error => {
            console.error('Error creating device:', error)
            setIsSubmitting(false)
          },
        },
      )
    }
  }

  const isLoading =
    loadingDeviceTypes || loadingLocations || loadingUsers || loadingDevice

  return {
    methods,
    isSubmitting,
    isLoading,
    isEditMode,
    selectedTopicSuffixes,
    deviceTypes: deviceTypes || [],
    locations: locations || [],
    users: users || [],
    isTuyaDevice,
    handleDeviceTypeChange,
    onSubmit,
  }
}
