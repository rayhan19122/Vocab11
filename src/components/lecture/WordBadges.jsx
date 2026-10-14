import { BookmarkCheck, CircleDot, RefreshCw, Sparkles } from 'lucide-react'
import { STATE_LABELS } from '../../utils/spacedRepetition'
import { Badge } from '../common/Badge'

const STATE_STYLE = {
  new: { tone: 'neutral', icon: CircleDot },
  learning: { tone: 'warn', icon: RefreshCw },
  review: { tone: 'info', icon: BookmarkCheck },
  mastered: { tone: 'brand', icon: Sparkles },
}

export function StateBadge({ state }) {
  const style = STATE_STYLE[state] || STATE_STYLE.new
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {STATE_LABELS[state] || STATE_LABELS.new}
    </Badge>
  )
}

const DIFFICULTY_TONE = { easy: 'neutral', medium: 'neutral', hard: 'warn' }

export function DifficultyBadge({ difficulty }) {
  return (
    <Badge tone={DIFFICULTY_TONE[difficulty]} className="capitalize">
      {difficulty}
    </Badge>
  )
}
