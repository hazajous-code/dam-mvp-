import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import RuleResultTable from '../components/RuleResultTable'
import Timeline from '../components/Timeline'
import StatCard from '../components/StatCard'
import { runGatekeeping, computeQAResult } from '../utils/qaEngine'
import { canDo } from '../data/roles'
import type { QAResult } from '../types'

export default function GatekeepingQA() {
  const { id } = useParams()
  const nav = useNavigate()
  const { projects, getProject, updateProject, addTimeline, role } = useApp()
  const project = getProject(id ?? projects[0]?.id ?? '')
  const [comment, setComment] = useState('')
  const canApprove = canDo(role, 'approve_gatekeeping') || canDo(role, 'handle_exception')

  if (!project) {
    return <div className="card p-8 text-center text-slate-500">프로젝트가 없습니다.</div>
  }

  const results = runGatekeeping(project)
  const computed = computeQAResult(results)
  const passes = results.filter((r) => r.status === 'pass').length
  const warns = results.filter((r) => r.status === 'warning').length
  const fails = results.filter((r) => r.status === 'fail').length
  const isAuto = computed === 'Auto Approved'
  const needsHuman = computed === 'Exception Required' || computed === 'Rejected' || computed === 'Manual Review'

  const apply = (decision: 'approve' | 'reject', resultLabel: QAResult) => {
    updateProject(project.id, {
      qaResult: resultLabel,
      status: decision === 'approve' ? 'WCM QA Requested' : 'Rejected',
      isException: false,
    })
    addTimeline(
      project.id,
      decision === 'approve' ? 'Gatekeeping 예외 승인' : 'Gatekeeping 반려',
      comment || undefined,
    )
    setComment('')
  }

  return (
    <div>
      <PageHeader
        title="Gatekeeping QA"
        description="자동 검증 후 정상 건은 자동 승인하고, 예외 건만 담당자가 검토합니다."
        actions={
          <select
            className="input max-w-xs"
            value={project.id}
            onChange={(e) => nav(`/gatekeeping/${e.target.value}`)}
          >
            {projects.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
          </select>
        }
      />

      {/* 원칙 배너 */}
      <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
        <b>운영 원칙</b> · 경로 준수는 QA의 일부 조건일 뿐 QA 자체가 아닙니다. 사람의 역할은 반복 확인이 아니라 <b>예외 판단과 최종 승인</b>입니다.
      </div>

      {/* QA Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="자동 판정 결과" value={<StatusBadge label={computed} kind="qa" />} />
        <StatCard label="Pass" value={passes} accent="green" />
        <StatCard label="Warning" value={warns} accent="amber" />
        <StatCard label="Fail" value={fails} accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* 자동 승인 / 예외 안내 */}
          {isAuto ? (
            <div className="card border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">✓ 자동 승인 (Auto Approved)</p>
              <p className="mt-1 text-xs text-emerald-600">
                Critical Fail이 없어 시스템이 자동 승인했습니다. 담당자의 반복 확인 없이 다음 단계로 진행할 수 있습니다.
              </p>
              <button
                className="btn-primary mt-3"
                disabled={!canApprove}
                onClick={() => apply('approve', 'Auto Approved')}
              >
                확정 → WCM QA 요청 단계로
              </button>
            </div>
          ) : (
            <div className="card border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-700">⚠ 사람 검토 필요 ({computed})</p>
              <p className="mt-1 text-xs text-orange-600">
                예외 조건이 감지되어 담당자 판단이 필요합니다. 아래 Fail/Warning 항목을 확인 후 승인 또는 반려하세요.
              </p>
            </div>
          )}

          {/* 룰별 결과 */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">룰별 검증 결과</h3>
            </div>
            <RuleResultTable results={results} />
          </div>

          {/* 예외 사유 */}
          {fails > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">예외 사유 상세</h3>
              <ul className="space-y-2">
                {results.filter((r) => r.status === 'fail').map((r) => (
                  <li key={r.ruleId} className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm">
                    <p className="font-medium text-rose-700">{r.ruleName}</p>
                    <p className="text-xs text-rose-600">{r.message}</p>
                    <p className="mt-1 text-xs text-slate-500">권장: {r.recommendation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 담당자 처리 */}
          {needsHuman && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">담당자 처리</h3>
              <textarea
                className="input min-h-[80px]"
                placeholder="처리 코멘트 (예외 승인 근거 또는 반려 사유)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {!canApprove && (
                <p className="mt-2 text-xs text-amber-600">
                  승인 권한이 없습니다. <b>HQ PMO</b> 또는 <b>Librarian</b> 역할로 전환하세요.
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" disabled={!canApprove} onClick={() => apply('approve', 'Manual Review')}>
                  예외 승인
                </button>
                <button className="btn-secondary border-rose-300 text-rose-600" disabled={!canApprove} onClick={() => apply('reject', 'Rejected')}>
                  반려
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 이력 */}
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">처리 이력</h3>
          <Timeline events={project.timeline} />
        </div>
      </div>
    </div>
  )
}
