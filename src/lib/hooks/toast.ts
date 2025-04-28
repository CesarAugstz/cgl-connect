import { ExternalToast, toast } from 'sonner'

export function useToast() {
  function loading(message: string, options?: ExternalToast) {
    toast.loading(message, options)
  }
  function error(message: string, options?: ExternalToast) {
    toast.error(message, options)
  }
  function success(message: string, options?: ExternalToast) {
    toast.success(message, options)
  }
  function info(message: string, options?: ExternalToast) {
    toast.info(message, options)
  }
  function exception(error: any) {
    switch (true) {
      case error?.info?.rejectedByPolicy:
        return toast.error('Você não tem permissão para executar esta ação.')

      case error?.info?.message:
        return toast.error(error.info.message)

      case error?.message:
        return toast.error(error.error.message)

      default:
        return toast.error('Ocorreu um erro. Por favor, tente novamente.')
    }
  }
  return {
    loading,
    error,
    success,
    info,
    exception,
  }
}
