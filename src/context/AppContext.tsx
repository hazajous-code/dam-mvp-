import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Project, Role, TimelineEvent, Rule } from '../types'
import { SEED_PROJECTS } from '../data/mockProjects'
import { MOCK_RULES } from '../data/mockRules'
import { load, save, clearAll } from '../utils/storage'
import { getRole } from '../data/roles'
import { nowStamp } from '../utils/format'

interface AppState {
  role: Role
  setRole: (r: Role) => void
  actorName: string
  projects: Project[]
  rules: Rule[]
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, patch: Partial<Project>) => void
  addProject: (p: Project) => void
  addTimeline: (id: string, action: string, note?: string) => void
  setRules: (rules: Rule[]) => void
  toggleRule: (id: string) => void
  integrationView: boolean
  toggleIntegrationView: () => void
  resetData: () => void
}

const Ctx = createContext<AppState | null>(null)

const ACTOR_BY_ROLE: Record<Role, string> = {
  HQ_PMO: '김민준',
  BU_OWNER: '정하준',
  AGENCY: '윤채원',
  LIBRARIAN: '최유나',
  CNX_QA: '이도윤',
  VIEWER: '게스트',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => load<Role>('role', 'HQ_PMO'))
  const [projects, setProjects] = useState<Project[]>(() =>
    load<Project[]>('projects', SEED_PROJECTS),
  )
  const [rules, setRulesState] = useState<Rule[]>(() =>
    load<Rule[]>('rules', MOCK_RULES),
  )
  const [integrationView, setIntegrationView] = useState<boolean>(() =>
    load<boolean>('integrationView', false),
  )

  useEffect(() => save('role', role), [role])
  useEffect(() => save('projects', projects), [projects])
  useEffect(() => save('rules', rules), [rules])
  useEffect(() => save('integrationView', integrationView), [integrationView])

  const value = useMemo<AppState>(() => {
    const actorName = ACTOR_BY_ROLE[role]

    const updateProject = (id: string, patch: Partial<Project>) =>
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: nowStamp().slice(0, 10) } : p,
        ),
      )

    const addTimeline = (id: string, action: string, note?: string) => {
      const e: TimelineEvent = {
        id: `E-${Date.now()}`,
        at: nowStamp(),
        actor: actorName,
        role,
        action,
        note,
      }
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, timeline: [...p.timeline, e], updatedAt: nowStamp().slice(0, 10) }
            : p,
        ),
      )
    }

    return {
      role,
      setRole,
      actorName,
      projects,
      rules,
      getProject: (id) => projects.find((p) => p.id === id),
      updateProject,
      addProject: (p) => setProjects((prev) => [p, ...prev]),
      addTimeline,
      setRules: (r) => setRulesState(r),
      toggleRule: (id) =>
        setRulesState((prev) =>
          prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        ),
      integrationView,
      toggleIntegrationView: () => setIntegrationView((v) => !v),
      resetData: () => {
        clearAll()
        setProjects(SEED_PROJECTS)
        setRulesState(MOCK_RULES)
        setRole('HQ_PMO')
      },
    }
  }, [role, projects, rules, integrationView])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { getRole }
