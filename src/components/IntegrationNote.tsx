import { useApp } from '../context/AppContext'

interface Props {
  system: string
  detail: string
  /** HTTP 메서드/엔드포인트 등 기술 표기 (선택) */
  api?: string
  className?: string
}

/**
 * "연동 보기" 모드가 켜졌을 때만 표시되는 연동 포인트 주석.
 * 데모의 mock 동작이 실제로는 어떤 시스템/API로 대체되는지 설명한다.
 */
export default function IntegrationNote({ system, detail, api, className = '' }: Props) {
  const { integrationView } = useApp()
  if (!integrationView) return null
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/70 px-3 py-2 text-[11px] leading-relaxed text-indigo-800 ${className}`}
    >
      <span className="shrink-0 rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
        🔌 {system}
      </span>
      <span>
        {detail}
        {api && <span className="ml-1 font-mono text-indigo-500">· {api}</span>}
      </span>
    </div>
  )
}
