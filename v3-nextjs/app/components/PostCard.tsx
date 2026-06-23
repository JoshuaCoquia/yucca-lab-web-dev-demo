import Link from 'next/link';
import type { Post } from '@/lib/content';
import LikeButton from './LikeButton';
import TagList from './TagList';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PostCardProps {
  post: Post;
  likeCount: number;
}

// One post tile: title, date, tags, excerpt, like button, and read-more link.
// Plain component (no hooks of its own) — rendered inside the PostBrowser island.
export default function PostCard({ post, likeCount }: PostCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <h3 data-testid="post-title" className="text-base font-semibold leading-snug">
            {post.title}
          </h3>
        </CardTitle>
        <time data-testid="post-date" className="text-xs text-muted-foreground">
          {post.date}
        </time>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <TagList
          tags={post.tags}
          data-testid="post-tags"
          className="flex gap-1.5 flex-wrap"
          badgeClassName="text-xs"
        />
        <p data-testid="post-excerpt" className="text-sm text-muted-foreground flex-1">
          {post.excerpt}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LikeButton slug={post.slug} initialCount={likeCount} />
        </div>
        <Link
          href={`/posts/${post.slug}`}
          data-testid="read-link"
          className="text-sm font-medium text-primary hover:underline"
        >
          Read more →
        </Link>
      </CardFooter>
    </Card>
  );
}
