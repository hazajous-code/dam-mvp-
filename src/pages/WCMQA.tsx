import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Timeline from '../components/Timeline'
import StatCard from '../components/StatCard'
import { computeWcmResult } from '../utils/qaEngine'
import { canDo } from '../data/roles'
import type { WcmStatus } from '../types'

export default function WCMQA() {
  const { id } = useParams()
  const nav = useNavigate()
  const { projects, getProject, updateProject, addTimeline, role } = useApp()
  const project = getProject(id ?? projects[0]?.id ?? '')
  const [comment, setComment] = useState('')

  const canRequest = canDo(role, 'create_project') || canDo(role, 'review_metadata')
  const canDecide = canDo(role, 'wcm_approve')

  if (!project) {
    return <div className="card p-8 text-center text-slate-500">프로젝트가 없습니다.</div>
  }

  const wcm = computeWcmResult(project)
  const status = project.wcmStatus

  const setStatus = (next: WcmStatus, action: string) => {
    const patch: any = { wcmStatus: next }
    if (next === 'Approved') patch.status = 'Approved'
    updateProject(project.id, patch)
    addTimeline(project.id, action, comment || undefined)
    setComment('')
  }

  return (
    <div>
      <PageHeader
        title="WCM QA"
        description="WCM(AEM) 제작물의 QA를 요청하고 CNX QA가 승인/반려합니다."
        actions={
          <select className="input max-w-xs" value={project.id} onChange={(e) => nav(`/wcm/${e.target.value}`)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
          </select>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="WCM 상태" value={<StatusBadge label={status} kind="wcm" />} />
        <StatCard label="Pass" value={wcm.passes} accent="green" />
        <StatCard label="Warning" value={wcm.warns} accent="amber" />
        <StatCard label="DAM 이관 가능" value={wcm.canTransfer ? '가능' : '불가'} accent={wcm.canTransfer ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* 검증 항목 */}
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">WCM 제작 QA 체크리스트</h3>
              <span className="text-xs text-slate-400">담당자 자동 지정: 이도윤 (CNX QA)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {project.wcmChecks.map((c) => (
                <div key={c.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-700">{c.label}</span>
                  <StatusBadge
                    label={c.status === 'pass' ? 'Pass' : c.status === 'warning' ? 'Warn' : 'Fail'}
                    kind="check"
                    className={c.status === 'fail' ? 'bg-rose-50 text-rose-700 border-rose-200' : c.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 처리 영역 */}
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">QA 처리</h3>

            {status === 'QA Not Requested' && (
              <div>
                <p className="text-sm text-slate-500">아직 QA가 요청되지 않았습니다.</p>
                <button
                  className="btn-primary mt-3"
                  disabled={!canRequest}
                  onClick={() => setStatus('QA Requested', 'WCM QA 요청', )}
                >
                  QA 요청 (담당자 자동 지정)
                </button>
                {!canRequest && <p className="mt-2 text-xs text-amber-600">요청 권한이 없습니다. HQ PMO / BU Owner 역할로 전환하세요.</p>}
              </div>
            )}

            {(status === 'QA Requested' || status === 'In Review' || status === 'Revision Requested') && (
              <div>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="승인/반려 코멘트"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                {!canDecide && (
                  <p className="mt-2 text-xs text-amber-600">
                    승인/반려 권한이 없습니다. <b>CNX QA</b> 역할로 전환하세요.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {status === 'QA Requested' && (
                    <button className="btn-secondary" disabled={!canDecide} onClick={() => setStatus('In Review', '검토 시작')}>
                      검토 시작
                    </button>
                  )}
                  <button className="btn-primary" disabled={!canDecide} onClick={() => setStatus('Approved', 'WCM QA 승인')}>
                    승인
                  </button>
                  <button className="btn-secondary border-amber-300 text-amber-600" disabled={!canDecide} onClick={() => setStatus('Revision Requested', '수정 요청')}>
                    수정 요청
                  </button>
                  <button className="btn-secondary border-rose-300 text-rose-600" disabled={!canDecide} onClick={() => setStatus('Rejected', 'WCM QA 반려')}>
                    반려
                  </button>
                </div>
              </div>
            )}

            {status === 'Approved' && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                ✓ WCM QA 승인 완료. DAM 이관이 가능합니다.
                <button className="btn-primary ml-3" onClick={() => nav(`/transfer/${project.id}`)}>Transfer로 이동 →</button>
              </div>
            )}
            {status === 'Rejected' && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                ✕ WCM QA 반려됨. 제작물 수정 후 재요청이 필요합니다.
                <button className="btn-secondary ml-3" disabled={!canRequest} onClick={() => setStatus('QA Requested', 'WCM QA 재요청')}>재요청</button>
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">처리 이력</h3>
          <Timeline events={project.timeline} />
        </div>
      </div>
    </div>
  )
}
