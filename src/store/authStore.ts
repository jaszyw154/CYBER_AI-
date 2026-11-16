import { create } from 'zustand'
import { getBackendUrl } from '../services/socket'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  role: string
  created_at: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, display_name?: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setToken: (token: string | null) => void
  initialize: () => Promise<void>
}

function apiUrl(path: string) {
  return `${getBackendUrl()}${path}`
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  setToken: (token) => set({ token }),

  initialize: async () => {
    const stored = sessionStorage.getItem('cyberai_token')
    if (stored) {
      set({ token: stored })
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${stored}` },
        })
        if (res.ok) {
          const user = await res.json()
          set({ user, initialized: true })
          return
        }
      } catch {
        // token invalid — clear it
      }
      sessionStorage.removeItem('cyberai_token')
    }
    set({ token: null, user: null, initialized: true })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Authentication failed')
      }
      const data = await res.json()
      sessionStorage.setItem('cyberai_token', data.access_token)
      set({ token: data.access_token })
      const meRes = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (meRes.ok) {
        const user = await meRes.json()
        set({ user, loading: false })
      } else {
        set({ loading: false })
      }
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  register: async (email, password, display_name) => {
    set({ loading: true })
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: display_name || '' }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Registration failed')
      }
      set({ loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: async () => {
    sessionStorage.removeItem('cyberai_token')
    try {
      await fetch(apiUrl('/api/auth/logout'), { method: 'POST' })
    } catch {
      // ignore
    }
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const { token } = get()
    if (!token) return
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const user = await res.json()
        set({ user })
      }
    } catch {
      // ignore
    }
  },
}))
