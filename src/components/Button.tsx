interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'rounded-md px-4 py-2 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'border border-accent text-accent hover:bg-accent/10',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
