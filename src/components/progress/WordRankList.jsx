import { wordAccuracy } from '../../utils/spacedRepetition'

export function WordRankList({ rows, empty, metric }) {
  if (!rows.length) return <p className="text-muted">{empty}</p>
  return (
    <ol className="divide-y divide-line">
      {rows.map(({ item, record }, index) => (
        <li key={item.id} className="flex items-center gap-3 py-2.5">
          <span aria-hidden="true" className="w-5 text-sm font-bold text-muted">
            {index + 1}
          </span>
          <span className="flex-1 font-semibold">{item.word}</span>
          <span className="text-sm text-muted">{metric(record, wordAccuracy(record))}</span>
        </li>
      ))}
    </ol>
  )
}
