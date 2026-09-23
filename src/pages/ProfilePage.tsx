import { useEffect, useState } from 'react'
import { me } from '../api/auth.ts'
import { apiErrorMessage } from '../api/client.ts'
import { myProfile } from '../api/students.ts'
import { getUser } from '../auth/session.ts'
import Alert from '../components/Alert.tsx'
import type { Student, User } from '../types/api.ts'

export default function ProfilePage() {
  const user = getUser()
  const isAdmin = user?.role === 'admin'

  const [account, setAccount] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (isAdmin) {
      me()
        .then((data) => {
          if (!cancelled) {
            setAccount(data)
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(apiErrorMessage(caught, 'Your account could not be loaded.'))
          }
        })
    } else {
      myProfile()
        .then((data) => {
          if (!cancelled) {
            setStudent(data)
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(apiErrorMessage(caught, 'Your profile could not be loaded.'))
          }
        })
    }

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  if (error !== null) {
    return (
      <Alert tone="error" title="Something went wrong">
        {error}
      </Alert>
    )
  }

  if (isAdmin) {
    if (account === null) {
      return <p className="text-sm text-slate-500">Loading your profile…</p>
    }

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-600">Your administrator account details.</p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Account
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Full name" value={account.name} />
            <Detail label="Email" value={account.email} />
            <Detail label="Role" value={account.role.toUpperCase()} />
            <Detail label="User ID" value={String(account.id)} />
          </dl>
        </section>
      </div>
    )
  }

  if (student === null) {
    return <p className="text-sm text-slate-500">Loading your profile…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My profile</h1>
        <p className="text-sm text-slate-600">The student record linked to your account.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Account
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Full name" value={student.user.name} />
          <Detail label="Email" value={student.user.email} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Academic
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Roll number" value={student.roll} />
          <Detail label="Class" value={student.class} />
          <Detail label="Section" value={student.section ?? '—'} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contact
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Phone" value={student.phone ?? '—'} />
          <Detail label="Address" value={student.address ?? '—'} />
        </dl>
      </section>
    </div>
  )
}

interface DetailProps {
  label: string
  value: string
}

function Detail({ label, value }: DetailProps) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}
