import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewReplies } from "@/components/features/catalog/review-replies";
import { LikeButton } from "@/components/features/catalog/like-button";

function friendlyDate(d: string): string {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString("zh-CN");
}

const catLabel: Record<string, string> = {
  milk_tea: "奶茶",
  fruit_tea: "果茶",
  cheese_tea: "芝士茶",
  pure_tea: "纯茶",
  smoothie: "冰沙",
  other: "特调/咖啡",
};

export default async function DrinkDetailPage({ params }: { params: Promise<{ drinkId: string }> }) {
  const { drinkId } = await params;
  const supabase = await createClient();

  const { data: drink } = await supabase
    .from("drinks")
    .select("id, name, category, base_price, avg_rating, review_count, brand:brand_id(id, name)")
    .eq("id", drinkId)
    .single();
  if (!drink) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles:user_id(username, display_name)")
    .eq("drink_id", drinkId)
    .order("created_at", { ascending: false })
    .limit(30);

  // 查询这些评价的点赞数据
  const reviewIds = reviews?.map((r: any) => r.id) || [];
  const { data: likesData } = reviewIds.length > 0
    ? await supabase.from("likes").select("review_id, user_id").in("review_id", reviewIds)
    : { data: [] };

  const likedReviewIds = new Set<string>();
  const likeCounts = new Map<string, number>();
  likesData?.forEach((l: any) => {
    likeCounts.set(l.review_id, (likeCounts.get(l.review_id) || 0) + 1);
    if (user && l.user_id === user.id) likedReviewIds.add(l.review_id);
  });

  const brandId = (drink.brand as any)?.id;
  const brandName = (drink.brand as any)?.name || "未知品牌";

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={brandId ? `/catalog/brands/${brandId}` : "/catalog"}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{drink.name}</h2>
            <Badge variant="secondary" className="text-[10px]">
              {catLabel[drink.category || "other"] || "其他"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {brandName}
            {drink.base_price && ` · ¥${drink.base_price}`}
          </p>
        </div>
      </div>

      {/* 评分概览 */}
      <div className="flex items-center gap-4 mb-4 px-1">
        {drink.avg_rating ? (
          <div className="flex items-center gap-1">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            <span className="text-xl font-bold">{drink.avg_rating}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">暂无评分</span>
        )}
        <span className="text-sm text-muted-foreground">
          {drink.review_count || 0} 条评价
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mb-6">
        <Link
          href={`/diary/new?brandId=${brandId}&drinkName=${encodeURIComponent(drink.name)}`}
          className={buttonVariants({ size: "sm" })}
        >
          🧋 喝一杯
        </Link>
      </div>

      {/* 评价列表 */}
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        评价 ({reviews?.length || 0})
      </h3>
      {!reviews || reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          暂无评价，抢个沙发
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <Card key={r.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {r.profiles?.display_name || r.profiles?.username || "匿名"}
                  </CardTitle>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="size-3.5 fill-current" />
                    <span className="text-sm font-medium">{r.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                {r.content && (
                  <p className="text-sm leading-relaxed text-foreground/80 mb-3">{r.content}</p>
                )}
                <div className="flex items-baseline gap-5 text-sm text-muted-foreground border-t pt-2.5">
                  <LikeButton
                    reviewId={r.id}
                    liked={likedReviewIds.has(r.id)}
                    count={likeCounts.get(r.id) || 0}
                  />
                  <ReviewReplies reviewId={r.id} />
                  <span className="ml-auto flex items-center gap-1.5 text-xs">
                    <Clock className="size-3" />
                    {friendlyDate(r.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
