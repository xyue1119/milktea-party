"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const drinkId = params.drinkId as string;
  const supabase = createClient();

  const [drink, setDrink] = useState<{ name: string; brand: { name: string } } | null>(null);
  const [brandId, setBrandId] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("drinks")
      .select("name, brand:brand_id(id, name)")
      .eq("id", drinkId)
      .single()
      .then(({ data }) => {
        if (data) {
          setDrink(data as any);
          const b = (data as any).brand;
          if (b?.id) setBrandId(b.id);
        }
      });
  }, [drinkId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("reviews").upsert(
        {
          user_id: user!.id,
          drink_id: drinkId,
          rating,
          content: content.trim() || null,
        },
        { onConflict: "user_id,drink_id" }
      );

      if (error) throw error;

      router.push(`/catalog/drinks/${drinkId}`);
      router.refresh();
    } catch (err: any) {
      alert("保存失败：" + (err.message || "未知错误"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/catalog/drinks/${drinkId}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold">写评价</h2>
          {drink && (
            <p className="text-xs text-muted-foreground">
              {drink.brand?.name} · {drink.name}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 评分 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            评分 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    "size-8",
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground self-center ml-2">
                {rating} 分
              </span>
            )}
          </div>
        </div>

        {/* 评价内容 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">评价（选填）</label>
          <Textarea
            placeholder="分享你的感受..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 mr-1 animate-spin" />
              保存中...
            </>
          ) : (
            "发布评价"
          )}
        </Button>
      </form>
    </div>
  );
}
