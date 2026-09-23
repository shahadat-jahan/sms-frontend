import axios from 'axios'
import { clearSession, getToken } from '../auth/session'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
})

// Every request carries the Sanctum personal access token.
api.interceptors.request.use((config) => {
  const token = getToken()

  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// A revoked or missing token always means: go back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && getToken() !== null) {
      clearSession()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined

    return data?.message ?? error.message
  }

  return fallback
}

export function apiValidationErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string[]> } | undefined

    return data?.errors ?? {}
  }

  return {}
}
