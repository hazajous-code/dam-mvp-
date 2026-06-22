import { useApp } from '../context/AppContext'
import { ROLES, getRole } from '../data/roles'
import type { Role } from '../types'

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { role, setRole, actorName, resetData, integrationView, toggleIntegrationView } = useApp()
  const meta = getRole(role)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-cream-300 bg-cream-50 px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="메뉴"
        >
          ☰
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">
            글로벌 DAM 운영 고도화 콘솔
          </p>
          <p className="text-xs text-slate-400">PIM2.0 · DAM · WCM 통합 워크플로우 (Demo)</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleIntegrationView}
          className={`btn text-xs ${
            integrationView
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'border border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
          title="실제 시스템 연동 포인트 주석 표시"
        >
          🔌 연동 보기 {integrationView ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => {
            if (confirm('데모 데이터를 초기 상태로 되돌립니다. 진행할까요?')) resetData()
          }}
          className="btn-ghost hidden text-xs sm:inline-flex"
          title="localStorage 초기화"
        >
          ↺ 초기화
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden text-right md:block">
            <p className="text-xs font-semibold text-slate-700">{actorName}</p>
            <p className="text-[10px] text-slate-400">{meta.name}</p>
          </div>
          <label className="relative">
            <span className="sr-only">역할 전환</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              title="역할 전환 (Role Switcher)"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  )
}
