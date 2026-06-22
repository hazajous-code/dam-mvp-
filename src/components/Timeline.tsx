import type { TimelineEvent } from '../types'
import { getRole } from '../data/roles'

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-400">처리 이력이 없습니다.</p>
  }
  return (
    <ol className="relative ml-3 border-l border-slate-200">
      {events.map((e) => (
        <li key={e.id} className="mb-5 ml-5">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
          <div className="flex flex-wrap items-center gap-x-2">
            <p className="text-sm font-semibold text-slate-800">{e.action}</p>
            <span className="text-xs text-slate-400">{e.at}</span>
          </div>
          <p className="text-xs text-slate-500">
            {e.actor} · {getRole(e.role).name}
          </p>
          {e.note && <p className="mt-0.5 text-xs text-slate-400">“{e.note}”</p>}
        </li>
      ))}
    </ol>
  )
}
