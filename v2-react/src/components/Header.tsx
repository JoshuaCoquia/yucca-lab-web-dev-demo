import type { ReactNode } from 'react'

interface HeaderProps {
  title?: ReactNode
  children?: ReactNode
  right?: ReactNode
}

export default function Header({ title, children, right }: HeaderProps) {
  const hasRow = title !== undefined || right !== undefined
  const className = hasRow
    ? 'bg-white border-b px-6 py-4 flex items-center justify-between'
    : 'bg-white border-b px-6 py-4'

  return (
    <header className={className}>
      {title !== undefined ? <h1 className="text-2xl font-bold">{title}</h1> : null}
      {children}
      {right}
    </header>
  )
}
