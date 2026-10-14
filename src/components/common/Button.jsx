import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong shadow-sm',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  soft: 'bg-brand-soft text-brand hover:brightness-95',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
  'danger-solid': 'bg-danger text-on-brand hover:brightness-110',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

/** Button, or a router link when `to` is given. Icons come from lucide-react (pass the component, not an element). */
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, to, className, children, type = 'button', ...props }) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition select-none active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
  const content = (
    <>
      {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
      {children}
      {IconRight && <IconRight aria-hidden="true" className="size-4 shrink-0" />}
    </>
  )
  if (to && props.disabled) {
    // A link cannot be disabled; render an inert, announced-as-disabled look-alike instead.
    return (
      <span aria-disabled="true" className={cn(classes, 'opacity-50')}>
        {content}
      </span>
    )
  }
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  )
}

/** Square icon-only button. `label` is required: it is the accessible name. */
export function IconButton({ icon: Icon, label, variant = 'ghost', className, pressed, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition active:scale-95',
        variant === 'ghost' ? 'text-muted hover:bg-surface-2 hover:text-ink' : 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  )
}
