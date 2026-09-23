import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Student, StudentPayload } from '../types/api.ts'
import Alert from './Alert.tsx'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

interface StudentFormProps {
  mode: 'create' | 'edit'
  initial?: Student
  submitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]>
  onSubmit: (payload: StudentPayload) => void
  onCancel: () => void
}

export default function StudentForm({
  mode,
  initial,
  submitting,
  error,
  fieldErrors,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const [name, setName] = useState(initial?.user.name ?? '')
  const [email, setEmail] = useState(initial?.user.email ?? '')
  const [password, setPassword] = useState('')
  const [roll, setRoll] = useState(initial?.roll ?? '')
  const [studentClass, setStudentClass] = useState(initial?.class ?? '')
  const [section, setSection] = useState(initial?.section ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const payload: StudentPayload = {
      name,
      email,
      roll,
      class: studentClass,
      section,
      phone,
      address,
    }

    if (mode === 'create') {
      payload.password = password
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error !== null ? <Alert tone="error">{error}</Alert> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Account</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={fieldErrors.name}>
            <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} required />
          </Field>

          <Field label="Email" error={fieldErrors.email}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              required
            />
          </Field>

          {mode === 'create' ? (
            <Field label="Password" error={fieldErrors.password} hint="At least 6 characters. The student uses it to log in.">
              <input
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                required
              />
            </Field>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Academic</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Roll number" error={fieldErrors.roll}>
            <input value={roll} onChange={(event) => setRoll(event.target.value)} className={inputClass} required />
          </Field>

          <Field label="Class" error={fieldErrors.class}>
            <input
              value={studentClass}
              onChange={(event) => setStudentClass(event.target.value)}
              className={inputClass}
              placeholder="Class 10"
              required
            />
          </Field>

          <Field label="Section" error={fieldErrors.section}>
            <input value={section} onChange={(event) => setSection(event.target.value)} className={inputClass} placeholder="A" />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" error={fieldErrors.phone}>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
          </Field>

          <Field label="Address" error={fieldErrors.address}>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={`${inputClass} min-h-20`}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create student' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  error?: string[]
  hint?: string
  children: ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint !== undefined ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error !== undefined ? <span className="mt-1 block text-xs text-rose-600">{error[0]}</span> : null}
    </label>
  )
}
