import toastApiError from "./toastApiError"

export default function withErrorHandling(requestFunction) {
  return async function (...args) {
    try {
      return await requestFunction(...args)
    } catch (error) {
      toastApiError(error)
      return false
    }
  }
}
