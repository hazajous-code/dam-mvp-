import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import IntegrationNote from '../components/IntegrationNote'
import { BU_COLORS, pct } from '../utils/format'
import type { BU, Channel } from '../types'

const STATUS_COLORS = ['#94a3b8', '#38bdf8', '#818cf8', '#f59e0b', '#fb923c', '#a78bfa', '#34d399', '#059669', '#f43f5e']

export default function Dashboard() {
  const { projects } = useApp()
  const nav = useNavigate()

  const stats = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter(
      (p) => !['Transferred', 'Rejected', 'Draft'].includes(p.status),
    ).length
    const autoApproved = projects.filter((p) => p.qaResult === 'Auto Approved').length
    const exceptions = projects.filter((p) => p.isException || p.qaResult === 'Exception Required').length
    const transferred = projects.filter((p) => p.transferred).length
    const wcmWaiting = projects.filter((p) =>
      ['QA Requested', 'In Review'].includes(p.wcmStatus),
    ).length
    const avgMeta = projects.reduce((s, p) => s + p.metaCompletion, 0) / (total || 1)
    const metaMissingRate = 100 - avgMeta

    const buCounts: Record<BU, number> = { MS: 0, HS: 0, ES: 0 }
    projects.forEach((p) => (buCounts[p.bu] += 1))

    const channels: Channel[] = ['LG.com', 'B2B', 'Criteo', 'Retailer', 'Contents Hub']
    const channelCounts = channels.map((c) => ({
      name: c,
      value: projects.filter((p) => p.publishingChannel === c).length,
    }))

    // 상태별 분포
    const statusDist = Object.entries(
      projects.reduce<Record<string, number>>((acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1
        return acc
      }, {}),
    ).map(([name, value]) => ({ name, value }))

    // 본부별 예외 건수
    const buException = (['MS', 'HS', 'ES'] as BU[]).map((bu) => ({
      name: bu,
      예외: projects.filter((p) => p.bu === bu && (p.isException || p.qaResult === 'Exception Required')).length,
      전체: projects.filter((p) => p.bu === bu).length,
    }))

    // QA 자동 승인 비율
    const qaDecided = projects.filter((p) => p.qaResult !== 'Pending')
    const autoRatio = qaDecided.length
      ? (autoApproved / qaDecided.length) * 100
      : 0

    // 월별 이관 추이 (데모 고정 + 현재 반영)
    const monthly = [
      { month: '2월', 이관: 6 },
      { month: '3월', 이관: 9 },
      { month: '4월', 이관: 12 },
      { month: '5월', 이관: 11 + (transferred > 0 ? 1 : 0) },
      { month: '6월', 이관: transferred },
    ]

    return {
      total, inProgress, autoApproved, exceptions, transferred, wcmWaiting,
      metaMissingRate, buCounts, channelCounts, statusDist, buException, autoRatio, monthly,
    }
  }, [projects])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="글로벌 DAM 운영 현황을 한눈에 확인합니다."
      />

      <IntegrationNote
        className="mb-4"
        system="집계"
        detail="현재 KPI·차트는 mock 기준. 실제로는 DAM(AEM Assets)·WCM(AEM Pages)·PIM2.0·GP1 Admin의 상태/이력 API를 배치 집계하거나 데이터웨어하우스에서 조회"
      />

      {/* 상단 KPI 카드 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="전체 프로젝트" value={stats.total} sub="누적 생성" />
        <StatCard label="진행 중" value={stats.inProgress} accent="sky" sub="Draft·완료 제외" />
        <StatCard label="자동 승인 건수" value={stats.autoApproved} accent="green" sub="Gatekeeping Auto" />
        <StatCard label="예외 처리 필요" value={stats.exceptions} accent="amber" sub="사람 검토 대상" />
        <StatCard label="DAM 이관 완료" value={stats.transferred} accent="green" sub="Transferred" />
        <StatCard label="WCM QA 대기" value={stats.wcmWaiting} accent="violet" sub="요청·검토 중" />
        <StatCard label="메타데이터 누락률" value={pct(stats.metaMissingRate)} accent="red" sub="필수 항목 기준" />
        <StatCard label="QA 자동 승인율" value={pct(stats.autoRatio)} accent="green" sub="판정 완료 대비" />
      </div>

      {/* 본부별 / 채널별 현황 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">본부별 프로젝트 현황</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['MS', 'HS', 'ES'] as BU[]).map((bu) => (
              <div key={bu} className="rounded-lg border border-slate-200 p-3 text-center">
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
                  style={{ background: BU_COLORS[bu] }}
                >
                  {bu}
                </span>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.buCounts[bu]}</p>
                <p className="text-[11px] text-slate-400">프로젝트</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">채널별 현황</h3>
          <div className="space-y-2">
            {stats.channelCounts.map((c) => {
              const max = Math.max(...stats.channelCounts.map((x) => x.value), 1)
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-slate-500">{c.name}</span>
                  <div className="h-3 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-brand-500"
                      style={{ width: `${(c.value / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-slate-700">{c.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">상태별 프로젝트 분포</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.statusDist} dataKey="value" nameKey="name" outerRadius={90} label isAnimationActive={false}>
                {stats.statusDist.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">본부별 예외 발생 건수</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.buException}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="전체" fill="#cbd5e1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="예외" fill="#fb923c" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">QA 자동 승인 비율</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={[
                  { name: '자동 승인', value: Math.round(stats.autoRatio) },
                  { name: '사람 검토', value: Math.round(100 - stats.autoRatio) },
                ]}
                dataKey="value"
                innerRadius={55}
                outerRadius={90}
                label
                isAnimationActive={false}
              >
                <Cell fill="#34d399" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">월별 이관 완료 추이</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="이관" stroke="#c96442" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 예외/대기 프로젝트 바로가기 */}
      <div className="mt-4 card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">조치가 필요한 프로젝트</h3>
        <div className="space-y-2">
          {projects
            .filter((p) => p.isException || ['WCM QA Requested', 'Gatekeeping In Progress', 'Exception Review'].includes(p.status))
            .map((p) => (
              <button
                key={p.id}
                onClick={() => nav(`/projects/${p.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.id} · {p.owner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={p.status} kind="status" />
                  <StatusBadge label={p.qaResult} kind="qa" />
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
