'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { likePost } from '@/lib/actions';

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
      <button
        data-testid="like-button"
        onClick={handleLike}
        disabled={isPending}
        className="text-sm border rounded px-3 py-1 hover:bg-zinc-50 disabled:opacity-50"
      >
        Like
      </button>
      <span data-testid="like-count" className="text-sm text-zinc-500">
        {count}
      </span>
    </>
  );
}
