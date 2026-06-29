import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import DataTable, { type Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import type { Project, ProjectStatus, QAResult } from '../types'
import { CHANNELS, LOCALES } from '../data/mockMetadata'

const STATUSES: ProjectStatus[] = [
  'Draft', 'Metadata Ready', 'Asset Uploading', 'Gatekeeping In Progress',
  'Exception Review', 'WCM QA Requested', 'Approved', 'Transferred', 'Rejected',
]
const QA_RESULTS: QAResult[] = [
  'Auto Approved', 'Warning', 'Exception Required', 'Manual Review', 'Rejected', 'Pending',
]

export default function ProjectManagement() {
  const { visibleProjects: projects, role, buScope } = useApp()
  const nav = useNavigate()

  const [q, setQ] = useState('')
  const [bu, setBu] = useState('')
  const [status, setStatus] = useState('')
  const [locale, setLocale] = useState('')
  const [channel, setChannel] = useState('')
  const [qa, setQa] = useState('')
  const [exceptionOnly, setExceptionOnly] = useState(false)

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (q && !`${p.name} ${p.id} ${p.modelTool}`.toLowerCase().includes(q.toLowerCase())) return false
      if (bu && p.bu !== bu) return false
      if (status && p.status !== status) return false
      if (locale && p.locale !== locale) return false
      if (channel && p.publishingChannel !== channel) return false
      if (qa && p.qaResult !== qa) return false
      if (exceptionOnly && !(p.isException || p.qaResult === 'Exception Required')) return false
      return true
    })
  }, [projects, q, bu, status, locale, channel, qa, exceptionOnly])

  const columns: Column<Project>[] = [
    { key: 'id', header: 'Project ID', render: (p) => <span className="font-mono text-xs text-slate-500">{p.id}</span> },
    { key: 'name', header: 'Project Name', render: (p) => <span className="font-medium text-slate-800">{p.name}</span> },
    { key: 'bu', header: 'BU' },
    { key: 'pimCategory', header: 'PIM Category', render: (p) => <span className="text-slate-600">{p.pimCategory}</span> },
    { key: 'modelTool', header: 'Model / Tool' },
    { key: 'locale', header: 'Locale' },
    { key: 'publishingChannel', header: 'Channel' },
    { key: 'marketType', header: 'B2C/B2B' },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge label={p.status} kind="status" /> },
    { key: 'qaResult', header: 'QA Result', render: (p) => <StatusBadge label={p.qaResult} kind="qa" /> },
    { key: 'owner', header: 'Owner', render: (p) => <span className="text-slate-600">{p.owner}</span> },
    { key: 'updatedAt', header: 'Updated' },
  ]

  const resetFilters = () => {
    setQ(''); setBu(''); setStatus(''); setLocale(''); setChannel(''); setQa(''); setExceptionOnly(false)
  }

  return (
    <div>
      <PageHeader
        title="Project Management"
        description={
          (role === 'BU_OWNER' ? `${buScope} BU · ` : '전체 BU · ') +
          `총 ${filtered.length}건 / ${projects.length}건`
        }
        actions={
          <button className="btn-primary" onClick={() => nav('/create')}>
            ＋ 프로젝트 생성
          </button>
        }
      />

      {/* 필터 영역 */}
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <input
            className="input col-span-2 lg:col-span-2"
            placeholder="이름 / ID / 모델 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" value={bu} onChange={(e) => setBu(e.target.value)}>
            <option value="">전체 BU</option>
            <option>MS</option><option>HS</option><option>ES</option>
          </select>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">전체 Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="input" value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="">전체 Locale</option>
            {LOCALES.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="">전체 Channel</option>
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={qa} onChange={(e) => setQa(e.target.value)}>
            <option value="">전체 QA</option>
            {QA_RESULTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={exceptionOnly} onChange={(e) => setExceptionOnly(e.target.checked)} />
            예외만 보기
          </label>
          <button className="btn-secondary lg:col-start-6" onClick={resetFilters}>필터 초기화</button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        onRowClick={(p) => nav(`/projects/${p.id}`)}
        empty="조건에 맞는 프로젝트가 없습니다."
      />
    </div>
  )
}
