"use client";

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Star, ArrowLeft, Loader2, Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { pinyin } from "pinyin-pro";
import { toast } from "sonner";

const req = "text-red-400";

function EditRecordForm() {
  const router = useRouter();
  const { recordId } = useParams<{ recordId: string }>();
  const supabase = createClient();

  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<{ id: string; name: string } | null>(null);

  const [drinks, setDrinks] = useState<{ id: string; name: string }[]>([]);
  const [drinkOpen, setDrinkOpen] = useState(false);
  const [drinkSearch, setDrinkSearch] = useState("");
  const [selectedDrink, setSelectedDrink] = useState<{ id: string; name: string } | null>(null);
  const [isNewDrink, setIsNewDrink] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sugarLevel, setSugarLevel] = useState("");
  const [iceLevel, setIceLevel] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load brands
  useEffect(() => {
    supabase.from("brands").select("id, name").order("name").then(({ data }) => {
      if (data) {
        data.sort((a, b) => a.name.localeCompare(b.name, "zh"));
        setBrands(data);
      }
    });
  }, []);

  // Load existing record
  useEffect(() => {
    supabase
      .from("records")
      .select("*, drinks:drink_id(id, name, brand_id), brands:brand_id(id, name)")
      .eq("id", recordId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const brand = (data.brands as any) || { id: data.brand_id, name: "未知品牌" };
        setSelectedBrand({ id: brand.id || data.brand_id, name: brand.name || "未知品牌" });
        const drink = (data.drinks as any);
        if (drink) {
          setSelectedDrink({ id: drink.id, name: drink.name });
          setDrinkSearch(drink.name);
        }
        setRating(data.rating || 0);
        setComment(data.note || "");
        setSugarLevel(data.sugar_level || "");
        setIceLevel(data.ice_level || "");
        setSize(data.size || "");
        setPrice(data.price_paid ? String(data.price_paid) : "");
        setLocation(data.location || "");
        setLoading(false);
      });
  }, [recordId]);

  // Load drinks for selected brand
  useEffect(() => {
    if (!selectedBrand) {
      setDrinks([]);
      return;
    }
    supabase
      .from("drinks")
      .select("id, name")
      .eq("brand_id", selectedBrand.id)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setDrinks(data);
      });
  }, [selectedBrand]);

  const brandGroups = useMemo(() => {
    const list = brandSearch ? brands.filter((b) => {
      const s = brandSearch.toLowerCase();
      if (b.name.toLowerCase().includes(s)) return true;
      const py = pinyin(b.name, { toneType: "none" }).toLowerCase();
      if (py.includes(s)) return true;
      if (pinyin(b.name, { pattern: "first", toneType: "none" }).toLowerCase().includes(s)) return true;
      return false;
    }) : brands;

    const groups: Record<string, typeof brands> = {};
    list.forEach((b) => {
      const first = pinyin(b.name, { pattern: "first", toneType: "none" }).charAt(0).toUpperCase();
      const key = /^[A-Z]$/.test(first) ? first : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });

    return Object.entries(groups).sort(([a], [b]) =>
      a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
    );
  }, [brands, brandSearch]);

  const letters = useMemo(() => brandGroups.map(([k]) => k), [brandGroups]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = sectionRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredDrinks = drinkSearch
    ? drinks.filter((d) => d.name.toLowerCase().includes(drinkSearch.toLowerCase()))
    : drinks;

  const drinkExactMatch = drinks.some((d) => d.name === drinkSearch.trim());
  const showCreateDrink = drinkSearch.trim() && !drinkExactMatch && selectedBrand;

  async function ensureDrink(brandId: string, drinkName: string): Promise<string> {
    const { data: existing } = await supabase
      .from("drinks")
      .select("id")
      .eq("brand_id", brandId)
      .eq("name", drinkName.trim())
      .maybeSingle();
    if (existing) return existing.id;
    const { data } = await supabase
      .from("drinks")
      .insert({ brand_id: brandId, name: drinkName.trim() })
      .select("id")
      .single();
    return data!.id;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    if (!comment.trim()) return;
    if (!selectedBrand) return;
    if (!selectedDrink && !drinkSearch.trim()) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let drinkId = selectedDrink?.id;
      if (!drinkId && drinkSearch.trim()) {
        drinkId = await ensureDrink(selectedBrand!.id, drinkSearch.trim());
      }

      const { error } = await supabase
        .from("records")
        .update({
          drink_id: drinkId!,
          brand_id: selectedBrand!.id,
          rating,
          note: comment.trim(),
          sugar_level: sugarLevel || null,
          ice_level: iceLevel || null,
          size: size || null,
          price_paid: price ? parseFloat(price) : null,
          location: location.trim() || null,
        })
        .eq("id", recordId);

      if (error) throw error;

      router.push("/diary");
      router.refresh();
      toast.success("吨吨已更新！🧋");
    } catch (err: any) {
      toast.error("保存失败：" + (err.message || "未知错误"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/diary" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h2 className="text-lg font-bold">编辑吨吨</h2>
        </div>
        <div className="space-y-5 animate-pulse">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/diary" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h2 className="text-lg font-bold">编辑吨吨</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 品牌 * */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            品牌 <span className={req}>*</span>
          </label>
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm",
                "bg-background hover:bg-accent/50 transition-colors",
                !selectedBrand && "text-muted-foreground"
              )}
            >
              {selectedBrand ? selectedBrand.name : "选择品牌..."}
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[--available-width] p-0" align="start">
              <div className="flex h-[400px]">
                {letters.length > 1 && (
                  <div className="flex flex-col justify-center items-center w-8 py-2 border-r bg-muted/30 shrink-0">
                    {letters.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => scrollToLetter(l)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground py-0.5 px-1 transition-colors"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="搜索品牌（支持拼音）..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto">
                    {brandGroups.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        找不到品牌？联系 @奶茶首席品鉴官yoki💅 添加
                      </div>
                    ) : (
                      brandGroups.map(([letter, list]) => (
                        <div key={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
                          <div className="sticky top-0 bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                            {letter}
                          </div>
                          {list.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                if (selectedBrand?.id !== b.id) {
                                  setSelectedDrink(null);
                                  setDrinkSearch("");
                                  setIsNewDrink(false);
                                }
                                setSelectedBrand(b);
                                setBrandOpen(false);
                                setBrandSearch("");
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors",
                                selectedBrand?.id === b.id && "bg-accent"
                              )}
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 饮品 * */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            饮品 <span className={req}>*</span>
          </label>
          <Popover open={drinkOpen && !!selectedBrand} onOpenChange={(open) => selectedBrand && setDrinkOpen(open)}>
            <PopoverTrigger
              disabled={!selectedBrand}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm",
                "bg-background transition-colors",
                selectedBrand ? "hover:bg-accent/50" : "opacity-50 cursor-not-allowed text-muted-foreground",
                !selectedDrink && !isNewDrink && "text-muted-foreground"
              )}
            >
              {isNewDrink
                ? drinkSearch
                : selectedDrink
                  ? selectedDrink.name
                  : selectedBrand
                    ? "搜索或输入新饮品..."
                    : "先选品牌"}
              {selectedBrand && <ChevronsUpDown className="size-4 shrink-0 opacity-50" />}
            </PopoverTrigger>
            {selectedBrand && (
              <PopoverContent className="w-[--available-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="搜索饮品，搜不到直接创建..."
                    value={drinkSearch}
                    onValueChange={(v) => {
                      setDrinkSearch(v);
                      setIsNewDrink(false);
                      setSelectedDrink(null);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>提交时自动创建新饮品</CommandEmpty>
                    <CommandGroup heading={filteredDrinks.length > 0 ? "已有饮品" : undefined}>
                      {filteredDrinks.map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => {
                            setSelectedDrink(d);
                            setDrinkSearch(d.name);
                            setIsNewDrink(false);
                            setDrinkOpen(false);
                          }}
                        >
                          {d.name}
                          <Check className={cn("ml-auto size-4", selectedDrink?.id === d.id ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                      {showCreateDrink && (
                        <CommandItem
                          value={`_create_${drinkSearch}`}
                          onSelect={() => {
                            setIsNewDrink(true);
                            setSelectedDrink(null);
                            setDrinkOpen(false);
                          }}
                          className="text-primary font-medium"
                        >
                          <Plus className="size-4" />
                          创建 "{drinkSearch.trim()}"
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            )}
          </Popover>
          {isNewDrink && (
            <p className="text-xs text-primary/80">新饮品「{drinkSearch.trim()}」，提交时自动收录</p>
          )}
        </div>

        {/* 评分 * */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            评分 <span className={req}>*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="p-1 transition-colors">
                <Star
                  className={cn(
                    "size-7",
                    n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground self-center ml-2">{rating} 分</span>
            )}
          </div>
        </div>

        {/* 评价 * */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            评价 <span className={req}>*</span>
          </label>
          <Textarea
            placeholder="口感、甜度、性价比…怎么想怎么写"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {comment.length > 0 && (
            <p className="text-xs text-muted-foreground text-right">{comment.length} 字</p>
          )}
        </div>

        {/* 甜度 / 温度 / 规格 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">甜度</span>
            <div className="flex flex-wrap gap-1">
              {["0%", "30%", "50%", "70%", "100%"].map((s) => (
                <Badge
                  key={s}
                  variant={sugarLevel === s ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSugarLevel(sugarLevel === s ? "" : s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">温度</span>
            <div className="flex flex-wrap gap-1">
              {[
                { k: "hot", v: "热" },
                { k: "no_ice", v: "去冰" },
                { k: "less_ice", v: "少冰" },
                { k: "normal_ice", v: "正常冰" },
              ].map(({ k, v }) => (
                <Badge
                  key={k}
                  variant={iceLevel === k ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setIceLevel(iceLevel === k ? "" : k)}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">规格</span>
            <div className="flex flex-wrap gap-1">
              {[
                { k: "medium", v: "中杯" },
                { k: "large", v: "大杯" },
                { k: "extra_large", v: "超大杯" },
              ].map(({ k, v }) => (
                <Badge
                  key={k}
                  variant={size === k ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSize(size === k ? "" : k)}
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 价格 + 门店 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">价格 (¥)</span>
            <Input
              type="number"
              step="0.01"
              placeholder="19.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">门店</span>
            <Input
              placeholder="朝阳大悦城"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* 提交 */}
        <Button
          type="submit"
          className="w-full"
          disabled={submitting || rating === 0 || !comment.trim() || !selectedBrand || (!selectedDrink && !drinkSearch.trim())}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 mr-1 animate-spin" />
              保存中...
            </>
          ) : (
            "💾 保存修改"
          )}
        </Button>
      </form>
    </div>
  );
}

export default function EditRecordPage() {
  return (
    <Suspense>
      <EditRecordForm />
    </Suspense>
  );
}
