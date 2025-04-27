import { FormText } from '@/components/ui/form-fields/form-text'
import { FormTextarea } from '@/components/ui/form-fields/form-textarea'

export function DeviceBasicInfoSection() {
  return (
    <>
      <FormText
        name="name"
        label="Nome"
        placeholder="Digite o nome do dispositivo"
        required
      />

      <FormTextarea
        name="description"
        label="Descrição"
        placeholder="Digite a descrição do dispositivo (opcional)"
      />
    </>
  )
}
