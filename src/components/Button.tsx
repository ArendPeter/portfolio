import { ExternalLinkIcon } from './ExternalLinkIcon'

type ButtonBase = {
  variant?: 'primary' | 'secondary'
  external?: boolean
}

type ButtonAsButton = ButtonBase &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> & {
    href?: never
  }

type ButtonAsAnchor = ButtonBase &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

export function Button({
  variant = 'primary',
  external = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'rounded-md px-4 py-2 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'border border-accent text-accent hover:bg-accent/10',
  }
  const cls = `${base} ${variants[variant]} ${className}`

  if ('href' in props && props.href !== undefined) {
    return (
      <a
        className={cls}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {external && <ExternalLinkIcon />}
      </a>
    )
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
