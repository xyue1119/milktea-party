import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const illustrations = [
  { file: "Milk Tea with Pearls.svg", label: "经典珍珠奶茶", emoji: "🧋" },
  { file: "Mango Matcha Pearl Tea.svg", label: "芒果抹茶珍珠", emoji: "🥭" },
  { file: "Mango Pearl Green Tea Latte.svg", label: "芒果珍珠绿茶拿铁", emoji: "🍵" },
  { file: "Mango Smoothie.svg", label: "芒果冰沙", emoji: "🥭" },
  { file: "Matcha Smoothie.svg", label: "抹茶冰沙", emoji: "🍵" },
  { file: "Milk Foam Black Forest.svg", label: "黑森林奶盖", emoji: "🍫" },
  { file: "Panda Milk Foam.svg", label: "熊猫奶盖", emoji: "🐼" },
  { file: "Starwberry Taro Milk.svg", label: "草莓芋泥牛奶", emoji: "🍓" },
  { file: "Starwberry.svg", label: "草莓饮品", emoji: "🍓" },
  { file: "Taro with Redbean.svg", label: "芋泥红豆", emoji: "🍠" },
  { file: "Watermelon.svg", label: "西瓜饮品", emoji: "🍉" },
  { file: "Lemon with Basil seeds.svg", label: "柠檬罗勒籽", emoji: "🍋" },
];

export default function IllustrationPicker() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">🎨 奶茶插画选选看</h1>
          <span className="ml-auto text-xs text-muted-foreground">
            {illustrations.length} 个可选
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-4 text-sm text-muted-foreground">
          来源：GitHub meglaurie/SVG-Bubble-tea-icons · 手绘风 · 可免费商用
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {illustrations.map((ill) => (
            <Card key={ill.file} className="overflow-hidden p-0">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  {ill.emoji} {ill.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-3 min-h-[180px] bg-linear-to-b from-muted/30 to-muted/10">
                <img
                  src={`/illustrations/${ill.file}`}
                  alt={ill.label}
                  className="h-[140px] w-auto object-contain transition-transform hover:scale-110"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
