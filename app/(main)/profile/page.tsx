import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Star, Coffee, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const catLabel: Record<string, string> = {
  milk_tea: "奶茶",
  fruit_tea: "果茶",
  cheese_tea: "芝士茶",
  pure_tea: "纯茶",
  smoothie: "冰沙",
  other: "特调/咖啡",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // 从 profiles 表获取真实数据
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url, total_drinks, favorite_brand_id")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || user.user_metadata?.display_name || "奶茶新友";
  const username = profile?.username || user.user_metadata?.username || "";

  // 评价数
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 最爱品牌
  let favoriteBrand: string | null = null;
  if (profile?.favorite_brand_id) {
    const { data: brand } = await supabase
      .from("brands")
      .select("name")
      .eq("id", profile.favorite_brand_id)
      .single();
    favoriteBrand = brand?.name || null;
  }

  // 最爱品牌：按记录数最多的品牌
  let topBrand: string | null = null;
  if (!favoriteBrand) {
    const { data: brandCounts } = await supabase
      .from("records")
      .select("brand_id, brands:brand_id(name)")
      .eq("user_id", user.id);
    const counts = new Map<string, number>();
    brandCounts?.forEach((r: any) => {
      const name = r.brands?.name || "未知";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    let max = 0;
    counts.forEach((count, name) => {
      if (count > max) { max = count; topBrand = name; }
    });
  }

  // 最近记录
  const { data: recentRecords } = await supabase
    .from("records")
    .select("*, drinks:drink_id(id, name, category), brands:brand_id(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* 个人信息卡片 */}
      <Card className="mb-4">
        <CardHeader className="text-center pb-2">
          <div className="size-20 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center text-4xl ring-2 ring-muted select-none">
            {profile?.avatar_url || displayName[0]}
          </div>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <Link href="/profile/edit" className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="size-4" />
            </Link>
          </div>
          <CardDescription>@{username}</CardDescription>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{profile.bio}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 text-center pt-2 border-t">
            <div>
              <div className="text-xl font-bold">{profile?.total_drinks || 0}</div>
              <div className="text-xs text-muted-foreground">吨吨</div>
            </div>
            <div>
              <div className="text-xl font-bold">{reviewCount || 0}</div>
              <div className="text-xs text-muted-foreground">评价</div>
            </div>
            <div>
              <div className="text-xl font-bold truncate px-1">{favoriteBrand || topBrand || "-"}</div>
              <div className="text-xs text-muted-foreground">最爱品牌</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近吨吨 */}
      <h3 className="text-sm font-medium text-muted-foreground mb-2">最近吨吨</h3>
      {!recentRecords || recentRecords.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Coffee className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">还没有吨吨记录</p>
            <Link href="/diary/new" className={buttonVariants({ size: "sm", className: "mt-3" })}>
              🧋 喝一杯
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recentRecords.map((r: any) => (
            <Link key={r.id} href={`/diary/${r.id}`} className="block">
              <Card className="hover:bg-accent/[0.03] transition-colors">
                <CardContent className="py-2.5 px-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {r.brands?.name || "未知品牌"}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {r.drinks?.name || "未知饮品"}
                      </span>
                    </div>
                    {r.drinks?.category && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {catLabel[r.drinks.category] || r.drinks.category}
                      </p>
                    )}
                  </div>
                  {r.rating && (
                    <div className="flex items-center gap-0.5 text-amber-400 shrink-0 ml-2">
                      <Star className="size-3.5 fill-current" />
                      <span className="text-sm font-medium">{r.rating}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 设置 */}
      <Card className="mt-4">
        <CardContent className="p-0">
          <form action={signOut}>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground h-12 px-4"
              type="submit"
            >
              <LogOut className="size-4 mr-2" />
              退出登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
