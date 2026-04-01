const ACCESS_TOKEN = "accessToken"
const USER = "user"

export const tokenServices = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),

  setToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN, token)
  },

  setUser: (user: unknown) => {
    localStorage.setItem(USER, JSON.stringify(user))
  },

  getUser: <T = unknown>(): T | null => {
    const user = localStorage.getItem(USER)
    return user ? (JSON.parse(user) as T) : null
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(USER)
  },
}
