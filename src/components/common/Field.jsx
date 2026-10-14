import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

const controlClasses =
  'h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-base text-ink placeholder:text-muted/70 transition focus-visible:border-brand'

export function TextInput({ label, hideLabel, className, id, ...props }) {
  const auto = useId()
  const inputId = id || auto
  return (
    <div className={className}>
      <label htmlFor={inputId} className={cn('mb-1.5 block text-sm font-semibold', hideLabel && 'sr-only')}>
        {label}
      </label>
      <input id={inputId} className={controlClasses} {...props} />
    </div>
  )
}

export function SelectField({ label, hideLabel, options, className, id, ...props }) {
  const auto = useId()
  const selectId = id || auto
  return (
    <div className={className}>
      <label htmlFor={selectId} className={cn('mb-1.5 block text-sm font-semibold', hideLabel && 'sr-only')}>
        {label}
      </label>
      <select id={selectId} className={cn(controlClasses, 'pr-9')} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Radio-group styled as segmented buttons. The selected option shows a check mark, not just a colour. */
export function Segmented({ legend, options, value, onChange, className, columns }) {
  const name = useId()
  return (
    <fieldset className={className}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className={cn('grid gap-2', columns || 'grid-cols-2 sm:grid-cols-4')}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <label
              key={String(option.value)}
              className={cn(
                'flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-center text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                selected ? 'border-brand bg-brand-soft text-brand' : 'border-line-strong bg-surface text-ink hover:bg-surface-2',
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {selected && <Check aria-hidden="true" className="size-4 shrink-0" />}
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Toggle({ label, description, checked, onChange }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block font-semibold">
          {label}
        </label>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full border transition', checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-2')}
      >
        <span className={cn('absolute top-0.5 size-5.5 rounded-full bg-surface shadow transition-all', checked ? 'left-5.5' : 'left-0.5')} />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  )
}
