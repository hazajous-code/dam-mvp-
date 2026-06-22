import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Timeline from '../components/Timeline'
import { runGatekeeping, computeQAResult, canTransfer } from '../utils/qaEngine'
import { canDo } from '../data/roles'
import { pct } from '../utils/format'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

export default function TransferApproval() {
  const { id } = useParams()
  const nav = useNavigate()
  const { projects, getProject, updateProject, addTimeline, role } = useApp()
  const project = getProject(id ?? projects[0]?.id ?? '')
  const [comment, setComment] = useState('')
  const canFinal = canDo(role, 'final_approve') || canDo(role, 'transfer')

  if (!project) {
    return <div className="card p-8 text-center text-slate-500">프로젝트가 없습니다.</div>
  }

  const gkResult = computeQAResult(runGatekeeping(project))
  const transfer = canTransfer(project)

  const doTransfer = () => {
    updateProject(project.id, { status: 'Transferred', transferred: true })
    addTimeline(project.id, 'DAM 이관 완료', comment || `${project.metadata.transferTarget} 반영`)
    setComment('')
  }
  const doReject = () => {
    updateProject(project.id, { status: 'Rejected' })
    addTimeline(project.id, '이관 반려', comment || undefined)
    setComment('')
  }

  return (
    <div>
      <PageHeader
        title="Transfer & Approval"
        description="Gatekeeping과 WCM QA 결과를 종합해 DAM 이관 준비 상태를 확인하고 최종 승인합니다."
        actions={
          <select className="input max-w-xs" value={project.id} onChange={(e) => nav(`/transfer/${e.target.value}`)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
          </select>
        }
      />

      {/* Ready / Blocked 배너 */}
      {project.transferred ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          ✓ 이관 완료 (Transferred) — {project.metadata.transferTarget}에 반영되었습니다.
        </div>
      ) : transfer.ready ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          ✓ Transfer Ready — 모든 선행 조건이 충족되어 이관이 가능합니다.
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">⛔ Transfer Blocked</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            {transfer.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">이관 준비 현황</h3>
            <Row label="프로젝트 상태" value={<StatusBadge label={project.status} kind="status" />} />
            <Row label="Gatekeeping 결과" value={<StatusBadge label={gkResult} kind="qa" />} />
            <Row label="WCM QA 결과" value={<StatusBadge label={project.wcmStatus} kind="wcm" />} />
            <Row label="필수 메타데이터 완료율" value={pct(project.metaCompletion)} />
            <Row label="Archive Rule" value={project.metadata.archiveRule || '미지정'} />
            <Row
              label="Transfer Target (목표 이관일)"
              value={project.metadata.transferTarget || '미지정'}
            />
            {project.metadata.transferTarget && (
              <p className="py-1 text-[11px] text-amber-600">
                ⚠ 설정한 날짜({project.metadata.transferTarget})로부터 60일 이후 프로젝트 삭제 알림이 발송될 수 있습니다.
              </p>
            )}
            <Row label="배포 채널" value={project.publishingChannel} />
            <Row label="최종 DAM Path" value={<span className="font-mono text-xs">{project.damPath}</span>} />
            <Row label="최종 승인자" value={project.owner} />
          </div>

          {!project.transferred && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">최종 승인</h3>
              <textarea
                className="input min-h-[70px]"
                placeholder="승인/반려 코멘트"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {!canFinal && (
                <p className="mt-2 text-xs text-amber-600">
                  최종 승인 권한이 없습니다. <b>Librarian / DAM Admin</b> 또는 <b>HQ PMO</b> 역할로 전환하세요.
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" disabled={!canFinal || !transfer.ready} onClick={doTransfer}>
                  이관 완료 처리
                </button>
                <button className="btn-secondary border-rose-300 text-rose-600" disabled={!canFinal} onClick={doReject}>
                  반려
                </button>
              </div>
              {!transfer.ready && (
                <p className="mt-2 text-xs text-slate-400">선행 조건 미충족 시 이관 버튼이 비활성화됩니다.</p>
              )}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">처리 이력</h3>
          <Timeline events={project.timeline} />
        </div>
      </div>
    </div>
  )
}
