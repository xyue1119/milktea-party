"use client";

import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LikeButton({
  reviewId,
  liked: initialLiked,
  count: initialCount,
}: {
  reviewId: string;
  liked: boolean;
  count: number;
}) {
  const supabase = createClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));

    if (wasLiked) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user!.id);
      if (error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("likes")
        .insert({ review_id: reviewId, user_id: user!.id });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm leading-none transition-colors ${
        liked
          ? "text-rose-500"
          : "text-muted-foreground hover:text-rose-400"
      }`}
    >
      <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
      <span>{count}</span>
    </button>
  );
}
