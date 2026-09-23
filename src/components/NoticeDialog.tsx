import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { apiErrorMessage, apiValidationErrors } from '../api/client.ts'
import { sendNotice } from '../api/notices.ts'
import Alert from './Alert.tsx'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

interface NoticeDialogProps {
  onClose: () => void
  onSent: (message: string) => void
}

export default function NoticeDialog({ onClose, onSent }: NoticeDialogProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [sending, setSending] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSending(true)
    setError(null)
    setFieldErrors({})

    try {
      const result = await sendNotice(subject, message)
      onSent(result.message)
    } catch (caught) {
      setError(apiErrorMessage(caught, 'The notice could not be sent.'))
      setFieldErrors(apiValidationErrors(caught))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Send notice to all students</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            {error !== null ? <Alert tone="error">{error}</Alert> : null}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={inputClass}
                placeholder="Sports day moved"
                required
              />
              {fieldErrors.subject !== undefined ? (
                <span className="mt-1 block text-xs text-rose-600">{fieldErrors.subject[0]}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={`${inputClass} min-h-28`}
                placeholder="The sports day moves to Friday."
                required
              />
              {fieldErrors.message !== undefined ? (
                <span className="mt-1 block text-xs text-rose-600">{fieldErrors.message[0]}</span>
              ) : null}
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
