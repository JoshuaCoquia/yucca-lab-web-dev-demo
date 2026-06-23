import { Link } from 'react-router'

interface BackLinkProps {
  className?: string
}

export default function BackLink({
  className = 'text-blue-600 hover:underline text-sm',
}: BackLinkProps) {
  return (
    <Link data-testid="back-link" to="/" className={className}>
      &larr; Back to all posts
    </Link>
  )
}
