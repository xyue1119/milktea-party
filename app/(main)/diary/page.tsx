import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BookHeart, Star, MapPin, Clock, MessageCircle, Heart, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/features/diary/delete-button";
import { CalendarView } from "@/components/features/diary/calendar-view";

export default async function DiaryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: records } = await supabase
    .from("records")
    .select("*, drinks:drink_id(id, name, brand_id), brands:brand_id(name)")
    .eq("user_id", user.id)
    .order("drank_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const hasRecords = records && records.length > 0;

  // 日历数据：按日期分组
  const calendarDays = new Map<string, { name: string; brandName: string; rating?: number }[]>();
  records?.forEach((r: any) => {
    const date = r.drank_at || r.created_at?.slice(0, 10);
    if (!calendarDays.has(date)) calendarDays.set(date, []);
    calendarDays.get(date)!.push({
      name: r.drinks?.name || "未知饮品",
      brandName: r.brands?.name || "未知品牌",
      rating: r.rating,
    });
  });
  const calendarData = Array.from(calendarDays.entries()).map(([date, drinks]) => ({ date, drinks }));

  // 互动计数
  const recordIds = records?.map((r: any) => r.id) || [];
  const commentCounts = new Map<string, number>();
  const likeCounts = new Map<string, number>();
  if (recordIds.length > 0) {
    const [{ data: comments }, { data: likes }] = await Promise.all([
      supabase.from("comments").select("record_id").in("record_id", recordIds),
      supabase.from("likes").select("record_id").in("record_id", recordIds),
    ]);
    comments?.forEach((c: any) => {
      commentCounts.set(c.record_id, (commentCounts.get(c.record_id) || 0) + 1);
    });
    likes?.forEach((l: any) => {
      likeCounts.set(l.record_id, (likeCounts.get(l.record_id) || 0) + 1);
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">我的吨吨本</h2>
          {hasRecords && (
            <p className="text-sm text-muted-foreground">
              共 {records.length} 杯
            </p>
          )}
        </div>
        <Link href="/diary/new" className={buttonVariants({ size: "sm" })}>
          🧋 喝一杯
        </Link>
      </div>

      {/* 吨吨日历 */}
      {calendarData.length > 0 && <CalendarView records={calendarData} />}

      {!hasRecords ? (
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <BookHeart className="size-10 text-muted-foreground mx-auto mb-2" />
            <CardTitle className="text-base">还没有吨吨过</CardTitle>
            <CardDescription>写下第一杯，吨吨本就开张啦</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/diary/new" className={buttonVariants()}>
              🧋 开始吨吨
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="hover:bg-accent/[0.03] transition-colors">
              <CardHeader className="pb-2">
                <Link href={`/diary/${r.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {r.brands?.name || "未知品牌"}
                      </Badge>
                      <CardTitle className="text-base">{r.drinks?.name || "未知饮品"}</CardTitle>
                    </div>
                    {r.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="size-3.5 fill-current" />
                        <span className="text-sm font-medium">{r.rating}</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(r.drank_at).toLocaleDateString("zh-CN")}
                    </span>
                    {r.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {r.location}
                      </span>
                    )}
                    {!r.is_public && <Badge variant="outline" className="text-[10px]">私密</Badge>}
                  </CardDescription>
                </Link>
              </CardHeader>
              <CardContent className="py-0 pb-3">
                {r.note && (
                  <>
                    <p className="text-sm text-muted-foreground">{r.note}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {r.sugar_level && <span>甜度 {r.sugar_level}</span>}
                      {r.ice_level && (
                        <span>
                          {r.ice_level === "no_ice" ? "去冰" :
                           r.ice_level === "less_ice" ? "少冰" :
                           r.ice_level === "normal_ice" ? "正常冰" :
                           r.ice_level === "hot" ? "热" : "多冰"}
                        </span>
                      )}
                      {r.size && (
                        <span>
                          {r.size === "small" ? "小杯" :
                           r.size === "medium" ? "中杯" :
                           r.size === "large" ? "大杯" : "超大杯"}
                        </span>
                      )}
                      {r.price_paid && <span>¥{r.price_paid}</span>}
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/diary/new?brandId=${r.drinks?.brand_id || r.brand_id}&drinkName=${encodeURIComponent(r.drinks?.name || "")}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      🧋 再来
                    </Link>
                    <Link
                      href={`/catalog/drinks/${r.drink_id}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      <MessageCircle className="size-3.5" />
                      {commentCounts.get(r.id) || 0}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="size-3 text-rose-400 fill-rose-400" />
                      {likeCounts.get(r.id) || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/diary/${r.id}/edit`}
                      className={buttonVariants({ size: "sm", variant: "ghost" })}
                    >
                      <Pencil className="size-3.5" />
                    </Link>
                    <DeleteButton recordId={r.id} drinkId={r.drink_id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
