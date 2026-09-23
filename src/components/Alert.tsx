import type { ReactNode } from 'react'

type AlertTone = 'error' | 'success' | 'info'

const toneClasses: Record<AlertTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-slate-200 bg-white text-slate-700',
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  className?: string
  children: ReactNode
}

export default function Alert({ tone = 'info', title, className = '', children }: AlertProps) {
  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]} ${className}`}>
      {title !== undefined ? <p className="font-semibold">{title}</p> : null}
      <div className="space-y-1">{children}</div>
    </div>
  )
}
