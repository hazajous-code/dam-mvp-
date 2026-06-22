import { useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import IntegrationNote from '../components/IntegrationNote'
import { canDo } from '../data/roles'
import { validateFileNaming } from '../utils/qaEngine'
import type { Asset, AssetType, Project } from '../types'

const ASSET_TYPES: AssetType[] = [
  'Hero Image', 'Gallery Image', 'Feature Image', 'Spec Image', 'Video', '360 Image', 'Zoom Image', 'Document',
]
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'pdf']

function inferType(name: string): AssetType {
  const n = name.toLowerCase()
  if (n.includes('hero')) return 'Hero Image'
  if (n.includes('gallery')) return 'Gallery Image'
  if (n.includes('feature')) return 'Feature Image'
  if (n.includes('spec')) return 'Spec Image'
  if (/\.(mp4|mov)$/.test(n)) return 'Video'
  if (n.includes('360')) return '360 Image'
  if (n.includes('zoom')) return 'Zoom Image'
  if (/\.pdf$/.test(n)) return 'Document'
  return 'Gallery Image'
}

function buildAsset(name: string, sizeKb: number, project: Project): Asset {
  const ext = (name.split('.').pop() ?? '').toLowerCase()
  const type = inferType(name)
  const a: Asset = {
    id: `A-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fileName: name,
    assetType: type,
    sizeKb,
    ext,
    altText: '',
    locale: project.locale,
    uploadedAt: new Date().toLocaleString('ko-KR'),
    status: 'uploaded',
    issues: [],
  }
  // 검증
  const naming = validateFileNaming(a, project)
  if (naming.status !== 'pass') a.issues.push(naming.message)
  if (!ALLOWED_EXT.includes(ext)) a.status = 'invalid'
  if (/[ #%&]/.test(name)) a.status = 'invalid'
  if (project.assets.some((x) => x.fileName.toLowerCase() === name.toLowerCase())) {
    a.status = 'duplicate'
    a.issues.push('중복 파일명')
  }
  return a
}

export default function AssetUpload() {
  const { id } = useParams()
  const nav = useNavigate()
  const { projects, getProject, updateProject, addTimeline, role } = useApp()
  const [selectedId, setSelectedId] = useState(id ?? projects[0]?.id ?? '')
  const project = getProject(id ?? selectedId)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const canUpload = canDo(role, 'upload_asset')

  const sampleFiles = useMemo(
    () => [
      { name: `${project?.modelTool ?? 'MODEL'}_hero_${project?.locale ?? 'en-US'}.jpg`, kb: 1180 },
      { name: `${project?.modelTool ?? 'MODEL'}_gallery_01.webp`, kb: 940 },
      { name: 'product banner final.jpg', kb: 720 }, // 금지문자 포함 (검증 실패 예시)
      { name: `${project?.modelTool ?? 'MODEL'}_video.mp4`, kb: 8200 },
    ],
    [project],
  )

  if (!project) {
    return <div className="card p-8 text-center text-slate-500">프로젝트가 없습니다.</div>
  }

  const addFiles = (files: { name: string; kb: number }[]) => {
    const newAssets = files.map((f) => buildAsset(f.name, f.kb, project))
    updateProject(project.id, {
      assets: [...project.assets, ...newAssets],
      status: project.status === 'Metadata Ready' || project.status === 'Draft' ? 'Asset Uploading' : project.status,
    })
    addTimeline(project.id, '자산 업로드', `${newAssets.length}개 자산`)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).map((f) => ({ name: f.name, kb: Math.round(f.size / 1024) || 500 }))
    if (files.length) addFiles(files)
  }

  const removeAsset = (assetId: string) => {
    updateProject(project.id, { assets: project.assets.filter((a) => a.id !== assetId) })
  }

  const setAltText = (assetId: string, text: string) => {
    updateProject(project.id, {
      assets: project.assets.map((a) => (a.id === assetId ? { ...a, altText: text } : a)),
    })
  }
  const setAssetType = (assetId: string, t: AssetType) => {
    updateProject(project.id, {
      assets: project.assets.map((a) => (a.id === assetId ? { ...a, assetType: t } : a)),
    })
  }

  const invalidCount = project.assets.filter((a) => a.status !== 'uploaded').length
  const missingAlt = project.assets.filter((a) => !a.altText).length

  const submit = () => {
    updateProject(project.id, { status: 'Gatekeeping In Progress' })
    addTimeline(project.id, 'Agency 자산 제출', '게이트키핑 검증 요청')
    nav(`/gatekeeping/${project.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Asset Upload"
        description="Agency가 자산을 업로드하고 누락 항목을 확인 후 제출합니다."
        actions={<button className="btn-ghost" onClick={() => nav(`/projects/${project.id}`)}>프로젝트 상세 →</button>}
      />

      {/* 프로젝트 선택 */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
        <label className="text-sm text-slate-500">대상 프로젝트</label>
        <select
          className="input max-w-md"
          value={project.id}
          onChange={(e) => { setSelectedId(e.target.value); nav(`/upload/${e.target.value}`) }}
        >
          {projects.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
        </select>
        <div className="ml-auto flex gap-2 text-xs">
          <StatusBadge label={`경로: ${project.damPath.split('/').slice(-3).join('/')}`} />
          <StatusBadge label={project.status} kind="status" />
        </div>
      </div>

      {!canUpload && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          현재 역할에서는 업로드 권한이 없습니다. <b>Agency</b> 역할로 전환하면 업로드를 시연할 수 있습니다. (조회는 가능)
        </div>
      )}

      <IntegrationNote
        className="mb-4"
        system="AEM Assets / 룰 엔진"
        detail="실제 업로드는 AEM Assets 바이너리 업로드 API. 파일명·확장자·중복·Alt Text·Locale 검증은 서버 룰 엔진이 수행하고, 하위 폴더 추천은 Asset Type 매핑 규칙 기반"
        api="POST /assets/{path}"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 업로드 영역 */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`card flex flex-col items-center justify-center border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300'
            }`}
          >
            <p className="text-3xl text-slate-300">⤓</p>
            <p className="mt-2 text-sm font-medium text-slate-700">파일을 여기로 드래그 & 드롭</p>
            <p className="text-xs text-slate-400">jpg, png, webp, mp4, mov, pdf 지원</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button className="btn-secondary" disabled={!canUpload} onClick={() => fileRef.current?.click()}>
                파일 선택
              </button>
              <button className="btn-primary" disabled={!canUpload} onClick={() => addFiles(sampleFiles)}>
                샘플 자산 추가 (데모)
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, kb: Math.round(f.size / 1024) || 500 }))
                if (files.length) addFiles(files)
                e.target.value = ''
              }}
            />
          </div>

          {/* 파일 리스트 */}
          <div className="card mt-4 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">업로드 파일 ({project.assets.length})</h3>
            {project.assets.length === 0 ? (
              <p className="text-sm text-slate-400">업로드된 자산이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {project.assets.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-sm text-slate-800">{a.fileName}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={a.status === 'uploaded' ? '검증 통과' : a.status === 'duplicate' ? '중복' : '검증 실패'}
                          kind="check"
                          className={a.status === 'uploaded' ? '' : 'bg-rose-50 text-rose-700 border-rose-200'}
                        />
                        {canUpload && (
                          <button className="text-xs text-slate-400 hover:text-rose-500" onClick={() => removeAsset(a.id)}>삭제</button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Asset Type</label>
                        <select
                          className="input py-1 text-xs"
                          value={a.assetType}
                          disabled={!canUpload}
                          onChange={(e) => setAssetType(a.id, e.target.value as AssetType)}
                        >
                          {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[11px] text-slate-400">Alt Text {!a.altText && <span className="text-rose-500">· 누락</span>}</label>
                        <input
                          className="input py-1 text-xs"
                          value={a.altText}
                          disabled={!canUpload}
                          placeholder="대체 텍스트 입력"
                          onChange={(e) => setAltText(a.id, e.target.value)}
                        />
                      </div>
                    </div>
                    {a.issues.length > 0 && (
                      <p className="mt-2 text-xs text-rose-600">⚠ {a.issues.join(' / ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 우측 검증 요약 */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">검증 요약</h3>
            <ul className="space-y-2 text-sm">
              <CheckRow ok={project.assets.length > 0} label="자산 존재" detail={`${project.assets.length}개`} />
              <CheckRow ok={invalidCount === 0} label="파일명/확장자 규칙" detail={invalidCount ? `${invalidCount}건 실패` : '통과'} />
              <CheckRow ok={missingAlt === 0} label="Alt Text" detail={missingAlt ? `${missingAlt}건 누락` : '완료'} />
              <CheckRow ok={project.assets.every((a) => a.assetType)} label="Asset Type 지정" detail="" />
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">하위 폴더 자동 추천</h3>
            <div className="space-y-1 font-mono text-xs text-slate-600">
              {[...new Set(project.assets.map((a) => a.assetType))].filter(Boolean).map((t) => (
                <p key={t}>{project.damPath}/{String(t).replace(/\s+/g, '-')}</p>
              ))}
              {project.assets.length === 0 && <p className="text-slate-400">자산 업로드 시 추천 경로가 표시됩니다.</p>}
            </div>
          </div>

          <button
            className="btn-primary w-full"
            disabled={!canUpload || project.assets.length === 0}
            onClick={submit}
          >
            검증 후 제출 → Gatekeeping
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-slate-600">
        <span className={ok ? 'text-emerald-500' : 'text-rose-500'}>{ok ? '✓' : '✕'}</span>
        {label}
      </span>
      <span className="text-xs text-slate-400">{detail}</span>
    </li>
  )
}
