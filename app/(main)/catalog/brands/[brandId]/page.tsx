import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const catLabel: Record<string, string> = {
  milk_tea: "奶茶",
  fruit_tea: "果茶",
  cheese_tea: "芝士茶",
  pure_tea: "纯茶",
  smoothie: "冰沙",
  other: "特调/咖啡",
};

export default async function BrandDetailPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("name, description")
    .eq("id", brandId)
    .single();
  if (!brand) notFound();

  const { data: drinks } = await supabase
    .from("drinks")
    .select("id, name, category, avg_rating, review_count")
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/catalog" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold">{brand.name}</h2>
          {brand.description && (
            <p className="text-xs text-muted-foreground">{brand.description}</p>
          )}
        </div>
        <Link
          href={`/diary/new?brandId=${brandId}`}
          className={buttonVariants({ size: "sm" })}
        >
          🧋 喝一杯
        </Link>
      </div>

      {/* 饮品列表 */}
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        饮品 ({drinks?.length || 0})
      </h3>
      {!drinks || drinks.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">这个品牌还没有收录饮品</p>
          <Link
            href={`/diary/new?brandId=${brandId}`}
            className={buttonVariants({ size: "sm" })}
          >
            🧋 喝第一杯
          </Link>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {drinks.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <Link href={`/catalog/drinks/${d.id}`} className="flex-1 min-w-0 block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{d.name}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {catLabel[d.category || "other"] || "其他"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {d.avg_rating ? (
                    <span className="flex items-center gap-0.5 text-xs text-amber-400">
                      <Star className="size-3 fill-current" />
                      {d.avg_rating}
                    </span>
                  ) : null}
                  {d.review_count > 0 && (
                    <span className="text-xs text-muted-foreground">{d.review_count} 条评价</span>
                  )}
                </div>
              </Link>
              <Link
                href={`/diary/new?brandId=${brandId}&drinkName=${encodeURIComponent(d.name)}`}
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                🧋 喝一杯
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
