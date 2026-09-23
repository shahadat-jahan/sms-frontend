import type { PaginationMeta } from '../types/api.ts'

interface PaginationProps {
  meta: PaginationMeta
  busy: boolean
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, busy, onPageChange }: PaginationProps) {
  const { current_page: current, last_page: last, from, to, total } = meta

  if (total === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-900">{from ?? 0}</span>–
        <span className="font-medium text-slate-900">{to ?? 0}</span> of{' '}
        <span className="font-medium text-slate-900">{total}</span> students
      </p>

      <div className="flex items-center gap-1">
        <StepButton label="Previous" disabled={busy || current <= 1} onClick={() => onPageChange(current - 1)} />

        {pageWindow(current, last).map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              disabled={busy}
              aria-current={page === current ? 'page' : undefined}
              onClick={() => onPageChange(page)}
              className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                page === current ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <StepButton label="Next" disabled={busy || current >= last} onClick={() => onPageChange(current + 1)} />
      </div>
    </div>
  )
}

interface StepButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
}

function StepButton({ label, disabled, onClick }: StepButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}

function pageWindow(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  const candidates = [1, current - 1, current, current + 1, last].filter((page) => page >= 1 && page <= last)
  const unique = [...new Set(candidates)].sort((a, b) => a - b)

  return unique.flatMap((page, index): (number | 'gap')[] => {
    const previous = unique[index - 1]

    return previous !== undefined && page - previous > 1 ? ['gap', page] : [page]
  })
}
