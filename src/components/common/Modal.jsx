import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { Button, IconButton } from './Button'

/** Modal built on the native <dialog>: focus is trapped, Escape closes it, and the page behind is inert. */
export function Modal({ open, onClose, title, description, children, footer }) {
  const ref = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-pop open:animate-pop"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="t-h2">
            {title}
          </h2>
          <IconButton icon={X} label="Close dialog" onClick={onClose} className="-mt-1 -mr-2" />
        </div>
        {description && <p className="mt-2 text-muted">{description}</p>}
        {children}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </dialog>
  )
}

export function ConfirmDialog({ open, onCancel, onConfirm, title, description, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger-solid' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
