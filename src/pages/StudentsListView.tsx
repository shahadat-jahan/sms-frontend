import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiErrorMessage, apiValidationErrors } from '../api/client.ts'
import {
  createStudent,
  deleteStudent,
  exportStudents,
  fetchStudents,
  importStudents,
  updateStudent,
} from '../api/students.ts'
import Alert from '../components/Alert.tsx'
import NoticeDialog from '../components/NoticeDialog.tsx'
import Pagination from '../components/Pagination.tsx'
import StudentForm from '../components/StudentForm.tsx'
import type { Paginated, Student, StudentPayload } from '../types/api.ts'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

type Banner = { tone: 'error' | 'success' | 'info'; text: string }

export default function StudentsListView() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Paginated<Student> | null>(null)
  const [search, setSearch] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [section, setSection] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionBusy, setActionBusy] = useState(false)
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const [banner, setBanner] = useState<Banner | null>(null)

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<Student | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [noticeOpen, setNoticeOpen] = useState(false)
  
  const requestKey = JSON.stringify([search, studentClass, section, perPage, page, reloadKey])
  const busy = actionBusy || settledKey !== requestKey

  useEffect(() => {
    let stale = false

    fetchStudents({
      search: search || undefined,
      class: studentClass || undefined,
      section: section || undefined,
      per_page: perPage,
      page,
    })
      .then((data) => {
        if (!stale) setRows(data)
      })
      .catch((caught: unknown) => {
        if (!stale) setBanner({ tone: 'error', text: apiErrorMessage(caught, 'Could not load students.') })
      })
      .finally(() => {
        if (!stale) setSettledKey(requestKey)
      })

    return () => {
      stale = true
    }
  }, [search, studentClass, section, perPage, page, reloadKey, requestKey])

  function reload(): void {
    setReloadKey((key) => key + 1)
  }

  function closeForm(): void {
    setView('list')
    setEditing(null)
    setFormError(null)
    setFieldErrors({})
  }

  async function handleCreate(payload: StudentPayload): Promise<void> {
    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})

    try {
      await createStudent(payload)

      setBanner({ tone: 'success', text: `${payload.name} created.` })
      closeForm()
      reload()
    } catch (caught) {
      setFormError(apiErrorMessage(caught, 'The student could not be created.'))
      setFieldErrors(apiValidationErrors(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(payload: StudentPayload): Promise<void> {
    if (editing === null) return

    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})

    try {
      await updateStudent(editing.id, payload)

      setBanner({ tone: 'success', text: `${payload.name} updated.` })
      closeForm()
      reload()
    } catch (caught) {
      setFormError(apiErrorMessage(caught, 'The student could not be updated.'))
      setFieldErrors(apiValidationErrors(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(student: Student): Promise<void> {
    if (!window.confirm(`Delete ${student.user.name} (${student.roll})?`)) return

    setActionBusy(true)

    try {
      await deleteStudent(student.id)

      setBanner({ tone: 'success', text: 'Student deleted.' })
      reload()
    } catch (caught) {
      setBanner({ tone: 'error', text: apiErrorMessage(caught, 'The student could not be deleted.') })
    } finally {
      setActionBusy(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]

    event.target.value = ''
    if (file === undefined) return

    setActionBusy(true)

    try {
      const result = await importStudents(file)

      setBanner({ tone: 'success', text: result.message })
      reload()
    } catch (caught) {
      setBanner({ tone: 'error', text: apiErrorMessage(caught, 'The CSV could not be imported.') })
    } finally {
      setActionBusy(false)
    }
  }

  async function handleExport(): Promise<void> {
    setActionBusy(true)

    try {
      const { blob, filename } = await exportStudents()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.click()

      URL.revokeObjectURL(url)
    } catch (caught) {
      setBanner({ tone: 'error', text: apiErrorMessage(caught, 'The CSV could not be exported.') })
    } finally {
      setActionBusy(false)
    }
  }

  if (view !== 'list') {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {view === 'create' ? 'Add student' : `Edit ${editing?.user.name ?? ''}`}
          </h1>
          <p className="text-sm text-slate-600">
            {view === 'create'
              ? 'Create a new student account and record.'
              : `Editing roll ${editing?.roll ?? ''}.`}
          </p>
        </div>

        <StudentForm
          mode={view === 'create' ? 'create' : 'edit'}
          initial={editing ?? undefined}
          submitting={submitting}
          error={formError}
          fieldErrors={fieldErrors}
          onSubmit={view === 'create' ? handleCreate : handleUpdate}
          onCancel={closeForm}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Students</h1>
          <p className="text-sm text-slate-600">Search, manage and message your student roster.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('create')}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Add student
          </button>
          <label className="cursor-pointer rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Import CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setNoticeOpen(true)}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Send notice
          </button>
        </div>
      </div>

      {banner !== null ? (
        <Alert tone={banner.tone} className="flex items-start justify-between gap-3">
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
            className="text-slate-400 transition hover:text-slate-600"
          >
            ✕
          </button>
        </Alert>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search name, email or roll…"
            aria-label="Search"
            className={`${inputClass} sm:w-64`}
          />
          <input
            value={studentClass}
            onChange={(event) => {
              setStudentClass(event.target.value)
              setPage(1)
            }}
            placeholder="Class"
            aria-label="Class"
            className={`${inputClass} w-32`}
          />
          <input
            value={section}
            onChange={(event) => {
              setSection(event.target.value)
              setPage(1)
            }}
            placeholder="Section"
            aria-label="Section"
            className={`${inputClass} w-28`}
          />
          <select
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value))
              setPage(1)
            }}
            aria-label="Per page"
            className={`${inputClass} w-28`}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStudentClass('')
              setSection('')
              setPage(1)
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>

        {rows === null ? (
          <p className="p-8 text-center text-sm text-slate-500">
            {busy ? 'Loading students…' : 'No students found.'}
          </p>
        ) : rows.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No students found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Roll</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.data.map((student) => (
                    <tr key={student.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{student.roll}</td>
                      <td className="px-4 py-3 text-slate-700">{student.user.name}</td>
                      <td className="px-4 py-3 text-slate-500">{student.user.email}</td>
                      <td className="px-4 py-3 text-slate-700">{student.class}</td>
                      <td className="px-4 py-3 text-slate-500">{student.section || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{student.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(student)
                              setFormError(null)
                              setFieldErrors({})
                              setView('edit')
                            }}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(student)}
                            className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination meta={rows.meta} busy={busy} onPageChange={setPage} />
          </>
        )}
      </section>

      {noticeOpen ? (
        <NoticeDialog
          onClose={() => setNoticeOpen(false)}
          onSent={(message) => {
            setNoticeOpen(false)
            setBanner({ tone: 'success', text: message })
          }}
        />
      ) : null}
    </div>
  )
}
