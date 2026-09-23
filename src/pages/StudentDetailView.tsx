import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiErrorMessage } from '../api/client.ts'
import { fetchStudent } from '../api/students.ts'
import Alert from '../components/Alert.tsx'
import type { Student } from '../types/api.ts'

export default function StudentDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const studentId = Number(id)

    if (Number.isFinite(studentId)) {
      fetchStudent(studentId)
        .then((data) => {
          if (!cancelled) {
            setStudent(data)
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(apiErrorMessage(caught, 'That student could not be loaded.'))
          }
        })
    } else {
      setError('That student does not exist.')
    }

    return () => {
      cancelled = true
    }
  }, [id])

  if (error !== null) {
    return (
      <div className="space-y-4">
        <Alert tone="error" title="Something went wrong">
          {error}
        </Alert>
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to students
        </button>
      </div>
    )
  }

  if (student === null) {
    return <p className="text-sm text-slate-500">Loading student…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{student.user.name}</h1>
          <p className="text-sm text-slate-600">
            {student.roll} · {student.class}
            {student.section ? ` · Section ${student.section}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to students
        </button>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Record
        </h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Student ID" value={String(student.id)} />
          <Detail label="Created" value={formatDate(student.created_at)} />
          <Detail label="Updated" value={formatDate(student.updated_at)} />
        </dl>
      </section>
    </div>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
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