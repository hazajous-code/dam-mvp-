import type { QACheckResult } from '../types'
import StatusBadge from './StatusBadge'

const STATUS_LABEL: Record<QACheckResult['status'], string> = {
  pass: 'Pass',
  warning: 'Warning',
  fail: 'Fail',
}

export default function RuleResultTable({ results }: { results: QACheckResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="table-th">결과</th>
            <th className="table-th">룰</th>
            <th className="table-th">Severity</th>
            <th className="table-th">메시지</th>
            <th className="table-th">권장 조치</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((r, i) => (
            <tr key={`${r.ruleId}-${i}`} className="hover:bg-slate-50">
              <td className="table-td">
                <StatusBadge label={STATUS_LABEL[r.status]} kind="check" />
              </td>
              <td className="table-td font-medium text-slate-800">{r.ruleName}</td>
              <td className="table-td">
                <StatusBadge label={r.severity} kind="severity" />
              </td>
              <td className="table-td max-w-xs whitespace-normal text-slate-600">{r.message}</td>
              <td className="table-td max-w-xs whitespace-normal text-slate-400">
                {r.recommendation || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
