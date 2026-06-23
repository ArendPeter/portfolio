interface InlineLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean
}

export function InlineLink({ external = false, children, ...props }: InlineLinkProps) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      className="text-accent underline-offset-2 hover:underline transition-colors"
      {...externalProps}
      {...props}
    >
      {children}
    </a>
  )
}
