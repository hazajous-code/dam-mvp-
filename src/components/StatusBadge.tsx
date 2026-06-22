import {
  STATUS_STYLES,
  QA_STYLES,
  WCM_STYLES,
  SEVERITY_STYLES,
  CHECK_STYLES,
} from '../utils/format'
import type {
  ProjectStatus,
  QAResult,
  WcmStatus,
  Severity,
} from '../types'

interface Props {
  label: string
  kind?: 'status' | 'qa' | 'wcm' | 'severity' | 'check' | 'plain'
  className?: string
}

export default function StatusBadge({ label, kind = 'plain', className = '' }: Props) {
  let style = 'bg-slate-100 text-slate-600 border-slate-200'
  if (kind === 'status') style = STATUS_STYLES[label as ProjectStatus] ?? style
  else if (kind === 'qa') style = QA_STYLES[label as QAResult] ?? style
  else if (kind === 'wcm') style = WCM_STYLES[label as WcmStatus] ?? style
  else if (kind === 'severity') style = SEVERITY_STYLES[label as Severity] ?? style
  else if (kind === 'check') style = CHECK_STYLES[label as keyof typeof CHECK_STYLES] ?? style

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  )
}
