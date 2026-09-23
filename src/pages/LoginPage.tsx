import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth.ts'
import { apiErrorMessage, apiValidationErrors } from '../api/client.ts'
import { getUser, homePathFor, isAuthenticated, saveSession } from '../auth/session.ts'
import Alert from '../components/Alert.tsx'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

interface LoginLocationState {
  /** Path ProtectedRoute came from, so login can send the user back. */
  from?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginLocationState | null
  const from = state?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const user = getUser()

  // A signed-in visitor never sees the login form again.
  if (isAuthenticated() && user !== null) {
    return <Navigate to={from ?? homePathFor(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const session = await login(email, password)

      saveSession(session.token, session.user)
      navigate(from ?? homePathFor(session.user.role), { replace: true })
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Unable to sign in. Please try again.'))
      setFieldErrors(apiValidationErrors(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            SMS
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">School Management System</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your school account to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error !== null ? <Alert tone="error">{error}</Alert> : null}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="admin@school.test"
              required
            />
            {fieldErrors.email !== undefined ? (
              <span className="mt-1 block text-xs text-rose-600">{fieldErrors.email[0]}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              required
            />
            {fieldErrors.password !== undefined ? (
              <span className="mt-1 block text-xs text-rose-600">{fieldErrors.password[0]}</span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
