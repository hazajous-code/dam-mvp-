import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  sub?: string
  accent?: 'default' | 'green' | 'amber' | 'red' | 'violet' | 'sky'
  icon?: ReactNode
}

const ACCENTS: Record<NonNullable<Props['accent']>, string> = {
  default: 'text-slate-900',
  green: 'text-emerald-600',
  amber: 'text-amber-600',
  red: 'text-rose-600',
  violet: 'text-violet-600',
  sky: 'text-sky-600',
}

export default function StatCard({ label, value, sub, accent = 'default', icon }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <p className={`mt-2 font-display text-2xl font-bold tabular-nums ${ACCENTS[accent]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
