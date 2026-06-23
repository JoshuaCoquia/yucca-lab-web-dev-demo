import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getAllPosts, getPostBySlug } from '@/lib/content';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const bodyHtml = marked(post.body) as string;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" data-testid="back-link" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back
      </Link>
      <article>
        <h1 data-testid="post-title" className="text-3xl font-bold mb-2">
          {post.title}
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <time>{post.date}</time>
          {post.tags.length > 0 && (
            <span className="ml-2">{post.tags.join(', ')}</span>
          )}
        </div>
        <div
          data-testid="post-body"
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </article>
    </main>
  );
}
