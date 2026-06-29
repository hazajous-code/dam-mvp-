import type { RoleMeta, Role } from '../types'

// 모든 메뉴 키
export const MENU_KEYS = [
  'dashboard',
  'projects',
  'create',
  'template',
  'upload',
  'gatekeeping',
  'wcm',
  'transfer',
  'analytics',
  'rules',
] as const

export const ROLES: RoleMeta[] = [
  {
    id: 'HQ_PMO',
    name: 'HQ PMO',
    description: '전체 프로젝트 생성, 템플릿·룰 관리, 운영 현황 모니터링',
    allowedMenus: '*',
    actions: [
      'create_project',
      'manage_template',
      'manage_rule',
      'approve_gatekeeping',
      'final_approve',
    ],
  },
  {
    id: 'BU_OWNER',
    name: 'BU Owner',
    description: '담당 BU의 프로젝트만 조회·검토·승인 (담당 BU 한정 관리자)',
    allowedMenus: [
      'dashboard',
      'projects',
      'journey',
      'template',
      'gatekeeping',
      'transfer',
      'analytics',
    ],
    actions: ['review_metadata', 'approve_gatekeeping'],
  },
  {
    id: 'AGENCY',
    name: 'Agency',
    description: '자산 업로드, 누락 항목 확인 및 수정 제출',
    allowedMenus: ['dashboard', 'projects', 'journey', 'upload', 'gatekeeping'],
    actions: ['upload_asset', 'resubmit'],
  },
  {
    id: 'LIBRARIAN',
    name: 'Librarian / DAM Admin',
    description: 'DAM 이관 검토, 예외 처리, 최종 승인',
    allowedMenus: [
      'dashboard',
      'projects',
      'journey',
      'gatekeeping',
      'transfer',
      'analytics',
      'rules',
    ],
    actions: ['handle_exception', 'final_approve', 'transfer'],
  },
  {
    id: 'CNX_QA',
    name: 'CNX QA',
    description: 'WCM 제작물 QA 승인 / 반려',
    allowedMenus: ['dashboard', 'projects', 'journey', 'wcm', 'gatekeeping'],
    actions: ['wcm_approve', 'wcm_reject'],
  },
  {
    id: 'VIEWER',
    name: 'Viewer',
    description: '전체 현황 조회 전용',
    allowedMenus: '*',
    actions: [],
  },
]

export function getRole(id: Role): RoleMeta {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}

export function canAccessMenu(role: Role, menu: string): boolean {
  const meta = getRole(role)
  if (meta.allowedMenus === '*') return true
  return meta.allowedMenus.includes(menu)
}

export function canDo(role: Role, action: string): boolean {
  return getRole(role).actions.includes(action)
}
