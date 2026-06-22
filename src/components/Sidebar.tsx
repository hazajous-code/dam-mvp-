import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { canAccessMenu } from '../data/roles'

interface MenuItem {
  key: string
  to: string
  label: string
  icon: string
  group: string
}

const MENU: MenuItem[] = [
  { key: 'dashboard', to: '/', label: 'Dashboard', icon: '▦', group: '운영 현황' },
  { key: 'projects', to: '/projects', label: 'Project Management', icon: '▤', group: '운영 현황' },
  { key: 'analytics', to: '/analytics', label: 'Analytics', icon: '◳', group: '운영 현황' },
  { key: 'create', to: '/create', label: 'Create Project', icon: '＋', group: '프로젝트' },
  { key: 'template', to: '/template', label: 'Template & Metadata', icon: '▣', group: '프로젝트' },
  { key: 'upload', to: '/upload', label: 'Asset Upload', icon: '⤓', group: '제작 / 검수' },
  { key: 'gatekeeping', to: '/gatekeeping', label: 'Gatekeeping QA', icon: '✓', group: '제작 / 검수' },
  { key: 'wcm', to: '/wcm', label: 'WCM QA', icon: '◎', group: '제작 / 검수' },
  { key: 'transfer', to: '/transfer', label: 'Transfer & Approval', icon: '⇪', group: '이관' },
  { key: 'rules', to: '/rules', label: 'Rule Settings', icon: '⚙', group: '관리' },
]

const GROUP_ORDER = ['운영 현황', '프로젝트', '제작 / 검수', '이관', '관리']

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useApp()
  const visible = MENU.filter((m) => canAccessMenu(role, m.key))

  return (
    <nav className="flex h-full w-60 flex-col border-r border-cream-300 bg-cream-50">
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">
          DA
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-ink-900">DAM 고도화</p>
          <p className="text-[10px] text-ink-300">Global Asset Ops</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {GROUP_ORDER.map((group) => {
          const items = visible.filter((m) => m.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="mt-4">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group}
              </p>
              {items.map((m) => (
                <NavLink
                  key={m.key}
                  to={m.to}
                  end={m.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-100 text-brand-700'
                        : 'text-ink-700 hover:bg-cream-200'
                    }`
                  }
                >
                  <span className="w-4 text-center text-slate-400">{m.icon}</span>
                  {m.label}
                </NavLink>
              ))}
            </div>
          )
        })}
      </div>

      <div className="border-t border-cream-300 px-5 py-3">
        <p className="text-[10px] text-ink-300">MVP Demo · Mock Data</p>
      </div>
    </nav>
  )
}
