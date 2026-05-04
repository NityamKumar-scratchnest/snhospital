import axios, { AxiosError } from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { tokenServices } from "./tokenService"

const api = axios.create({
  baseURL: "https://api.siro.care",
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
      const path = window.location.pathname
      window.location.href = path.startsWith("/doctor") ? "/doctor/login" : "/login"
    }

    return Promise.reject(error)
  }
)

export default api
