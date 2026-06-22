import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { TEMPLATES } from '../data/templates'
import { ACCOUNT_PROFILES, getAccount } from '../data/accounts'
import { getRole } from '../data/roles'
import { recommendTemplate, recommendMetadata } from '../utils/recommend'
import {
  PIM_CATEGORY_TREE,
  CHANNELS,
  LOCALES,
  REGIONS,
  ARCHIVE_RULE_OPTIONS,
} from '../data/mockMetadata'
import type {
  BU,
  Channel,
  MarketType,
  Project,
  ProjectMetadata,
  ArchiveRule,
  Role,
} from '../types'
import { nowStamp } from '../utils/format'

const STEPS = ['기본 정보', '채널 & 로케일', '템플릿 선택', '메타데이터 매핑', '생성']

// 기본 목표 이관일: 오늘 + 30일 (YYYY-MM-DD)
function defaultTransferDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

interface FormState {
  name: string
  bu: BU // PIM Category LV1
  isProduct: boolean
  lv2: string
  lv3: string
  lv4: string
  modelTool: string
  factoryModel: string
  salesModelSuffix: string
  assetCreatedYear: string
  channel: Channel
  region: string
  locale: string
  localizationRequired: boolean
  marketType: MarketType
  template: string
  archiveRule: ArchiveRule
  transferTarget: string
  searchTag: string
}

export default function CreateProject() {
  const { addProject, addTimeline, role } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  // 계정 기준 (데모): 기본은 현재 로그인 역할, 전환 시 해당 계정의 기본값 자동 적용
  const [accountRole, setAccountRole] = useState<Role>(role)
  const account = getAccount(accountRole)
  const [autoFilled, setAutoFilled] = useState(true)

  const [form, setForm] = useState<FormState>(() => ({
    name: '',
    bu: account.defaultBU,
    isProduct: true,
    lv2: '',
    lv3: '',
    lv4: '',
    modelTool: '',
    factoryModel: '',
    salesModelSuffix: '',
    assetCreatedYear: '2026',
    channel: account.defaultChannel,
    region: account.defaultRegion,
    locale: account.defaultLocale,
    localizationRequired: false,
    marketType: account.defaultMarketType,
    template: account.preferredTemplate,
    archiveRule: account.defaultArchiveRule,
    transferTarget: defaultTransferDate(),
    searchTag: account.searchTagPreset,
  }))

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  // 계정 전환 시 기본값 자동 입력 (최초 마운트는 건너뜀)
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const a = getAccount(accountRole)
    setForm((f) => ({
      ...f,
      bu: a.defaultBU,
      lv2: '',
      lv3: '',
      lv4: '',
      channel: a.defaultChannel,
      region: a.defaultRegion,
      locale: a.defaultLocale,
      marketType: a.defaultMarketType,
      template: a.preferredTemplate,
      archiveRule: a.defaultArchiveRule,
      searchTag: a.searchTagPreset,
    }))
    setAutoFilled(true)
  }, [accountRole])

  const tree = PIM_CATEGORY_TREE[form.bu] as Record<string, Record<string, readonly string[]>>
  const lv2Options = Object.keys(tree)
  const lv3Options = form.lv2 ? Object.keys(tree[form.lv2] ?? {}) : []
  const lv4Options = form.lv2 && form.lv3 ? tree[form.lv2]?.[form.lv3] ?? [] : []

  // 추천 엔진
  const rec = useMemo(
    () =>
      recommendTemplate({
        bu: form.bu,
        lv2: form.lv2,
        lv3: form.lv3,
        lv4: form.lv4,
        channel: form.channel,
        isProduct: form.isProduct,
        account,
      }),
    [form.bu, form.lv2, form.lv3, form.lv4, form.channel, form.isProduct, account],
  )
  const recMeta = useMemo(
    () =>
      recommendMetadata({
        channel: form.channel,
        lv3: form.lv3,
        modelTool: form.modelTool,
        account,
      }),
    [form.channel, form.lv3, form.modelTool, account],
  )

  const mapping = useMemo(() => {
    const pimValues = [
      { k: 'PIM Category LV1 (BU)', v: form.bu },
      { k: 'PIM Category LV2', v: form.lv2 },
      { k: 'PIM Category LV3', v: form.lv3 },
      { k: 'PIM Category LV4', v: form.lv4 },
    ]
    const userValues = [
      { k: 'Project Name', v: form.name },
      { k: 'Model / Tool', v: form.modelTool },
      { k: 'Factory Model', v: form.factoryModel },
      { k: 'Search Tag', v: form.searchTag },
    ]
    const damRequired = [
      { k: 'Locale', v: form.locale },
      { k: 'Publishing Channel', v: form.channel },
      { k: 'B2C / B2B', v: form.marketType },
      { k: 'Asset Type', v: 'Hero Image (기본)' },
      { k: 'Transfer Target', v: form.transferTarget },
      { k: 'Archive Rule', v: form.archiveRule },
    ]
    const missing = [
      ...(!form.modelTool ? ['Model / Tool'] : []),
      ...(!form.lv2 ? ['PIM Category LV2'] : []),
      ...(!form.name ? ['Project Name'] : []),
    ]
    return { pimValues, userValues, damRequired, missing }
  }, [form])

  const previewPath = `/${form.bu}/${form.lv2 || 'Category'}/${form.lv3 || 'Sub'}/${form.modelTool || 'Model'}/${form.channel.replace('.', '')}/${form.locale}`

  const requiredOk = !!(form.name && form.modelTool && form.lv2)
  const canNext = step !== 0 || (!!form.name && !!form.lv2 && !!form.modelTool)

  const applyRecommendedTemplate = () => set({ template: rec.template })
  const applyRecommendedMetadata = () =>
    set({
      region: recMeta.region,
      locale: recMeta.locale,
      archiveRule: recMeta.archiveRule,
      searchTag: recMeta.searchTag,
    })

  const handleCreate = () => {
    const seq = Math.floor(Math.random() * 9000) + 1000
    const id = `PRJ-${seq}`
    const metadata: ProjectMetadata = {
      assetCreatedYear: form.assetCreatedYear,
      region: form.region,
      locale: form.locale,
      bu: form.bu,
      pimCategoryLv1: form.bu, // BU = PIM Category LV1
      pimCategoryLv2: form.lv2,
      pimCategoryLv3: form.lv3,
      pimCategoryLv4: form.lv4,
      modelTool: form.modelTool,
      pimColor: '',
      inch: '',
      factoryModel: form.factoryModel,
      salesModelSuffix: form.salesModelSuffix,
      marketType: form.marketType,
      publishingChannel: form.channel,
      assetType: 'Hero Image',
      searchTag: form.searchTag,
      transferTarget: form.transferTarget,
      archiveRule: form.archiveRule,
      qaRequired: true,
      localizationRequired: form.localizationRequired,
      isProduct: form.isProduct,
      missingFields: [],
    }
    const ownerLabel = `${account.name} (${getRole(account.role).name})`
    const project: Project = {
      id,
      name: form.name,
      bu: form.bu,
      pimCategory: [form.lv2, form.lv3, form.lv4].filter(Boolean).join(' > '),
      modelTool: form.modelTool,
      locale: form.locale,
      publishingChannel: form.channel,
      marketType: form.marketType,
      status: 'Metadata Ready',
      qaResult: 'Pending',
      wcmStatus: 'QA Not Requested',
      owner: ownerLabel,
      template: form.template,
      damPath: previewPath,
      metadata,
      assets: [],
      wcmChecks: [],
      metaCompletion: requiredOk ? 90 : 70,
      timeline: [
        {
          id: `E-${Date.now()}`,
          at: nowStamp(),
          actor: account.name,
          role: account.role,
          action: '프로젝트 생성',
          note: `${account.org} 계정 기본값 + 추천 템플릿(${form.template}) 적용`,
        },
      ],
      createdAt: nowStamp().slice(0, 10),
      updatedAt: nowStamp().slice(0, 10),
      isException: false,
      transferred: false,
    }
    addProject(project)
    addTimeline(id, '메타데이터 매핑 완료')
    nav(`/projects/${id}`)
  }

  return (
    <div>
      <PageHeader title="Create Project" description="PIM2.0 기준정보 기반 프로젝트 생성 Wizard" />

      {/* 계정 기준 + 자동입력/추천 안내 */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-700">
              {account.name.slice(0, 1)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink-900">{account.name}</p>
              <p className="text-[11px] text-ink-500">{account.org}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-ink-500">계정 기준 (데모)</label>
            <select
              className="input max-w-[200px] py-1.5 text-sm"
              value={accountRole}
              onChange={(e) => setAccountRole(e.target.value as Role)}
            >
              {Object.values(ACCOUNT_PROFILES)
                .filter((a) => a.role !== 'VIEWER')
                .map((a) => (
                  <option key={a.role} value={a.role}>
                    {a.name} · {a.org}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-ink-500">계정 기본값 자동 입력:</span>
          <StatusBadge label={`BU ${account.defaultBU}`} />
          <StatusBadge label={account.defaultChannel} />
          <StatusBadge label={account.defaultLocale} />
          <StatusBadge label={account.defaultArchiveRule} />
          <StatusBadge label={`선호: ${account.preferredTemplate}`} className="border-brand-200 bg-brand-50 text-brand-700" />
        </div>

        {autoFilled && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
            <span>✓ <b>{account.name}</b> 계정의 기본값을 자동 입력했습니다. 필요 시 각 단계에서 수정할 수 있습니다.</span>
            <button className="text-ink-400 hover:text-ink-700" onClick={() => setAutoFilled(false)}>✕</button>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i === step ? 'bg-brand-500 text-white' : i < step ? 'bg-emerald-500 text-white' : 'bg-cream-300 text-ink-500'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-ink-900' : 'text-ink-300'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 text-ink-300">→</span>}
          </div>
        ))}
      </div>

      <div className="card p-5">
        {/* Step 1 */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Project Name *</label>
              <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="예: MS OLED TV 2026 PDP Asset Package" />
            </div>
            <div>
              <label className="label">BU * <span className="font-normal text-ink-300">= PIM Category LV1</span></label>
              <select className="input" value={form.bu} onChange={(e) => set({ bu: e.target.value as BU, lv2: '', lv3: '', lv4: '' })}>
                <option>MS</option><option>HS</option><option>ES</option>
              </select>
            </div>
            <div>
              <label className="label">Product / Non-product</label>
              <select className="input" value={form.isProduct ? 'product' : 'non'} onChange={(e) => set({ isProduct: e.target.value === 'product' })}>
                <option value="product">Product</option>
                <option value="non">Non-product</option>
              </select>
            </div>
            <div>
              <label className="label">PIM Category LV2 *</label>
              <select className="input" value={form.lv2} onChange={(e) => set({ lv2: e.target.value, lv3: '', lv4: '' })}>
                <option value="">선택</option>
                {lv2Options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">PIM Category LV3</label>
              <select className="input" value={form.lv3} onChange={(e) => set({ lv3: e.target.value, lv4: '' })} disabled={!form.lv2}>
                <option value="">선택</option>
                {lv3Options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">PIM Category LV4</label>
              <select className="input" value={form.lv4} onChange={(e) => set({ lv4: e.target.value })} disabled={!form.lv3}>
                <option value="">선택</option>
                {lv4Options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Model / Tool *</label>
              <input className="input" value={form.modelTool} onChange={(e) => set({ modelTool: e.target.value })} placeholder="예: OLED65G5" />
            </div>
            <div>
              <label className="label">Factory Model</label>
              <input className="input" value={form.factoryModel} onChange={(e) => set({ factoryModel: e.target.value })} placeholder="예: OLED65G5PSA" />
            </div>
            <div>
              <label className="label">Sales Model Suffix</label>
              <input className="input" value={form.salesModelSuffix} onChange={(e) => set({ salesModelSuffix: e.target.value })} placeholder="예: .AKR" />
            </div>
            <div>
              <label className="label">Asset Created Year</label>
              <input className="input" value={form.assetCreatedYear} onChange={(e) => set({ assetCreatedYear: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Publishing Channel</label>
              <select className="input" value={form.channel} onChange={(e) => set({ channel: e.target.value as Channel })}>
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Region</label>
              <select className="input" value={form.region} onChange={(e) => set({ region: e.target.value })}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Locale</label>
              <select className="input" value={form.locale} onChange={(e) => set({ locale: e.target.value })}>
                {LOCALES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">B2C / B2B</label>
              <select className="input" value={form.marketType} onChange={(e) => set({ marketType: e.target.value as MarketType })}>
                <option>B2C</option><option>B2B</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={form.localizationRequired} onChange={(e) => set({ localizationRequired: e.target.checked })} />
                Localization Required (다국어 자산 필요)
              </label>
            </div>
          </div>
        )}

        {/* Step 3 - 템플릿 선택 + 추천 */}
        {step === 2 && (
          <div>
            {/* 추천 패널 */}
            <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">AI 추천</span>
                  <p className="font-display text-base font-bold text-ink-900">{rec.template}</p>
                  <span className="text-xs font-semibold text-brand-700">신뢰도 {rec.confidence}%</span>
                </div>
                <button className="btn-primary py-1.5 text-xs" onClick={applyRecommendedTemplate} disabled={form.template === rec.template}>
                  {form.template === rec.template ? '적용됨' : '추천 적용'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-ink-700">
                추천 근거: {rec.reason} <span className="text-ink-300">· {account.name} 계정 + {form.channel} 채널 기준</span>
              </p>
              {rec.alternatives.length > 0 && (
                <p className="mt-1 text-[11px] text-ink-500">
                  대안: {rec.alternatives.map((a) => a.template).join(' · ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TEMPLATES.map((t) => {
                const isRec = t.name === rec.template
                const selected = form.template === t.name
                return (
                  <button
                    key={t.id}
                    onClick={() => set({ template: t.name })}
                    className={`relative rounded-lg border p-4 text-left transition-colors ${
                      selected ? 'border-brand-500 bg-brand-50' : 'border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {isRec && (
                      <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        추천
                      </span>
                    )}
                    <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                    <p className="mt-1 text-xs text-ink-500">{t.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4 - 메타데이터 매핑 */}
        {step === 3 && (
          <div>
            <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <div className="text-xs text-emerald-700">
                <b>{account.name} 계정 추천값</b> — Region {recMeta.region} · {recMeta.locale} · {recMeta.archiveRule}
              </div>
              <button className="btn-secondary py-1.5 text-xs" onClick={applyRecommendedMetadata}>
                추천값 적용
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MappingBox title="PIM에서 가져온 값" tone="sky" items={mapping.pimValues} />
              <MappingBox title="사용자가 입력한 값" tone="slate" items={mapping.userValues} />
              <MappingBox title="DAM으로 전송되는 필수 값" tone="brand" items={mapping.damRequired} />
              <MappingBox
                title="자동 추천 값 (계정 기반)"
                tone="emerald"
                items={[
                  { k: 'Region', v: recMeta.region },
                  { k: 'Locale', v: recMeta.locale },
                  { k: 'Archive Rule', v: recMeta.archiveRule },
                  { k: 'Search Tag', v: recMeta.searchTag },
                ]}
              />
              {mapping.missing.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 md:col-span-2">
                  <p className="text-sm font-semibold text-rose-700">누락 값</p>
                  <p className="mt-1 text-xs text-rose-600">{mapping.missing.join(', ')} — 이전 단계에서 입력해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="label">생성 예상 폴더 경로</label>
              <div className="rounded-lg bg-ink-900 p-3 font-mono text-sm text-emerald-300">{previewPath}</div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="label">Archive Rule</label>
                <select className="input" value={form.archiveRule} onChange={(e) => set({ archiveRule: e.target.value as ArchiveRule })}>
                  {ARCHIVE_RULE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Transfer Target (목표 이관일)</label>
                <input type="date" className="input" value={form.transferTarget} onChange={(e) => set({ transferTarget: e.target.value })} />
                <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-600">
                  <span>⚠</span> 설정한 날짜로부터 60일 이후 프로젝트 삭제 알림이 발송될 수 있습니다.
                </p>
              </div>
              <div>
                <label className="label">Search Tag</label>
                <input className="input" value={form.searchTag} onChange={(e) => set({ searchTag: e.target.value })} placeholder="쉼표로 구분" />
              </div>
            </div>
            <div className="rounded-lg border border-cream-300 p-4">
              <p className="mb-2 text-sm font-semibold text-ink-700">필수 메타데이터 체크</p>
              <div className="flex flex-wrap gap-2">
                {requiredOk
                  ? <StatusBadge label="필수 메타데이터 충족" kind="check" />
                  : <StatusBadge label="필수 항목 누락" kind="check" className="bg-rose-50 text-rose-700 border-rose-200" />}
                <StatusBadge label={`Channel: ${form.channel}`} />
                <StatusBadge label={`Locale: ${form.locale}`} />
                <StatusBadge label={`Template: ${form.template}`} />
                <StatusBadge label={`Owner: ${account.name}`} />
              </div>
            </div>
            <button className="btn-primary w-full md:w-auto" disabled={!requiredOk} onClick={handleCreate}>
              프로젝트 생성
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-cream-300 pt-4">
          <button className="btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← 이전</button>
          {step < 4 ? (
            <button className="btn-primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>다음 →</button>
          ) : (
            <span className="text-xs text-ink-300">마지막 단계입니다.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MappingBox({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'sky' | 'slate' | 'brand' | 'emerald'
  items: { k: string; v: string }[]
}) {
  const head: Record<string, string> = {
    sky: 'text-sky-700',
    slate: 'text-ink-700',
    brand: 'text-brand-600',
    emerald: 'text-emerald-700',
  }
  return (
    <div className="rounded-lg border border-cream-300 p-3">
      <p className={`mb-2 text-sm font-semibold ${head[tone]}`}>{title}</p>
      <dl className="space-y-1">
        {items.map((it) => (
          <div key={it.k} className="flex justify-between gap-2 text-xs">
            <dt className="text-ink-400">{it.k}</dt>
            <dd className={`text-right font-medium ${it.v ? 'text-ink-700' : 'text-rose-500'}`}>{it.v || '미입력'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
