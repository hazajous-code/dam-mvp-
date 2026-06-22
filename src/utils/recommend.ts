import type { BU, Channel, ArchiveRule } from '../types'
import { TEMPLATES } from '../data/templates'
import type { AccountProfile } from '../data/accounts'

// ===========================================================================
// 계정별 템플릿/메타데이터 추천 엔진
// 채널·카테고리 규칙 + 계정 선호도/사용 이력을 가중 합산해 추천한다.
// ===========================================================================

export interface TemplateRecommendation {
  template: string
  confidence: number // 0~100
  reason: string
  alternatives: { template: string; reason: string }[]
}

export interface MetadataRecommendation {
  region: string
  locale: string
  archiveRule: ArchiveRule
  searchTag: string
  notes: string[]
}

export function recommendTemplate(input: {
  bu: BU
  lv2: string
  lv3: string
  lv4: string
  channel: Channel
  isProduct: boolean
  account: AccountProfile
}): TemplateRecommendation {
  const { lv2, lv3, lv4, channel, isProduct, account } = input

  const scores: Record<string, { score: number; reasons: string[] }> = {}
  const add = (name: string, s: number, reason: string) => {
    if (!scores[name]) scores[name] = { score: 0, reasons: [] }
    scores[name].score += s
    if (reason) scores[name].reasons.push(reason)
  }

  // 1) 채널 기반 (가장 강한 신호)
  if (channel === 'Contents Hub') add('Contents Hub Share Template', 50, 'Contents Hub 채널')
  if (channel === 'Retailer') add('Retailer Package Template', 50, 'Retailer 배포 채널')
  if (channel === 'Criteo') add('Feature Asset Template', 35, 'Criteo 광고 소재')

  // 2) 카테고리 기반 (LV2~LV4)
  const cat = `${lv2} ${lv3} ${lv4}`.toLowerCase()
  if (/vacuum|styler|air care|life|gallery/.test(cat)) add('Gallery Template', 30, '라이프스타일/갤러리 성격')
  if (/(tv|monitor|laptop|gram|refriger|built|oven|dishwash)/.test(cat) && isProduct)
    add('Product PDP Template', 35, '제품 PDP 표준 카테고리')
  if (/feature/.test(cat)) add('Feature Asset Template', 25, '기능 소구 자산')

  // 3) 제품 기본선
  if (isProduct && channel === 'LG.com') add('Product PDP Template', 20, 'LG.com 제품 페이지')
  if (isProduct && channel === 'B2B') add('Product PDP Template', 15, 'B2B 제품 페이지')

  // 4) 계정 선호도 / 사용 이력
  add(account.preferredTemplate, 25, `${account.name} 계정 선호 템플릿`)
  account.recentTemplates.forEach((t) =>
    add(t.name, Math.min(18, t.count * 3), `최근 ${t.count}회 사용`),
  )

  // 5) 전체 후보 baseline (항상 하나는 선택되도록)
  TEMPLATES.forEach((t) => add(t.name, 1, ''))

  const ranked = Object.entries(scores).sort((a, b) => b[1].score - a[1].score)
  const [topName, top] = ranked[0]
  const second = ranked[1]?.[1].score ?? 0
  const confidence = Math.max(
    58,
    Math.min(97, Math.round((top.score / (top.score + second || 1)) * 100)),
  )
  const alternatives = ranked
    .slice(1, 3)
    .map(([name, v]) => ({ template: name, reason: v.reasons[0] || '대안 후보' }))

  return {
    template: topName,
    confidence,
    reason: top.reasons.slice(0, 2).join(' · ') || '계정 기본 추천',
    alternatives,
  }
}

export function recommendMetadata(input: {
  channel: Channel
  lv3: string
  modelTool: string
  account: AccountProfile
}): MetadataRecommendation {
  const { lv3, modelTool, account } = input
  const searchTag = [account.searchTagPreset, lv3, modelTool]
    .filter(Boolean)
    .join(', ')
    .toLowerCase()

  const notes: string[] = [`${account.name} 계정 기본값 기반 자동 추천`]

  return {
    region: account.defaultRegion,
    locale: account.defaultLocale,
    archiveRule: account.defaultArchiveRule,
    searchTag,
    notes,
  }
}
