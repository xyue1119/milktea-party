"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { pinyin } from "pinyin-pro";
import { Search, ChevronRight, Coffee } from "lucide-react";
import Link from "next/link";

export default function CatalogPage() {
  const supabase = createClient();
  const [brands, setBrands] = useState<{ id: string; name: string; drink_count: number }[]>([]);
  const [search, setSearch] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    supabase.from("brands").select("id, name, drink_count").order("name").then(({ data }) => {
      if (data) {
        data.sort((a, b) => a.name.localeCompare(b.name, "zh"));
        setBrands(data);
      }
    });
  }, []);

  const filteredBrands = useMemo(() => {
    if (!search) return brands;
    const s = search.toLowerCase();
    return brands.filter((b) => {
      if (b.name.toLowerCase().includes(s)) return true;
      const py = pinyin(b.name, { toneType: "none" }).toLowerCase();
      if (py.includes(s)) return true;
      if (pinyin(b.name, { pattern: "first", toneType: "none" }).toLowerCase().includes(s)) return true;
      return false;
    });
  }, [brands, search]);

  const brandGroups = useMemo(() => {
    const groups: Record<string, typeof filteredBrands> = {};
    filteredBrands.forEach((b) => {
      const first = pinyin(b.name, { pattern: "first", toneType: "none" }).charAt(0).toUpperCase();
      const key = /^[A-Z]$/.test(first) ? first : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return Object.entries(groups).sort(([a], [b]) =>
      a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
    );
  }, [filteredBrands]);

  const letters = useMemo(() => brandGroups.map(([k]) => k), [brandGroups]);

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h2 className="text-lg font-bold mb-4">菜单浏览</h2>

      {/* 搜索 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="搜索品牌或拼音..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* 横向 A-Z 导航条 — 双行 */}
      {!search && letters.length > 1 && (() => {
        const mid = Math.ceil(letters.length / 2);
        const rows = [letters.slice(0, mid), letters.slice(mid)];
        return (
          <div className="space-y-1.5 mb-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-1.5 flex-wrap">
                {row.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => scrollToLetter(l)}
                    className="shrink-0 w-8 h-8 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/85 active:scale-95 transition-all"
                  >
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

      {/* 品牌列表 */}
      {brandGroups.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          找不到品牌？联系 @奶茶首席品鉴官yoki💅 添加
        </div>
      ) : (
        <div className="space-y-4">
          {brandGroups.map(([letter, list]) => (
            <div key={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-sm font-extrabold">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {list.map((b) => (
                  <Link
                    key={b.id}
                    href={`/catalog/brands/${b.id}`}
                    className="flex items-center justify-between rounded-xl border px-3 py-3 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.drink_count > 0 ? `${b.drink_count} 款` : "待探索"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/40 shrink-0 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部联系 */}
      {brandGroups.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
          没找到想要的品牌？联系 @奶茶首席品鉴官yoki💅 添加
        </p>
      )}
    </div>
  );
}
