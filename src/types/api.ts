/* Response shapes returned by the Laravel API (see sms-api/README.md). */

export type Role = 'admin' | 'student'

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Student {
  id: number
  roll: string
  class: string
  section: string | null
  phone: string | null
  address: string | null
  user: User
  created_at: string
  updated_at: string
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface Paginated<T> {
  data: T[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface LoginResponse {
  user: User
  token: string
}

export interface StudentPayload {
  name: string
  email: string
  password?: string
  roll: string
  class: string
  section: string
  phone: string
  address: string
}

export interface StudentFilters {
  search?: string
  class?: string
  section?: string
  per_page?: number
  page?: number
}

/** Laravel 422 body. Import errors are keyed by line, e.g. "line 3". */
export interface ErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
