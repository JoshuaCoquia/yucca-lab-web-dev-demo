import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/badge';

interface TagListProps extends ComponentProps<'div'> {
  tags: string[];
  badgeClassName?: string;
}

// Shared, server/client-safe tag renderer used by both the post card (in the
// 'use client' PostBrowser island) and the server-rendered post page. Holds no
// client-only hooks. The wrapper passes through `className`/`data-testid` so each
// call site keeps its own DOM contract (e.g. the card's data-testid="post-tags").
export default function TagList({ tags, badgeClassName, className, ...props }: TagListProps) {
  return (
    <div className={className} {...props}>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className={badgeClassName}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
