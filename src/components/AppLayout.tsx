import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth.ts'
import { clearSession, getUser } from '../auth/session.ts'

export default function AppLayout() {
  const user = getUser()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout(): Promise<void> {
    setLoggingOut(true)

    try {
      await logout()
    } catch {
      // The local session is dropped even when the API call fails.
    } finally {
      clearSession()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                SMS
              </span>
              <span className="hidden sm:inline">School Management</span>
            </span>

            <nav className="flex items-center gap-1">
              {user?.role === 'admin' ? (
                <NavLink
                  to="/students"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  Students
                </NavLink>
              ) : null}

              {(
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  My profile
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name ?? 'Signed in'}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role ?? ''}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
