import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import Timeline from '../components/Timeline'
import { runGatekeeping, computeQAResult, canTransfer } from '../utils/qaEngine'
import { pct } from '../utils/format'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-800">{value || '—'}</p>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { getProject, canViewProject } = useApp()
  const project = id ? getProject(id) : undefined

  if (!project) {
    return (
      <div className="card p-10 text-center text-slate-500">
        프로젝트를 찾을 수 없습니다.
        <div className="mt-3">
          <button className="btn-secondary" onClick={() => nav('/projects')}>목록으로</button>
        </div>
      </div>
    )
  }
  if (!canViewProject(project)) {
    return (
      <div className="card p-10 text-center text-slate-500">
        담당 BU가 아닌 프로젝트입니다. 상단에서 담당 BU를 변경하거나 HQ PMO로 전환하세요.
        <div className="mt-3">
          <button className="btn-secondary" onClick={() => nav('/projects')}>목록으로</button>
        </div>
      </div>
    )
  }

  const gk = runGatekeeping(project)
  const gkResult = computeQAResult(gk)
  const transfer = canTransfer(project)
  const m = project.metadata

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`${project.id} · ${project.owner}`}
        actions={
          <button className="btn-ghost" onClick={() => nav('/projects')}>← 목록</button>
        }
      />

      {/* 상태 요약 바 */}
      <div className="card mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status</span>
          <StatusBadge label={project.status} kind="status" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Gatekeeping</span>
          <StatusBadge label={gkResult} kind="qa" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">WCM QA</span>
          <StatusBadge label={project.wcmStatus} kind="wcm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">메타 완료율</span>
          <span className="text-sm font-semibold text-slate-700">{pct(project.metaCompletion)}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400">이관 가능</span>
          {transfer.ready
            ? <StatusBadge label="Transfer Ready" kind="check" />
            : <StatusBadge label="Blocked" kind="severity" className="bg-rose-50 text-rose-700 border-rose-200" />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 좌측: 정보 */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="BU" value={project.bu} />
              <Field label="PIM Category" value={project.pimCategory} />
              <Field label="Model / Tool" value={project.modelTool} />
              <Field label="Locale" value={project.locale} />
              <Field label="Channel" value={project.publishingChannel} />
              <Field label="B2C / B2B" value={project.marketType} />
              <Field label="Template" value={project.template} />
              <Field label="Archive Rule" value={m.archiveRule} />
              <Field label="Transfer Target (목표 이관일)" value={m.transferTarget} />
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">DAM Path</p>
              <p className="font-mono text-sm text-slate-700">{project.damPath}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">자산 ({project.assets.length})</h3>
              <button className="btn-secondary text-xs" onClick={() => nav(`/upload/${project.id}`)}>자산 업로드</button>
            </div>
            {project.assets.length === 0 ? (
              <p className="text-sm text-slate-400">업로드된 자산이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {project.assets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                    <div>
                      <p className="font-mono text-sm text-slate-800">{a.fileName}</p>
                      <p className="text-xs text-slate-400">{a.assetType || 'Asset Type 미지정'} · {a.locale} · {a.sizeKb}KB</p>
                      {a.issues.length > 0 && (
                        <p className="mt-0.5 text-xs text-rose-600">⚠ {a.issues.join(' / ')}</p>
                      )}
                    </div>
                    <StatusBadge
                      label={a.status === 'uploaded' ? 'OK' : a.status === 'invalid' ? 'Invalid' : 'Dup'}
                      kind="check"
                      className={a.status === 'uploaded' ? '' : 'bg-rose-50 text-rose-700 border-rose-200'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 다음 단계 바로가기 */}
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">워크플로우 바로가기</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <button className="btn-secondary" onClick={() => nav(`/upload/${project.id}`)}>① 자산 업로드</button>
              <button className="btn-secondary" onClick={() => nav(`/gatekeeping/${project.id}`)}>② Gatekeeping</button>
              <button className="btn-secondary" onClick={() => nav(`/wcm/${project.id}`)}>③ WCM QA</button>
              <button className="btn-secondary" onClick={() => nav(`/transfer/${project.id}`)}>④ Transfer</button>
            </div>
            {!transfer.ready && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                이관 차단 사유: {transfer.reasons.join(' · ')}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 이력 */}
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">처리 이력</h3>
          <Timeline events={project.timeline} />
        </div>
      </div>
    </div>
  )
}
