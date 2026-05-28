import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecordDetailPage({ params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: record } = await supabase
    .from("records")
    .select("*, drinks:drink_id(id, name, brand_id), brands:brand_id(id, name), profiles:user_id(username, display_name)")
    .eq("id", recordId)
    .single();

  if (!record) notFound();

  const brandId = (record.brands as any)?.id || (record as any).brand_id;
  const drinkName = (record.drinks as any)?.name || "未知饮品";
  const isOwner = user?.id === record.user_id;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/diary" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h2 className="text-lg font-bold">🧋 吨吨详情</h2>
          <p className="text-xs text-muted-foreground">
            {(record.profiles as any)?.display_name || (record.profiles as any)?.username || "匿名"} 的吨吨
          </p>
        </div>
      </div>

      {/* 吨吨卡片 */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {(record.brands as any)?.name || "未知品牌"}
              </Badge>
              <CardTitle className="text-base">{drinkName}</CardTitle>
            </div>
            {record.rating && (
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="size-3.5 fill-current" />
                <span className="text-sm font-medium">{record.rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(record.drank_at).toLocaleDateString("zh-CN")}
            </span>
            {record.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {record.location}
              </span>
            )}
          </div>
        </CardHeader>
        {record.note && (
          <CardContent className="py-0 pb-3">
            <p className="text-sm text-muted-foreground">{record.note}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {record.sugar_level && <span>甜度 {record.sugar_level}</span>}
              {record.ice_level && (
                <span>
                  {record.ice_level === "no_ice" ? "去冰" :
                   record.ice_level === "less_ice" ? "少冰" :
                   record.ice_level === "normal_ice" ? "正常冰" :
                   record.ice_level === "hot" ? "热" : "多冰"}
                </span>
              )}
              {record.size && (
                <span>
                  {record.size === "small" ? "小杯" :
                   record.size === "medium" ? "中杯" :
                   record.size === "large" ? "大杯" : "超大杯"}
                </span>
              )}
              {record.price_paid && <span>¥{record.price_paid}</span>}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 互动按钮 */}
      <div className="flex gap-2 mb-6">
        <Link
          href={`/diary/new?brandId=${brandId}&drinkName=${encodeURIComponent(drinkName)}`}
          className={buttonVariants({ size: "sm" })}
        >
          🧋 再来
        </Link>
        {isOwner && record.drinks && (
          <Link
            href={`/catalog/drinks/${(record.drinks as any).id}`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            查看饮品详情
          </Link>
        )}
      </div>

    </div>
  );
}
