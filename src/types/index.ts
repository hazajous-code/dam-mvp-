// ===========================================================================
// DAM 고도화 MVP - 핵심 도메인 타입
// ===========================================================================

/** 사용자 역할 */
export type Role =
  | 'HQ_PMO'
  | 'BU_OWNER'
  | 'AGENCY'
  | 'LIBRARIAN'
  | 'CNX_QA'
  | 'VIEWER'

export interface RoleMeta {
  id: Role
  name: string
  description: string
  /** 접근 가능한 메뉴 키 (전부 접근 시 '*') */
  allowedMenus: string[] | '*'
  /** 쓰기/승인 권한 보유 액션 */
  actions: string[]
}

/** 본부 (Business Unit) */
export type BU = 'MS' | 'HS' | 'ES'

/** 퍼블리싱 채널 */
export type Channel = 'LG.com' | 'B2B' | 'Retailer' | 'Criteo' | 'Contents Hub'

/** B2C / B2B 구분 */
export type MarketType = 'B2C' | 'B2B'

/** 프로젝트 상태 */
export type ProjectStatus =
  | 'Draft'
  | 'Metadata Ready'
  | 'Asset Uploading'
  | 'Gatekeeping In Progress'
  | 'Exception Review'
  | 'WCM QA Requested'
  | 'Approved'
  | 'Transferred'
  | 'Rejected'

/** Gatekeeping QA 최종 결과 */
export type QAResult =
  | 'Auto Approved'
  | 'Warning'
  | 'Exception Required'
  | 'Rejected'
  | 'Manual Review'
  | 'Pending'

/** WCM QA 상태 */
export type WcmStatus =
  | 'QA Not Requested'
  | 'QA Requested'
  | 'In Review'
  | 'Approved'
  | 'Rejected'
  | 'Revision Requested'

/** Archive 규칙 */
export type ArchiveRule = '기존 자산 대체' | '기존 자산과 병존' | '신규 등록'

/** 자산 타입 */
export type AssetType =
  | 'Hero Image'
  | 'Gallery Image'
  | 'Feature Image'
  | 'Spec Image'
  | 'Video'
  | '360 Image'
  | 'Zoom Image'
  | 'Document'

/** 룰 심각도 */
export type Severity = 'critical' | 'warning' | 'info'

/** 룰 자동화 수준 */
export type AutomationLevel = 'Auto Approve' | 'Manual Review' | 'Block'

/** 룰 카테고리 */
export type RuleCategory =
  | 'Folder Path Rule'
  | 'Metadata Rule'
  | 'File Naming Rule'
  | 'Channel Rule'
  | 'Locale Rule'
  | 'Archive Rule'
  | 'WCM QA Rule'

// ---------------------------------------------------------------------------

/** PIM2.0 기반 메타데이터 묶음 */
export interface ProjectMetadata {
  assetCreatedYear: string
  region: string
  locale: string
  bu: BU
  pimCategoryLv1: string
  pimCategoryLv2: string
  pimCategoryLv3: string
  pimCategoryLv4: string
  modelTool: string
  pimColor: string
  inch: string
  factoryModel: string
  salesModelSuffix: string
  marketType: MarketType
  publishingChannel: Channel
  assetType: AssetType
  searchTag: string
  transferTarget: string
  archiveRule: ArchiveRule
  qaRequired: boolean
  localizationRequired: boolean
  isProduct: boolean
  /** 누락된 필수 키 목록 (데모용으로 일부 프로젝트에 의도적 누락) */
  missingFields?: string[]
}

/** 업로드 자산 */
export interface Asset {
  id: string
  fileName: string
  assetType: AssetType | ''
  sizeKb: number
  ext: string
  altText: string
  locale: string
  uploadedAt: string
  status: 'uploaded' | 'invalid' | 'duplicate'
  /** 검증 메시지 */
  issues: string[]
}

/** 처리 이력 이벤트 */
export interface TimelineEvent {
  id: string
  at: string
  actor: string
  role: Role
  action: string
  note?: string
}

/** WCM QA 체크 항목 결과 */
export interface WcmCheckItem {
  key: string
  label: string
  status: 'pass' | 'warning' | 'fail'
}

/** 프로젝트 */
export interface Project {
  id: string
  name: string
  bu: BU
  pimCategory: string
  modelTool: string
  locale: string
  publishingChannel: Channel
  marketType: MarketType
  status: ProjectStatus
  qaResult: QAResult
  wcmStatus: WcmStatus
  owner: string
  template: string
  damPath: string
  metadata: ProjectMetadata
  assets: Asset[]
  wcmChecks: WcmCheckItem[]
  timeline: TimelineEvent[]
  metaCompletion: number // 0~100 필수 메타데이터 완료율
  createdAt: string
  updatedAt: string
  isException: boolean
  transferred: boolean
}

/** 자동화 룰 */
export interface Rule {
  id: string
  category: RuleCategory
  name: string
  description: string
  severity: Severity
  automationLevel: AutomationLevel
  appliedTemplate: string
  enabled: boolean
}

/** QA 엔진 단일 검증 결과 */
export interface QACheckResult {
  ruleId: string
  ruleName: string
  status: 'pass' | 'warning' | 'fail'
  severity: Severity
  message: string
  recommendation: string
}

/** 메타데이터 정의 (Template & Metadata 화면) */
export type MetadataGroup =
  | 'DAM 필수 전송 값'
  | '프로젝트 참고 값'
  | '자동 입력 가능 값'
  | '추천 입력 값'
  | '이관 시점 확정 값'

export interface MetadataField {
  key: string
  label: string
  group: MetadataGroup
  example: string
  required: boolean
  /** 적용 템플릿 */
  templates: string[]
}

/** 템플릿 정의 */
export interface TemplateDef {
  id: string
  name: string
  description: string
}
