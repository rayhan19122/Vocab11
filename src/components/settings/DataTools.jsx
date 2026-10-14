import { useRef, useState } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { vocabulary } from '../../data/vocabulary'
import { useProgress } from '../../hooks/useProgress'
import { useToast } from '../../hooks/useToast'
import { exportJson, parseImport } from '../../utils/storage'
import { dayKey } from '../../utils/date'
import { Button } from '../common/Button'
import { ConfirmDialog } from '../common/Modal'

const VALID_IDS = new Set(vocabulary.map((item) => item.id))

/** Export / import a JSON backup, and reset all progress (always behind a confirmation). */
export function DataTools() {
  const { state, actions } = useProgress()
  const toast = useToast()
  const fileInput = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportProgress = () => {
    const blob = new Blob([exportJson(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vocab11-progress-${dayKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast('Progress exported')
  }

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setPendingImport(parseImport(await file.text(), VALID_IDS))
    } catch (error) {
      toast(error.message, 'error')
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" icon={Download} onClick={exportProgress}>
          Export progress
        </Button>
        <Button variant="secondary" icon={Upload} onClick={() => fileInput.current?.click()}>
          Import progress
        </Button>
        <input ref={fileInput} type="file" accept="application/json,.json" onChange={chooseFile} className="sr-only" aria-label="Choose a Vocab11 backup file" tabIndex={-1} />
        <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
          Reset progress
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          actions.replaceState(pendingImport)
          setPendingImport(null)
          toast('Progress imported')
        }}
        title="Replace your progress?"
        description="Importing replaces all progress on this device with the contents of the file."
        confirmLabel="Import and replace"
        danger
      />
      <ConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.resetProgress()
          setConfirmReset(false)
          toast('Progress has been reset')
        }}
        title="Reset all progress?"
        description="This permanently deletes your learned words, quiz history, weak words and streak on this device. Export a backup first if you might want it back."
        confirmLabel="Reset everything"
        danger
      />
    </>
  )
}
