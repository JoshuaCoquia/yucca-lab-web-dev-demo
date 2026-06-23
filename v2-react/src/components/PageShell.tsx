import type { ReactNode } from 'react'

interface PageShellProps {
  header?: ReactNode
  children: ReactNode
  maxWidth?: string
  mainClassName?: string
}

export default function PageShell({
  header,
  children,
  maxWidth = 'max-w-5xl',
  mainClassName = 'px-6 py-8',
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header}
      <main className={`${maxWidth} mx-auto ${mainClassName}`}>{children}</main>
    </div>
  )
}
