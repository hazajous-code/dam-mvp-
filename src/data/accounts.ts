import type {
  Role,
  BU,
  Channel,
  MarketType,
  ArchiveRule,
} from '../types'

// 계정(역할)별 작업 성향 프로필.
// 프로젝트 생성 시 기본값 자동 입력 + 템플릿/메타데이터 추천의 근거로 사용한다.
export interface AccountProfile {
  role: Role
  name: string
  org: string
  defaultBU: BU
  defaultChannel: Channel
  defaultRegion: string
  defaultLocale: string
  defaultMarketType: MarketType
  defaultArchiveRule: ArchiveRule
  defaultTransferTarget: string
  preferredTemplate: string
  /** Search Tag 자동 추천 시 붙이는 접두 태그 */
  searchTagPreset: string
  /** 최근 사용 템플릿 이력 (추천 가중치) */
  recentTemplates: { name: string; count: number }[]
}

export const ACCOUNT_PROFILES: Record<Role, AccountProfile> = {
  HQ_PMO: {
    role: 'HQ_PMO',
    name: '김민준',
    org: 'HQ PMO',
    defaultBU: 'MS',
    defaultChannel: 'LG.com',
    defaultRegion: 'Global',
    defaultLocale: 'en-US',
    defaultMarketType: 'B2C',
    defaultArchiveRule: '신규 등록',
    defaultTransferTarget: 'AEM Assets',
    preferredTemplate: 'Product PDP Template',
    searchTagPreset: 'premium, 2026',
    recentTemplates: [
      { name: 'Product PDP Template', count: 7 },
      { name: 'Feature Asset Template', count: 3 },
    ],
  },
  BU_OWNER: {
    role: 'BU_OWNER',
    name: '정하준',
    org: 'MS BU',
    defaultBU: 'MS',
    defaultChannel: 'Retailer',
    defaultRegion: 'NA',
    defaultLocale: 'en-US',
    defaultMarketType: 'B2C',
    defaultArchiveRule: '기존 자산과 병존',
    defaultTransferTarget: 'AEM Assets',
    preferredTemplate: 'Retailer Package Template',
    searchTagPreset: 'retailer, spec',
    recentTemplates: [
      { name: 'Retailer Package Template', count: 5 },
      { name: 'Product PDP Template', count: 2 },
    ],
  },
  AGENCY: {
    role: 'AGENCY',
    name: '윤채원',
    org: 'Creative Agency',
    defaultBU: 'HS',
    defaultChannel: 'LG.com',
    defaultRegion: 'EU',
    defaultLocale: 'de-DE',
    defaultMarketType: 'B2C',
    defaultArchiveRule: '기존 자산 대체',
    defaultTransferTarget: 'AEM Assets',
    preferredTemplate: 'Gallery Template',
    searchTagPreset: 'lifestyle',
    recentTemplates: [
      { name: 'Gallery Template', count: 6 },
      { name: 'Feature Asset Template', count: 4 },
    ],
  },
  LIBRARIAN: {
    role: 'LIBRARIAN',
    name: '최유나',
    org: 'DAM Admin',
    defaultBU: 'ES',
    defaultChannel: 'Contents Hub',
    defaultRegion: 'Global',
    defaultLocale: 'en-US',
    defaultMarketType: 'B2B',
    defaultArchiveRule: '기존 자산과 병존',
    defaultTransferTarget: 'Contents Hub',
    preferredTemplate: 'Contents Hub Share Template',
    searchTagPreset: 'b2b, catalog',
    recentTemplates: [
      { name: 'Contents Hub Share Template', count: 5 },
      { name: 'Product PDP Template', count: 1 },
    ],
  },
  CNX_QA: {
    role: 'CNX_QA',
    name: '이도윤',
    org: 'CNX QA',
    defaultBU: 'MS',
    defaultChannel: 'LG.com',
    defaultRegion: 'Global',
    defaultLocale: 'en-US',
    defaultMarketType: 'B2C',
    defaultArchiveRule: '신규 등록',
    defaultTransferTarget: 'AEM Assets',
    preferredTemplate: 'Feature Asset Template',
    searchTagPreset: 'feature',
    recentTemplates: [{ name: 'Feature Asset Template', count: 4 }],
  },
  VIEWER: {
    role: 'VIEWER',
    name: '게스트',
    org: 'Viewer',
    defaultBU: 'MS',
    defaultChannel: 'LG.com',
    defaultRegion: 'Global',
    defaultLocale: 'en-US',
    defaultMarketType: 'B2C',
    defaultArchiveRule: '신규 등록',
    defaultTransferTarget: 'AEM Assets',
    preferredTemplate: 'Product PDP Template',
    searchTagPreset: '',
    recentTemplates: [],
  },
}

export function getAccount(role: Role): AccountProfile {
  return ACCOUNT_PROFILES[role] ?? ACCOUNT_PROFILES.HQ_PMO
}
