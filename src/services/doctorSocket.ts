import { io, type Socket } from "socket.io-client"
import { tokenServices } from "./tokenService"

/** Payload from backend `WsGateway.sendNewAppointment` → `new-appointment` */
export type NewAppointmentSocketPayload = {
  patient?: string
  phone?: string
  time?: string
  token?: string
  date?: string
  symptoms?: string
}

function socketBaseUrl(): string | undefined {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined
  if (explicit?.trim()) return explicit.trim()
  const api = import.meta.env.VITE_API_URL as string | undefined
  if (api?.trim()) return api.trim()
  return "http://localhost:3000"
}

/**
 * Subscribes to the Nest doctor room (`join-doctor` → `doctor-${id}`) and
 * handles `new-appointment` plus optional legacy refresh event names.
 */
export function subscribeDoctorAppointmentEvents(
  doctorId: string,
  handlers: {
    onRefetch: () => void
    onNewAppointment?: (payload: NewAppointmentSocketPayload) => void
  }
): () => void {
  const url = socketBaseUrl()
  if (!url) return () => {}

  const token = tokenServices.getAccessToken()
  const socket: Socket = io(url, {
    auth: { token },
    autoConnect: true,
    transports: ["websocket", "polling"],
  })

  const refetch = () => handlers.onRefetch()

  const onNew = (payload: unknown) => {
    const p =
      payload && typeof payload === "object"
        ? (payload as NewAppointmentSocketPayload)
        : {}
    handlers.onNewAppointment?.(p)
    refetch()
  }

  const onConnect = () => {
    socket.emit("join-doctor", doctorId)
  }

  socket.on("connect", onConnect)
  socket.on("new-appointment", onNew)

  const legacy = [
    "appointments:refresh",
    "appointment:created",
    "appointment:updated",
    "appointment:cancelled",
  ] as const
  for (const ev of legacy) {
    socket.on(ev, refetch)
  }

  if (socket.connected) {
    onConnect()
  }

  return () => {
    socket.off("connect", onConnect)
    socket.off("new-appointment", onNew)
    for (const ev of legacy) {
      socket.off(ev, refetch)
    }
    socket.disconnect()
  }
}
