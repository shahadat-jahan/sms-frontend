import { api } from './client'
import type { Paginated, Student, StudentFilters, StudentPayload } from '../types/api'

export async function fetchStudents(filters: StudentFilters): Promise<Paginated<Student>> {
  const { data } = await api.get<Paginated<Student>>('/students', { params: filters })

  return data
}

export async function fetchStudent(id: number): Promise<Student> {
  const { data } = await api.get<{ data: Student }>(`/students/${id}`)

  return data.data
}

export async function createStudent(payload: StudentPayload): Promise<Student> {
  const { data } = await api.post<{ data: Student }>('/students', payload)

  return data.data
}

export async function updateStudent(
  id: number,
  payload: Partial<StudentPayload>,
): Promise<Student> {
  const { data } = await api.put<{ data: Student }>(`/students/${id}`, payload)

  return data.data
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`)
}

export async function importStudents(
  file: File,
): Promise<{ message: string; imported: number }> {
  const body = new FormData()
  body.append('file', file)

  const { data } = await api.post<{ message: string; imported: number }>('/students/import', body)

  return data
}

export async function exportStudents(): Promise<{ blob: Blob; filename: string }> {
  const response = await api.get<Blob>('/students/export', { responseType: 'blob' })

  return {
    blob: response.data,
    filename: filenameFrom(response.headers['content-disposition']),
  }
}

export async function myProfile(): Promise<Student> {
  const { data } = await api.get<{ data: Student }>('/my-profile')

  return data.data
}

function filenameFrom(disposition: unknown): string {
  if (typeof disposition === 'string') {
    const match = /filename="?([^";]+)"?/.exec(disposition)

    if (match?.[1] !== undefined) {
      return match[1]
    }
  }

  return 'students.csv'
}
