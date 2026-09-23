import type { Role, User } from '../types/api'

const TOKEN_KEY = 'sms.token'
const USER_KEY = 'sms.user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)

  if (raw === null) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

/** Route a given role lands on after signing in (and at "/"). */
export function homePathFor(role: Role): string {
  return role === 'admin' ? '/students' : '/profile'
}
