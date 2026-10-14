import { Play } from 'lucide-react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { Segmented, Toggle } from '../common/Field'
import { QUESTION_COUNTS } from '../../utils/quiz'
import { SourceSelect } from './SourceSelect'

const STYLE_OPTIONS = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'single', label: 'Pick one' },
  { value: 'multi', label: 'Pick all 3' },
  { value: 'match', label: 'Matching' },
]
const FILL_OPTIONS = [
  { value: 'choice', label: 'Multiple choice' },
  { value: 'type', label: 'Type answer' },
]

/** Pre-quiz options: what to practise, how many questions, and mode-specific choices. */
export function PracticeSetup({ mode, config, onChange, available, onStart }) {
  const set = (patch) => onChange({ ...config, ...patch })
  const blocked = available === 0

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-6">
        <SourceSelect value={config.source} onChange={(source) => set({ source })} includeRandom label="Practise" />

        <Segmented legend="Number of questions" options={QUESTION_COUNTS.map((count) => ({ value: count, label: String(count) }))} value={config.count} onChange={(count) => set({ count })} />

        {mode === 'synonym' && <Segmented legend="Question style" options={STYLE_OPTIONS} value={config.style} onChange={(style) => set({ style })} />}
        {mode === 'fill' && <Segmented legend="Answer mode" options={FILL_OPTIONS} value={config.fillMode} onChange={(fillMode) => set({ fillMode })} columns="grid-cols-2" />}

        <Toggle label="Show timer" description="Track how long the quiz takes." checked={config.timed} onChange={(timed) => set({ timed })} />

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted" role="status">
            {blocked
              ? config.source === 'weak'
                ? 'You have no weak words right now. Pick another selection.'
                : config.source === 'due'
                  ? 'No words are due for review right now.'
                  : 'No words available for this mode and selection.'
              : `${available} ${available === 1 ? 'word' : 'words'} available${mode === 'antonym' ? ' (words with a reliable antonym)' : ''}.`}
          </p>
          <Button size="lg" icon={Play} onClick={onStart} disabled={blocked}>
            Start quiz
          </Button>
        </div>
      </div>
    </Card>
  )
}
