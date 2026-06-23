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

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1.5 align-middle"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

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
    const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <a className={cls} {...externalProps} {...anchorProps}>
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
