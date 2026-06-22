import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadialBarChart, RadialBar,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/Layout'
import StatCard from '../components/StatCard'
import { pct } from '../utils/format'
import type { BU, Channel } from '../types'

export default function Analytics() {
  const { projects } = useApp()

  const data = useMemo(() => {
    const total = projects.length
    const decided = projects.filter((p) => p.qaResult !== 'Pending')
    const auto = projects.filter((p) => p.qaResult === 'Auto Approved').length
    const exceptions = projects.filter((p) => p.isException || p.qaResult === 'Exception Required').length
    const autoRate = decided.length ? (auto / decided.length) * 100 : 0
    const exceptionRate = decided.length ? (exceptions / decided.length) * 100 : 0
    const avgMeta = projects.reduce((s, p) => s + p.metaCompletion, 0) / (total || 1)
    const metaMissing = 100 - avgMeta

    // 본부별 예외 유형 (데모: 누락/경로/locale 분포)
    const buException = (['MS', 'HS', 'ES'] as BU[]).map((bu) => {
      const list = projects.filter((p) => p.bu === bu)
      return {
        name: bu,
        '메타 누락': list.filter((p) => p.metaCompletion < 100).length,
        '예외 검토': list.filter((p) => p.isException).length,
      }
    })

    // 채널별 이관량
    const channels: Channel[] = ['LG.com', 'B2B', 'Retailer', 'Criteo', 'Contents Hub']
    const channelTransfer = channels.map((c) => ({
      name: c,
      전체: projects.filter((p) => p.publishingChannel === c).length,
      이관: projects.filter((p) => p.publishingChannel === c && p.transferred).length,
    }))

    // 월별 생성 추이 (데모 고정 + 6월 실제 반영)
    const juneCreated = projects.filter((p) => p.createdAt.startsWith('2026-06')).length
    const monthly = [
      { month: '2월', 생성: 4 },
      { month: '3월', 생성: 7 },
      { month: '4월', 생성: 10 },
      { month: '5월', 생성: 8 },
      { month: '6월', 생성: juneCreated },
    ]

    // 수작업 절감 예상 (자동 승인 건 × 가정 시간)
    const savedHours = auto * 0.8 + (total - exceptions) * 0.3
    const avgQaTime = 1.8 // 데모 가정값(시간)

    return { total, autoRate, exceptionRate, metaMissing, buException, channelTransfer, monthly, savedHours, avgQaTime, auto, exceptions }
  }, [projects])

  const INSIGHTS = [
    '필수 메타데이터 자동 매핑으로 반복 입력 항목이 감소했습니다.',
    'Gatekeeping 자동 검증을 통해 정상 건은 담당자 확인 없이 승인 가능합니다.',
    '예외 건만 사람이 검토하는 구조로 QA 리소스 집중도가 개선됩니다.',
    'WCM QA와 DAM 이관 상태를 연결해 JIRA 기반 커뮤니케이션을 줄일 수 있습니다.',
  ]

  return (
    <div>
      <PageHeader title="Analytics" description="자동화 도입에 따른 운영 개선 효과를 분석합니다." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="자동 승인율" value={pct(data.autoRate)} accent="green" sub={`${data.auto}건 자동 승인`} />
        <StatCard label="예외 처리율" value={pct(data.exceptionRate)} accent="amber" sub={`${data.exceptions}건 예외`} />
        <StatCard label="메타데이터 누락률" value={pct(data.metaMissing)} accent="red" sub="필수 항목 기준" />
        <StatCard label="평균 QA 처리 시간" value={`${data.avgQaTime}h`} accent="sky" sub="건당(데모 가정)" />
        <StatCard label="수작업 절감 예상" value={`${Math.round(data.savedHours)}h`} accent="green" sub="자동화 환산" />
        <StatCard label="누적 프로젝트" value={data.total} />
        <StatCard label="이관 완료" value={projects.filter((p) => p.transferred).length} accent="green" />
        <StatCard label="WCM 승인" value={projects.filter((p) => p.wcmStatus === 'Approved').length} accent="violet" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">본부별 예외 유형</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.buException}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip /><Legend />
              <Bar dataKey="메타 누락" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="예외 검토" stackId="a" fill="#fb7185" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">채널별 이관량</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.channelTransfer}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip /><Legend />
              <Bar dataKey="전체" fill="#cbd5e1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="이관" fill="#c96442" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">월별 프로젝트 생성 추이</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="생성" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">자동 승인율</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              innerRadius="60%" outerRadius="100%" startAngle={90} endAngle={-270}
              data={[{ name: '자동 승인율', value: Math.round(data.autoRate), fill: '#34d399' }]}
            >
              <RadialBar background dataKey="value" cornerRadius={10} isAnimationActive={false} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 text-2xl font-bold">
                {pct(data.autoRate)}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="mt-4 card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">운영 인사이트</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {INSIGHTS.map((t) => (
            <div key={t} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="text-emerald-500">●</span>
              <p className="text-sm text-slate-600">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
