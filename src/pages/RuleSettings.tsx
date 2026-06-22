import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { canDo } from '../data/roles'
import type { RuleCategory } from '../types'

const CATEGORIES: RuleCategory[] = [
  'Folder Path Rule',
  'Metadata Rule',
  'File Naming Rule',
  'Channel Rule',
  'Locale Rule',
  'Archive Rule',
  'WCM QA Rule',
]

const AUTO_STYLE: Record<string, string> = {
  'Auto Approve': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Manual Review': 'bg-sky-50 text-sky-700 border-sky-200',
  Block: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function RuleSettings() {
  const { rules, toggleRule, role } = useApp()
  const [cat, setCat] = useState<RuleCategory | '전체'>('전체')
  const canManage = canDo(role, 'manage_rule')

  const filtered = rules.filter((r) => cat === '전체' || r.category === cat)

  return (
    <div>
      <PageHeader
        title="Rule Settings"
        description="게이트키핑 자동화 룰을 카테고리별로 관리합니다. Severity와 Automation Level에 따라 자동 승인/검토/차단이 결정됩니다."
      />

      {!canManage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          현재 역할은 룰 조회만 가능합니다. <b>HQ PMO</b> 역할로 전환하면 룰을 활성화/비활성화할 수 있습니다.
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="card mb-4 flex flex-wrap gap-2 p-3">
        {(['전체', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              cat === c ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c}
            <span className="ml-1 text-xs text-slate-400">
              ({c === '전체' ? rules.length : rules.filter((r) => r.category === c).length})
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="table-th">Rule</th>
                <th className="table-th">Category</th>
                <th className="table-th">Severity</th>
                <th className="table-th">Automation</th>
                <th className="table-th">Template</th>
                <th className="table-th">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="table-td max-w-sm whitespace-normal">
                    <p className="font-medium text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.description}</p>
                    <p className="font-mono text-[10px] text-slate-300">{r.id}</p>
                  </td>
                  <td className="table-td text-slate-600">{r.category}</td>
                  <td className="table-td"><StatusBadge label={r.severity} kind="severity" /></td>
                  <td className="table-td">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${AUTO_STYLE[r.automationLevel]}`}>
                      {r.automationLevel}
                    </span>
                  </td>
                  <td className="table-td text-xs text-slate-500">{r.appliedTemplate}</td>
                  <td className="table-td">
                    <button
                      onClick={() => canManage && toggleRule(r.id)}
                      disabled={!canManage}
                      className={`relative h-6 w-11 rounded-full transition-colors ${r.enabled ? 'bg-emerald-500' : 'bg-slate-300'} ${!canManage ? 'cursor-not-allowed opacity-60' : ''}`}
                      aria-label="toggle"
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${r.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-slate-400">Severity 기준</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li><b className="text-rose-600">Critical</b> — 미충족 시 이관 차단</li>
            <li><b className="text-amber-600">Warning</b> — 경고 후 진행 가능</li>
            <li><b className="text-sky-600">Info</b> — 권장 사항</li>
          </ul>
        </div>
        <div className="card p-4 md:col-span-2">
          <p className="text-xs text-slate-400">Automation Level 기준</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li><b className="text-emerald-600">Auto Approve</b> — 통과 시 사람 개입 없이 자동 승인</li>
            <li><b className="text-sky-600">Manual Review</b> — 예외로 분류되어 담당자 검토</li>
            <li><b className="text-rose-600">Block</b> — 미충족 시 다음 단계 진행 차단</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
