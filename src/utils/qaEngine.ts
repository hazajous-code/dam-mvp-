import type {
  Project,
  Asset,
  QACheckResult,
  QAResult,
} from '../types'

// ===========================================================================
// QA 엔진
// 원칙: 경로 준수는 QA의 일부 조건일 뿐, QA 자체가 아니다.
//       정상 건은 자동 승인하고, 예외 건만 사람이 검토한다.
// ===========================================================================

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'pdf']
const FORBIDDEN_CHARS = /[ #%&{}<>*?$!'":@+`|=]/

function pass(
  ruleId: string,
  ruleName: string,
  severity: QACheckResult['severity'],
  message: string,
): QACheckResult {
  return { ruleId, ruleName, status: 'pass', severity, message, recommendation: '' }
}

// --- 개별 검증 함수 -------------------------------------------------------

export function validateMetadata(project: Project): QACheckResult {
  const m = project.metadata
  const requiredKeys: (keyof typeof m)[] = [
    'locale',
    'publishingChannel',
    'modelTool',
    'assetType',
    'region',
  ]
  const missing = requiredKeys.filter((k) => !m[k] || String(m[k]).trim() === '')
  // 의도적으로 누락 표시된 필드도 포함
  const explicit = (m.missingFields ?? []).filter((f) => !missing.includes(f as any))
  const all = [...missing, ...explicit]
  if (all.length === 0) {
    return pass('R-MD-01', '필수 메타데이터 존재', 'critical', '필수 메타데이터가 모두 입력되었습니다.')
  }
  return {
    ruleId: 'R-MD-01',
    ruleName: '필수 메타데이터 존재',
    status: 'fail',
    severity: 'critical',
    message: `필수 메타데이터 누락: ${all.join(', ')}`,
    recommendation: 'PIM2.0 매핑 또는 수기 입력으로 누락 항목을 채워야 합니다.',
  }
}

export function validateFolderPath(project: Project): QACheckResult {
  const segs = project.damPath.split('/').filter(Boolean)
  // 표준: BU/Category../Model/Channel/Locale → 최소 5 depth
  if (project.damPath.startsWith('/') && segs.length >= 5) {
    return pass('R-FP-01', 'DAM 표준 폴더 경로 준수', 'critical', `표준 경로 규칙을 준수합니다. (${project.damPath})`)
  }
  return {
    ruleId: 'R-FP-01',
    ruleName: 'DAM 표준 폴더 경로 준수',
    status: 'fail',
    severity: 'critical',
    message: `폴더 경로 규칙 위반: ${project.damPath || '(미지정)'}`,
    recommendation: 'BU/Category/Model/Channel/Locale 순서의 표준 경로로 재구성하세요.',
  }
}

export function validateChannel(project: Project): QACheckResult {
  const ch = project.metadata.publishingChannel
  if (!ch) {
    return {
      ruleId: 'R-CH-01',
      ruleName: 'Publishing Channel 일치',
      status: 'fail',
      severity: 'critical',
      message: 'Publishing Channel 값이 없습니다.',
      recommendation: 'Channel & Locale 단계에서 채널을 지정하세요.',
    }
  }
  return pass('R-CH-01', 'Publishing Channel 일치', 'critical', `채널: ${ch}`)
}

export function validateMarketType(project: Project): QACheckResult {
  if (project.metadata.marketType) {
    return pass('R-CH-02', 'B2C / B2B 값 존재', 'critical', `시장 구분: ${project.metadata.marketType}`)
  }
  return {
    ruleId: 'R-CH-02',
    ruleName: 'B2C / B2B 값 존재',
    status: 'fail',
    severity: 'critical',
    message: 'B2C / B2B 값이 없습니다.',
    recommendation: '시장 구분 값을 입력하세요.',
  }
}

export function validateLocale(project: Project): QACheckResult {
  const loc = project.metadata.locale
  if (loc && /^[a-z]{2}-[A-Z]{2}$/.test(loc)) {
    return pass('R-LO-01', 'Locale 값 존재 및 형식', 'critical', `Locale: ${loc}`)
  }
  if (loc) {
    return {
      ruleId: 'R-LO-01',
      ruleName: 'Locale 값 존재 및 형식',
      status: 'warning',
      severity: 'warning',
      message: `Locale 형식이 표준(xx-XX)과 다릅니다: ${loc}`,
      recommendation: 'ISO 형식(예: en-US)으로 정규화하세요.',
    }
  }
  return {
    ruleId: 'R-LO-01',
    ruleName: 'Locale 값 존재 및 형식',
    status: 'fail',
    severity: 'critical',
    message: 'Locale 값이 없습니다.',
    recommendation: 'Locale 값을 지정하세요.',
  }
}

export function validateArchiveRule(project: Project): QACheckResult {
  if (project.metadata.archiveRule) {
    return pass('R-AR-01', 'Archive Rule 존재', 'critical', `Archive Rule: ${project.metadata.archiveRule}`)
  }
  return {
    ruleId: 'R-AR-01',
    ruleName: 'Archive Rule 존재',
    status: 'fail',
    severity: 'critical',
    message: 'Archive Rule이 지정되지 않았습니다.',
    recommendation: '대체 / 병존 / 신규 등록 중 하나를 지정하세요.',
  }
}

export function validateTransferTarget(project: Project): QACheckResult {
  if (project.metadata.transferTarget) {
    return pass('R-TT-01', '목표 이관일(Transfer Target) 존재', 'critical', `목표 이관일: ${project.metadata.transferTarget}`)
  }
  return {
    ruleId: 'R-TT-01',
    ruleName: '목표 이관일(Transfer Target) 존재',
    status: 'fail',
    severity: 'critical',
    message: '목표 이관일이 지정되지 않았습니다.',
    recommendation: '이관 목표 날짜를 지정하세요. (해당일 + 60일 후 삭제 알림 발송 가능)',
  }
}

export function validateAssetCreatedYear(project: Project): QACheckResult {
  if (project.metadata.assetCreatedYear) {
    return pass('R-MD-02', 'Asset Created Year 존재', 'warning', `Asset Created Year: ${project.metadata.assetCreatedYear}`)
  }
  return {
    ruleId: 'R-MD-02',
    ruleName: 'Asset Created Year 존재',
    status: 'warning',
    severity: 'warning',
    message: 'Asset Created Year가 없습니다.',
    recommendation: '자산 생성 연도를 입력하면 아카이브/검색 정확도가 향상됩니다.',
  }
}

export function validateSearchTag(project: Project): QACheckResult {
  if (project.metadata.searchTag && project.metadata.searchTag.trim() !== '') {
    return pass('R-MD-03', 'Search Tag 권장 입력', 'info', 'Search Tag가 입력되었습니다.')
  }
  return {
    ruleId: 'R-MD-03',
    ruleName: 'Search Tag 권장 입력',
    status: 'warning',
    severity: 'info',
    message: 'Search Tag가 비어 있습니다.',
    recommendation: '검색성 향상을 위해 Search Tag 입력을 권장합니다.',
  }
}

// 파일 단위 검증
export function validateFileNaming(asset: Asset, project: Project): QACheckResult {
  const name = asset.fileName
  const ext = (asset.ext || name.split('.').pop() || '').toLowerCase()
  const issues: string[] = []
  const model = project.modelTool.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const flat = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

  if (model && !flat.includes(model)) {
    issues.push('파일명에 Model/SKU 미포함')
  }
  if (FORBIDDEN_CHARS.test(name)) {
    issues.push('금지 문자(공백/특수문자) 포함')
  }
  if (!ALLOWED_EXT.includes(ext)) {
    issues.push(`비허용 확장자(.${ext})`)
  }
  if (!asset.assetType) {
    issues.push('Asset Type 누락')
  }

  if (issues.length === 0) {
    return pass('R-FN-01', `파일명 규칙 (${name})`, 'critical', '파일명 규칙을 준수합니다.')
  }
  const critical = issues.some(
    (i) => i.includes('Model') || i.includes('비허용'),
  )
  return {
    ruleId: 'R-FN-01',
    ruleName: `파일명 규칙 (${name})`,
    status: critical ? 'fail' : 'warning',
    severity: critical ? 'critical' : 'warning',
    message: issues.join(', '),
    recommendation: '파일명 컨벤션(Model_AssetType_Locale.ext)에 맞게 수정하세요.',
  }
}

export function validateDuplicateAssets(project: Project): QACheckResult {
  const names = project.assets.map((a) => a.fileName.toLowerCase())
  const dup = names.filter((n, i) => names.indexOf(n) !== i)
  if (dup.length === 0) {
    return pass('R-FN-04', '중복 자산 여부', 'warning', '중복 파일이 없습니다.')
  }
  return {
    ruleId: 'R-FN-04',
    ruleName: '중복 자산 여부',
    status: 'warning',
    severity: 'warning',
    message: `중복 파일: ${[...new Set(dup)].join(', ')}`,
    recommendation: '중복 자산을 제거하거나 버전 규칙을 적용하세요.',
  }
}

export function validateAssetTypePresence(project: Project): QACheckResult {
  if (project.assets.length === 0) {
    return {
      ruleId: 'R-AT-01',
      ruleName: 'Asset Type 존재',
      status: 'warning',
      severity: 'warning',
      message: '업로드된 자산이 없습니다.',
      recommendation: 'Asset Upload 화면에서 자산을 업로드하세요.',
    }
  }
  const missing = project.assets.filter((a) => !a.assetType)
  if (missing.length === 0) {
    return pass('R-AT-01', 'Asset Type 존재', 'warning', '모든 자산에 Asset Type이 지정되었습니다.')
  }
  return {
    ruleId: 'R-AT-01',
    ruleName: 'Asset Type 존재',
    status: 'warning',
    severity: 'warning',
    message: `${missing.length}개 자산의 Asset Type이 누락되었습니다.`,
    recommendation: 'Asset Type을 지정하세요.',
  }
}

// --- 전체 Gatekeeping 실행 -------------------------------------------------

export function runGatekeeping(project: Project): QACheckResult[] {
  const results: QACheckResult[] = [
    validateMetadata(project),
    validateFolderPath(project),
    validateChannel(project),
    validateMarketType(project),
    validateLocale(project),
    validateArchiveRule(project),
    validateTransferTarget(project),
    validateAssetCreatedYear(project),
    validateSearchTag(project),
    validateAssetTypePresence(project),
    validateDuplicateAssets(project),
  ]
  // 파일명 검증 (자산별)
  project.assets.forEach((a) => results.push(validateFileNaming(a, project)))
  return results
}

// 최종 QA 결과 계산
export function computeQAResult(results: QACheckResult[]): QAResult {
  const criticalFails = results.filter(
    (r) => r.status === 'fail' && r.severity === 'critical',
  )
  const warnings = results.filter((r) => r.status === 'warning')

  // 필수 필드 다수(3+) 누락 시 Rejected
  if (criticalFails.length >= 3) return 'Rejected'
  // critical fail 1~2개 → 예외 검토 필요
  if (criticalFails.length >= 1) return 'Exception Required'
  // 경고만 존재
  if (warnings.length > 0) return 'Warning'
  // 전부 통과
  return 'Auto Approved'
}

// WCM QA 결과 계산
export function computeWcmResult(project: Project) {
  const fails = project.wcmChecks.filter((c) => c.status === 'fail')
  const warns = project.wcmChecks.filter((c) => c.status === 'warning')
  return {
    fails: fails.length,
    warns: warns.length,
    passes: project.wcmChecks.filter((c) => c.status === 'pass').length,
    canTransfer: fails.length === 0,
  }
}

// 이관 가능 여부 종합 판단
export function canTransfer(project: Project): { ready: boolean; reasons: string[] } {
  const reasons: string[] = []
  const gk = computeQAResult(runGatekeeping(project))
  if (gk === 'Rejected' || gk === 'Exception Required') {
    reasons.push(`Gatekeeping 미승인 (${gk})`)
  }
  if (project.wcmStatus !== 'Approved') {
    reasons.push(`WCM QA 미승인 (${project.wcmStatus})`)
  }
  if (project.metaCompletion < 100) {
    reasons.push(`필수 메타데이터 완료율 ${project.metaCompletion}%`)
  }
  if (!project.metadata.transferTarget) {
    reasons.push('목표 이관일 미지정')
  }
  return { ready: reasons.length === 0, reasons }
}
