import { useParams } from 'react-router'
import { posts } from '../content/posts'
import Header from '../components/Header'
import PageShell from '../components/PageShell'
import BackLink from '../components/BackLink'
import PostArticle from '../components/PostArticle'
import PostNotFound from '../components/PostNotFound'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    return <PostNotFound />
  }

  return (
    <PageShell
      maxWidth="max-w-3xl"
      mainClassName="px-6 py-10"
      header={
        <Header>
          <BackLink className="text-blue-600 hover:underline text-sm font-medium" />
        </Header>
      }
    >
      <PostArticle post={post} />
    </PageShell>
  )
}
