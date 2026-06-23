import BackLink from './BackLink'

export default function PostNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 text-lg mb-4">Post not found.</p>
        <BackLink />
      </div>
    </div>
  )
}
