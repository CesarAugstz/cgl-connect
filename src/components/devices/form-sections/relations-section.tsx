import { FormSelect } from "@/components/ui/form-fields/form-select"
import { DeviceType, User, Location } from "@prisma/client"

interface DeviceRelationsSectionProps {
  deviceTypes: DeviceType[]
  locations: Location[]
  users: User[]
  onDeviceTypeChange: (deviceTypeId: string) => void
}

export function DeviceRelationsSection({
  deviceTypes,
  locations,
  users,
  onDeviceTypeChange
}: DeviceRelationsSectionProps) {
  const deviceTypeOptions = deviceTypes.map(type => ({
    value: type.id,
    label: type.name
  }))
  
  const locationOptions = locations.map(location => ({
    value: location.id,
    label: location.name
  }))
  
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.name || user.email
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect
        name="deviceTypeId"
        label="Tipo de Dispositivo"
        placeholder="Selecione o tipo de dispositivo"
        options={deviceTypeOptions}
        required
        onValueChange={onDeviceTypeChange}
      />

      <FormSelect
        name="locationId"
        label="Localização"
        placeholder="Selecione a localização"
        options={locationOptions}
        includeEmpty={true}
      />

      <FormSelect
        name="userId"
        label="Usuário"
        placeholder="Selecione o usuário"
        options={userOptions}
        includeEmpty={true}
      />
    </div>
  )
}
