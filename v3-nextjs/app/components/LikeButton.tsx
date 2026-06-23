'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { likePost } from '@/lib/actions';
import { Button } from '@/components/ui/button';

interface LikeButtonProps {
  slug: string;
  initialCount: number;
}

export default function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLike() {
    startTransition(async () => {
      const newCount = await likePost(slug);
      setCount(newCount);
      // Refresh the server components (layout's GlobalTotal, other cards) so
      // the global-total updates without a full page reload.
      router.refresh();
    });
  }

  return (
    <>
      <Button
        data-testid="like-button"
        onClick={handleLike}
        disabled={isPending}
        variant="outline"
        size="sm"
      >
        ♥ Like
      </Button>
      <span data-testid="like-count" className="text-sm text-muted-foreground tabular-nums">
        {count}
      </span>
    </>
  );
}
