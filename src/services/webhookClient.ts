import axios from "axios"

/** Public webhook calls (no auth) — clinic chat booking from the landing page. */
export const webhookClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 45000,
})
