import { vocabulary, lectures } from '../../data/vocabulary'
import { useProgress } from '../../hooks/useProgress'
import { lectureLabel, SOURCE_ALL, SOURCE_DUE, SOURCE_RANDOM, SOURCE_WEAK } from '../../utils/sources'
import { SelectField } from '../common/Field'

/** Picks what to study: one lecture, all lectures, weak words, due words, or a random mix. */
export function SourceSelect({ value, onChange, includeRandom = false, label = 'Study', className }) {
  const { derived } = useProgress()
  const options = [
    ...lectures.map((lecture) => ({ value: String(lecture.id), label: lectureLabel(lecture.id) })),
    { value: SOURCE_ALL, label: `All lectures (${vocabulary.length})` },
    { value: SOURCE_WEAK, label: `Weak words (${derived.weakIds.length})` },
    { value: SOURCE_DUE, label: `Due for review (${derived.dueIds.length})` },
    ...(includeRandom ? [{ value: SOURCE_RANDOM, label: 'Random mix' }] : []),
  ]
  return <SelectField label={label} value={String(value)} onChange={(event) => onChange(event.target.value)} options={options} className={className} />
}

