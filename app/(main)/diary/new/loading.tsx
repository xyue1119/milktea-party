import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewRecordLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/diary" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h2 className="text-lg font-bold">吨吨一杯</h2>
        <Loader2 className="size-4 animate-spin text-muted-foreground ml-1" />
        <span className="text-xs text-muted-foreground animate-pulse">加载中...</span>
      </div>

      <div className="space-y-5">
        {/* 品牌 */}
        <div className="space-y-1.5">
          <div className="h-4 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-11 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        {/* 饮品 */}
        <div className="space-y-1.5">
          <div className="h-4 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-11 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        {/* 日期 */}
        <div className="space-y-1.5">
          <div className="h-4 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-11 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        {/* 评分 */}
        <div className="space-y-1.5">
          <div className="h-4 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="size-7 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            ))}
          </div>
        </div>
        {/* 评价 */}
        <div className="space-y-1.5">
          <div className="h-4 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-24 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        {/* 甜度/温度/规格 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="flex gap-1">
              <div className="h-6 w-10 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
              <div className="h-6 w-10 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
              <div className="h-6 w-10 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="flex gap-1">
              <div className="h-6 w-8 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
              <div className="h-6 w-8 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
              <div className="h-6 w-8 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="flex gap-1">
              <div className="h-6 w-10 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
              <div className="h-6 w-10 rounded-full bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        </div>
        {/* 价格/门店 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-12 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="h-10 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-8 rounded bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
            <div className="h-10 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        {/* 提交按钮 */}
        <div className="h-11 rounded-lg bg-linear-to-r from-muted via-muted-foreground/15 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}
