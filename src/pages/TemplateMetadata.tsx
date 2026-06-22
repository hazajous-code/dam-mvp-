import { useState } from 'react'
import { PageHeader } from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { METADATA_FIELDS, METADATA_GROUPS } from '../data/mockMetadata'
import { TEMPLATES } from '../data/templates'

const GROUP_TONE: Record<string, string> = {
  'DAM 필수 전송 값': 'border-brand-200 bg-brand-50',
  '프로젝트 참고 값': 'border-slate-200 bg-slate-50',
  '자동 입력 가능 값': 'border-sky-200 bg-sky-50',
  '추천 입력 값': 'border-emerald-200 bg-emerald-50',
  '이관 시점 확정 값': 'border-violet-200 bg-violet-50',
}

export default function TemplateMetadata() {
  const [template, setTemplate] = useState('전체')

  const fields = METADATA_FIELDS.filter(
    (f) => template === '전체' || f.templates.includes('*') || f.templates.includes(template),
  )

  return (
    <div>
      <PageHeader
        title="Template & Metadata"
        description="템플릿별 필수/선택 메타데이터 정의를 관리합니다. 구분에 따라 입력 책임과 자동화 수준이 달라집니다."
      />

      {/* 템플릿 선택 */}
      <div className="card mb-4 p-4">
        <label className="label">템플릿</label>
        <div className="flex flex-wrap gap-2">
          {['전체', ...TEMPLATES.map((t) => t.name)].map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                template === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 구분별 범례 */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {METADATA_GROUPS.map((g) => (
          <div key={g} className={`rounded-lg border p-2 text-center text-xs font-medium ${GROUP_TONE[g]}`}>
            {g}
            <span className="ml-1 text-slate-400">({fields.filter((f) => f.group === g).length})</span>
          </div>
        ))}
      </div>

      {/* 메타데이터 테이블 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="table-th">필드</th>
                <th className="table-th">구분</th>
                <th className="table-th">필수</th>
                <th className="table-th">예시</th>
                <th className="table-th">적용 템플릿</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50">
                  <td className="table-td font-medium text-slate-800">{f.label}</td>
                  <td className="table-td">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${GROUP_TONE[f.group]}`}>{f.group}</span>
                  </td>
                  <td className="table-td">
                    {f.required
                      ? <StatusBadge label="필수" kind="check" className="bg-rose-50 text-rose-700 border-rose-200" />
                      : <span className="text-xs text-slate-400">선택</span>}
                  </td>
                  <td className="table-td font-mono text-xs text-slate-500">{f.example}</td>
                  <td className="table-td text-xs text-slate-500">
                    {f.templates.includes('*') ? '전체' : f.templates.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        <p className="font-semibold text-slate-700">Archive Rule 옵션</p>
        <ul className="mt-1 list-inside list-disc">
          <li>기존 자산 대체 — 동일 경로 자산을 신규 자산으로 교체</li>
          <li>기존 자산과 병존 — 버전을 유지하며 신규 자산 추가</li>
          <li>신규 등록 — 신규 경로/자산으로 최초 등록</li>
        </ul>
      </div>
    </div>
  )
}
