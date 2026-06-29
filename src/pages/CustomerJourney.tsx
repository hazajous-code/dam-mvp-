import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import IntegrationNote from '../components/IntegrationNote'

// ===========================================================================
// 운영 여정(Operations Journey) — 단계(열) × 역할 레인(행) 스윔레인 다이어그램
// 첨부 커머스 여정 도식과 동일한 구성(상단 단계 그룹 + 좌측 액터 + 하단 각주)을
// DAM 자산 운영 흐름에 맞춰 재구성.
// ===========================================================================

interface Step {
  label: string
  to?: string // 클릭 시 이동할 화면
  ref?: number // 하단 각주(연결 시스템) 번호
  auto?: boolean // 시스템 자동 단계 여부
}

interface Lane {
  role: string
  short: string
  color: string // 좌측 레인 라벨 배경색
  // 단계 key별 스텝
  steps: Record<string, Step[]>
}

const PHASES = [
  { key: 'p1', no: 1, title: '기준정보 · 생성', sub: 'PIM2.0 → 프로젝트', accent: 'border-brand-400' },
  { key: 'p2', no: 2, title: '제작 · 업로드', sub: 'Agency 자산 제출', accent: 'border-sky-400' },
  { key: 'p3', no: 3, title: '자동 검수', sub: 'Gatekeeping', accent: 'border-amber-400' },
  { key: 'p4', no: 4, title: '품질 · 이관', sub: 'WCM QA → Transfer', accent: 'border-violet-400' },
  { key: 'p5', no: 5, title: '운영 · 분석', sub: 'Dashboard · 보존', accent: 'border-emerald-400' },
] as const

const LANES: Lane[] = [
  {
    role: 'HQ PMO',
    short: 'HQ',
    color: 'bg-brand-500',
    steps: {
      p1: [
        { label: '프로젝트 생성', to: '/create', ref: 1 },
        { label: '메타데이터 매핑', to: '/template', ref: 1 },
        { label: '템플릿·계정 추천', to: '/create' },
      ],
      p3: [{ label: '예외 승인', to: '/gatekeeping', ref: 2 }],
      p5: [
        { label: '룰 관리', to: '/rules', ref: 2 },
        { label: '현황 모니터링', to: '/' },
      ],
    },
  },
  {
    role: 'Agency',
    short: 'AG',
    color: 'bg-sky-500',
    steps: {
      p2: [
        { label: '자산 업로드', to: '/upload', ref: 3 },
        { label: '파일명·메타 검증', to: '/upload' },
        { label: '수정 후 제출', to: '/upload' },
      ],
    },
  },
  {
    role: 'System (자동)',
    short: 'SYS',
    color: 'bg-indigo-500',
    steps: {
      p1: [{ label: 'PIM 기준정보 매핑', ref: 1, auto: true }],
      p3: [
        { label: '자동 검증', ref: 2, auto: true },
        { label: '정상 건 자동 승인', to: '/gatekeeping', ref: 2, auto: true },
      ],
      p4: [{ label: 'WCM 자동 점검', ref: 4, auto: true }],
      p5: [{ label: '보존·삭제 알림', ref: 6, auto: true }],
    },
  },
  {
    role: 'CNX QA',
    short: 'QA',
    color: 'bg-violet-500',
    steps: {
      p4: [{ label: 'WCM QA 승인 / 반려', to: '/wcm', ref: 4 }],
    },
  },
  {
    role: 'Librarian',
    short: 'LIB',
    color: 'bg-emerald-500',
    steps: {
      p4: [
        { label: 'DAM 이관 최종 승인', to: '/transfer', ref: 5 },
        { label: '이관 완료(Transferred)', to: '/transfer', ref: 5 },
      ],
      p5: [{ label: '아카이브 관리', ref: 6 }],
    },
  },
]

const FOOTNOTES = [
  { no: 1, system: 'PIM2.0', detail: '기준정보(카테고리 LV1~4·모델·Locale) 조회·매핑' },
  { no: 2, system: '룰 엔진', detail: '자동 검증 · 정상 자동승인 · 예외 라우팅' },
  { no: 3, system: 'AEM Assets', detail: '자산 업로드 · 메타데이터 쓰기' },
  { no: 4, system: 'AEM Pages(WCM)', detail: 'Edit/Live 조회 · 이미지/링크 헬스체크' },
  { no: 5, system: 'AEM Assets / GP1·채널', detail: '자산 이관 · 채널 배포' },
  { no: 6, system: '보존 정책', detail: '이관일 + 60일 후 삭제 알림 스케줄러' },
]

// 단계 ↔ 프로젝트 상태 매핑(앱 상태값과 연결)
const STATUS_MAP: Record<string, string[]> = {
  p1: ['Draft', 'Metadata Ready'],
  p2: ['Asset Uploading'],
  p3: ['Gatekeeping In Progress', 'Exception Review'],
  p4: ['WCM QA Requested', 'Approved'],
  p5: ['Transferred'],
}

const GRID = '120px repeat(5, minmax(0, 1fr))'

export default function CustomerJourney() {
  const nav = useNavigate()

  return (
    <div>
      <PageHeader
        title="운영 여정 (Operations Journey)"
        description="DAM 자산 운영을 단계(가로) × 역할 레인(세로)으로 도식화했습니다. 카드를 클릭하면 해당 화면으로 이동합니다."
      />

      <IntegrationNote
        className="mb-4"
        system="여정 맵"
        detail="각 단계의 자동 동작은 실제로는 PIM2.0·AEM Assets·AEM Pages·GP1·보존 스케줄러와 연동(하단 각주 번호 참조). 점선(보라) 카드 = 시스템 자동 단계"
      />

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[920px]">
          {/* 단계 헤더 */}
          <div className="grid items-stretch gap-2" style={{ gridTemplateColumns: GRID }}>
            <div className="flex items-end justify-center pb-2 text-[11px] font-semibold text-ink-300">
              역할 \ 단계
            </div>
            {PHASES.map((p, i) => (
              <div key={p.key} className="relative">
                <div className={`rounded-lg border-t-4 ${p.accent} bg-white px-3 py-2 shadow-sm`}>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                      {p.no}
                    </span>
                    <span className="text-sm font-bold text-ink-900">{p.title}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-500">{p.sub}</p>
                </div>
                {i < PHASES.length - 1 && (
                  <span className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 text-ink-300">▸</span>
                )}
              </div>
            ))}
          </div>

          {/* 레인 */}
          <div className="mt-2 space-y-2">
            {LANES.map((lane) => (
              <div key={lane.role} className="grid items-stretch gap-2" style={{ gridTemplateColumns: GRID }}>
                {/* 좌측 역할 라벨 */}
                <div className={`flex flex-col items-center justify-center rounded-lg ${lane.color} px-2 py-3 text-center text-white`}>
                  <span className="text-sm font-bold">{lane.short}</span>
                  <span className="mt-0.5 text-[10px] opacity-90">{lane.role}</span>
                </div>

                {/* 단계별 셀 */}
                {PHASES.map((p) => {
                  const steps = lane.steps[p.key] ?? []
                  return (
                    <div key={p.key} className="flex flex-col gap-1.5 rounded-lg bg-cream-100/60 p-2">
                      {steps.length === 0 ? (
                        <div className="flex h-full min-h-[40px] items-center justify-center text-ink-300">·</div>
                      ) : (
                        steps.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => s.to && nav(s.to)}
                            disabled={!s.to}
                            className={`group rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                              s.auto
                                ? 'border-dashed border-indigo-300 bg-indigo-50 text-indigo-800'
                                : 'border-cream-300 bg-white text-ink-900 hover:border-brand-400'
                            } ${s.to ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className="font-medium">{s.label}</span>
                            {s.ref && <sup className="ml-0.5 font-bold text-brand-500">{s.ref}</sup>}
                            {s.to && <span className="ml-1 text-ink-300 group-hover:text-brand-500">↗</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* 단계 ↔ 상태 매핑 */}
          <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: GRID }}>
            <div className="flex items-center justify-center text-[10px] font-semibold text-ink-300">상태값</div>
            {PHASES.map((p) => (
              <div key={p.key} className="rounded-lg border border-cream-300 bg-white px-2 py-1.5 text-center text-[10px] text-ink-500">
                {STATUS_MAP[p.key].join(' · ')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예외 루프 안내 */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <b>예외 흐름</b> · 자동 검수(③)에서 Critical 위반이 감지되면 <b>자동 승인 대신 예외 검토(사람)</b>로 라우팅됩니다.
        담당자가 승인하면 다음 단계로, 반려하면 ②로 되돌아가 수정 후 재진입합니다. 정상 건은 ③에서 사람 개입 없이 통과합니다.
      </div>

      {/* 각주 범례 (연결 시스템) */}
      <div className="mt-4 card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-900">연결 시스템 (각주)</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {FOOTNOTES.map((f) => (
            <div key={f.no} className="flex items-start gap-2 rounded-lg border border-cream-300 bg-white p-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {f.no}
              </span>
              <div>
                <p className="text-xs font-semibold text-ink-900">{f.system}</p>
                <p className="text-[11px] text-ink-500">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded border border-cream-300 bg-white" /> 사람 수행 단계 (클릭 시 화면 이동 ↗)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded border border-dashed border-indigo-300 bg-indigo-50" /> 시스템 자동 단계
        </span>
        <span>▸ 단계 흐름(좌→우)</span>
      </div>
    </div>
  )
}
