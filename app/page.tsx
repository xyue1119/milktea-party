import {
  BookHeart,
  Store,
  Compass,
  CircleUser,
  Heart,
  MessageCircle,
  Star,
  Plus,
  Search,
  MapPin,
  Clock,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navTabs = [
  { icon: BookHeart, label: "吨吨本" },
  { icon: Store, label: "菜单" },
  { icon: Compass, label: "发现" },
  { icon: CircleUser, label: "我的" },
];

export default function ThemePreview() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Coffee className="size-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">奶茶派对</h1>
          </div>
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              我
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-6 pb-24">
        {/* 配色说明 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">配色系统 · A+C 黑糖草莓</CardTitle>
            <CardDescription>奶茶米色底 + 黑糖棕主色 + 草莓粉点缀</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { cls: "bg-primary text-primary-foreground", label: "黑糖主色" },
                { cls: "bg-accent text-accent-foreground", label: "草莓强调" },
                { cls: "bg-secondary text-secondary-foreground", label: "太妃糖辅色" },
                { cls: "bg-muted text-muted-foreground", label: "奶霜静音" },
              ].map((c) => (
                <div key={c.label} className={`rounded-lg px-3 py-2.5 text-sm font-medium text-center ${c.cls}`}>
                  {c.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 按钮展示 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">按钮</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button>黑糖主按钮</Button>
              <Button variant="secondary">太妃糖次按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">小按钮</Button>
              <Button size="sm" variant="secondary">小次按钮</Button>
              <Button size="sm" variant="outline">小轮廓</Button>
              <Button size="icon" className="size-9"><Plus className="size-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Button className="bg-accent text-accent-foreground hover:opacity-90">草莓粉按钮</Button>
              <Button disabled>禁用状态</Button>
            </div>
          </CardContent>
        </Card>

        {/* 输入框 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">输入框 & 搜索</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="输入奶茶名..." />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="搜索品牌或饮品..." />
            </div>
          </CardContent>
        </Card>

        {/* 标签 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">标签 Badge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>默认</Badge>
              <Badge variant="secondary">喜茶</Badge>
              <Badge variant="outline">蜜雪冰城</Badge>
              <Badge className="bg-accent text-accent-foreground hover:bg-accent">热门</Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="size-3 fill-current" /> 4.8
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 吨吨本卡片示例 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">小明</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">小明</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">喜茶</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3" /> 2 小时前
                  <MapPin className="size-3" /> 朝阳大悦城
                </div>
              </div>
              <Coffee className="size-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="mb-1 flex items-center gap-2">
              多肉葡萄
              <Badge variant="outline" className="text-[10px]">果茶</Badge>
            </CardTitle>
            <CardDescription>
              少糖 · 少冰 · 加了脆波波 · 今天的葡萄特别甜，奶盖也很浓郁！
            </CardDescription>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1,2,3,4,5].map(i => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
              <span className="text-xs text-muted-foreground">¥19.00</span>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-accent">
                <Heart className="size-3.5" /> 12
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground">
                <MessageCircle className="size-3.5" /> 3
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 底部导航 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">底部导航</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              {navTabs.map((tab, i) => {
                const active = i === 0;
                const Icon = tab.icon;
                return (
                  <div
                    key={tab.label}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 固定底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navTabs.map((tab, i) => {
            const active = i === 0;
            const Icon = tab.icon;
            return (
              <div
                key={tab.label}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors cursor-pointer ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
