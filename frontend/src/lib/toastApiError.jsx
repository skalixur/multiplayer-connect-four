import WarningAlert from "@/components/WarningAlert"
import { toast } from "sonner"

export default function toastApiError(apiResponse) {
  if (
    (apiResponse && !apiResponse.ok) ||
    !apiResponse ||
    apiResponse?.response?.data?.detail
  ) {
    const apiResponseData = apiResponse?.response?.data?.detail
    if (apiResponseData) {
      toastError(apiResponseData?.data?.messages ?? ["Something went wrong"])
    } else {
      toastError(apiResponse?.data?.messages ?? ["Something went wrong"])
    }

    return apiResponseData
  }

  return apiResponse
}

export function toastError(errorMessages) {
  const errorMessage = errorMessages.join(", ")
  toast(<WarningAlert>{errorMessage}</WarningAlert>)
}
