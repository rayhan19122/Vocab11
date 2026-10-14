import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronsDownUp, ChevronsUpDown, GraduationCap, Play, SearchX } from 'lucide-react'
import { vocabulary } from '../data/vocabulary'
import { useProgress } from '../hooks/useProgress'
import { useToast } from '../hooks/useToast'
import { lectureStats, wordRecord } from '../utils/progress'
import { isWeak, stateRank } from '../utils/spacedRepetition'
import { lectureLabel } from '../utils/sources'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { SelectField, TextInput } from '../components/common/Field'
import { ProgressBar } from '../components/common/ProgressBar'
import { WordRow } from '../components/lecture/WordRow'
import { usePageTitle } from '../hooks/usePageTitle'

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'learning', label: 'Learning' },
  { value: 'review', label: 'Review' },
  { value: 'mastered', label: 'Mastered' },
  { value: 'weak', label: 'Weak words' },
]
const SORT_OPTIONS = [
  { value: 'order', label: 'Lecture order' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'difficulty', label: 'Hardest first' },
  { value: 'status', label: 'Least learned first' },
]
const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 }

function sortWords(items, sort, state) {
  const copy = [...items]
  if (sort === 'az') return copy.sort((a, b) => a.word.localeCompare(b.word))
  if (sort === 'za') return copy.sort((a, b) => b.word.localeCompare(a.word))
  if (sort === 'difficulty') return copy.sort((a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty])
  if (sort === 'status') return copy.sort((a, b) => stateRank(wordRecord(state, a.id).state) - stateRank(wordRecord(state, b.id).state))
  return copy
}

export default function LectureDetail() {
  const params = useParams()
  const lectureId = Number(params.lectureId)
  const valid = Number.isInteger(lectureId) && lectureId >= 1 && lectureId <= 11
  usePageTitle(valid ? lectureLabel(lectureId) : 'Lectures')
  const { state, actions } = useProgress()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('order')
  const [expanded, setExpanded] = useState(() => new Set())

  const { setLast } = actions
  useEffect(() => {
    if (valid) setLast({ lectureId })
  }, [valid, lectureId, setLast])

  const words = useMemo(() => vocabulary.filter((item) => item.lecture === lectureId), [lectureId])
  const stats = valid ? lectureStats(state, vocabulary, lectureId) : null

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = words.filter((item) => {
      const record = state.words[item.id]
      if (difficulty !== 'all' && item.difficulty !== difficulty) return false
      if (status === 'weak' && !isWeak(record)) return false
      if (status !== 'all' && status !== 'weak' && (record?.state || 'new') !== status) return false
      if (!needle) return true
      return [item.word, item.meaning, ...item.synonyms, ...item.antonyms].some((text) => text.toLowerCase().includes(needle))
    })
    return sortWords(filtered, sort, state)
  }, [words, state, query, difficulty, status, sort])

  if (!valid) return <Navigate to="/lectures" replace />

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setLast({ lectureId, wordId: id })
  }
  const allOpen = visible.length > 0 && visible.every((item) => expanded.has(item.id))
  const mark = (id, result) => {
    actions.recordResult(id, result)
    setLast({ lectureId, wordId: id })
    const word = vocabulary.find((item) => item.id === id).word
    toast(result === 'mastered' ? `${word} marked as mastered` : result === 'learned' ? `${word} marked as learned` : `${word} sent back to learning`)
  }
  const clearFilters = () => {
    setQuery('')
    setDifficulty('all')
    setStatus('all')
    setSort('order')
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1 text-sm text-muted">
        <Link to="/lectures" className="flex items-center gap-1 font-semibold hover:text-ink">
          <ChevronLeft aria-hidden="true" className="size-4" />
          Lectures
        </Link>
      </nav>

      <header className="mb-8 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="t-eyebrow mb-1">Now studying</p>
            <h1 className="t-display">{lectureLabel(lectureId)}</h1>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <dt className="sr-only">Words</dt>
                <dd className="font-semibold">{stats.total} Words</dd>
              </div>
              <div>
                <dt className="sr-only">Mastered</dt>
                <dd className="font-semibold">{stats.mastered} Mastered</dd>
              </div>
              <div>
                <dt className="sr-only">Complete</dt>
                <dd className="font-semibold">{stats.percent}% Complete</dd>
              </div>
            </dl>
            <ProgressBar value={stats.percent} label={`${lectureLabel(lectureId)} progress`} size="lg" className="mt-4 max-w-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button to={`/flashcards?source=${lectureId}`} size="lg" icon={Play}>
              Start Learning
            </Button>
            <Button to={`/practice?source=${lectureId}`} size="lg" variant="secondary" icon={GraduationCap}>
              Practice
            </Button>
          </div>
        </div>
      </header>

      <section aria-label="Filter words" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <TextInput label="Search this lecture" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search words, meanings, synonyms…" className="col-span-2 lg:col-span-1" />
        <SelectField label="Difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} options={DIFFICULTY_OPTIONS} />
        <SelectField label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={STATUS_OPTIONS} />
        <SelectField label="Sort by" value={sort} onChange={(event) => setSort(event.target.value)} options={SORT_OPTIONS} className="col-span-2 lg:col-span-1" />
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" role="status">
          Showing {visible.length} of {words.length} words
        </p>
        <Button size="sm" variant="secondary" icon={allOpen ? ChevronsDownUp : ChevronsUpDown} onClick={() => setExpanded(allOpen ? new Set() : new Set(visible.map((item) => item.id)))} disabled={!visible.length}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={SearchX} title="No words match" action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}>
          Try a different search or reset the filters for {lectureLabel(lectureId)}.
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((item) => (
            <WordRow
              key={item.id}
              entry={item}
              number={words.indexOf(item) + 1}
              record={wordRecord(state, item.id)}
              weak={isWeak(state.words[item.id])}
              expanded={expanded.has(item.id)}
              onToggle={() => toggle(item.id)}
              onMark={mark}
            />
          ))}
        </ol>
      )}

      <nav aria-label="Lecture navigation" className="mt-10 flex justify-between gap-3">
        {lectureId > 1 ? (
          <Button to={`/lectures/${lectureId - 1}`} variant="secondary" icon={ChevronLeft}>
            {lectureLabel(lectureId - 1)}
          </Button>
        ) : (
          <span />
        )}
        {lectureId < 11 && (
          <Button to={`/lectures/${lectureId + 1}`} variant="secondary" iconRight={ChevronRight}>
            {lectureLabel(lectureId + 1)}
          </Button>
        )}
      </nav>
    </>
  )
}
