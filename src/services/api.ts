import axios, { AxiosError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { tokenServices } from "./tokenService"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 50000,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenServices.getAccessToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenServices.clear()
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default api
