import type {
  ProjectStatus,
  QAResult,
  WcmStatus,
  Severity,
} from '../types'

// 현재 데모 기준 날짜 (system reminder 기준)
export const DEMO_TODAY = '2026-06-22'

export function nowStamp(): string {
  // 데모 일관성을 위해 고정 날짜 + 의사 시간 사용
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${DEMO_TODAY} ${hh}:${mm}`
}

// 상태별 badge 색상 매핑 (Tailwind 클래스)
export const STATUS_STYLES: Record<ProjectStatus, string> = {
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  'Metadata Ready': 'bg-sky-50 text-sky-700 border-sky-200',
  'Asset Uploading': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Gatekeeping In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Exception Review': 'bg-orange-50 text-orange-700 border-orange-200',
  'WCM QA Requested': 'bg-violet-50 text-violet-700 border-violet-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Transferred: 'bg-emerald-600 text-white border-emerald-600',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const QA_STYLES: Record<QAResult, string> = {
  'Auto Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Warning: 'bg-amber-50 text-amber-700 border-amber-200',
  'Exception Required': 'bg-orange-50 text-orange-700 border-orange-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  'Manual Review': 'bg-sky-50 text-sky-700 border-sky-200',
  Pending: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const WCM_STYLES: Record<WcmStatus, string> = {
  'QA Not Requested': 'bg-slate-100 text-slate-500 border-slate-200',
  'QA Requested': 'bg-violet-50 text-violet-700 border-violet-200',
  'In Review': 'bg-sky-50 text-sky-700 border-sky-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  'Revision Requested': 'bg-amber-50 text-amber-700 border-amber-200',
}

export const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
}

export const CHECK_STYLES = {
  pass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  fail: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const BU_COLORS: Record<string, string> = {
  MS: '#c96442', // Claude clay
  HS: '#0ea5e9',
  ES: '#10b981',
}

export function pct(n: number): string {
  return `${Math.round(n)}%`
}
