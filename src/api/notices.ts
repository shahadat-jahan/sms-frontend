import { api } from './client'

export interface NoticeResult {
  message: string
  sent: number
  failed: number
}

export async function sendNotice(subject: string, message: string): Promise<NoticeResult> {
  const { data } = await api.post<NoticeResult>('/notices/send', { subject, message })

  return data
}
