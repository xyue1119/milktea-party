"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RecordDay {
  date: string;
  drinks: { name: string; brandName: string; rating?: number }[];
}

export function MiniCalendar({ records }: { records: RecordDay[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const recordSet = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.date));
    return set;
  }, [records]);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.date, (map.get(r.date) || 0) + 1);
    });
    return map;
  }, [records]);

  const monthLabel = `${month + 1}月`;
  const todayStr = today.toISOString().slice(0, 10);

  // Count days with records this month
  const activeDays = Array.from(recordSet).filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">吨吨日历</span>
        <div className="flex items-center gap-1">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="p-0.5 rounded hover:bg-muted">
            <ChevronLeft className="size-3" />
          </button>
          <span className="text-xs font-semibold w-14 text-center">
            {year}年{monthLabel}
          </span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="p-0.5 rounded hover:bg-muted">
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>

      {/* 迷你日历网格 */}
      <div className="bg-muted/30 rounded-lg p-2">
        {/* 星期头 */}
        <div className="grid grid-cols-7 mb-0.5">
          {["日","一","二","三","四","五","六"].map((d) => (
            <div key={d} className="text-center text-[9px] text-muted-foreground/60">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[1px]">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`e-${i}`} className="h-6" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const hasRecords = recordSet.has(dateStr);
            const count = countByDate.get(dateStr) || 0;
            const isToday = dateStr === todayStr;

            return (
              <div
                key={day}
                className={`h-6 flex items-center justify-center rounded-sm text-[10px] ${
                  hasRecords
                    ? "bg-primary/20 text-primary font-semibold"
                    : isToday
                      ? "text-primary font-bold"
                      : "text-muted-foreground/50"
                }`}
                title={hasRecords ? `${dateStr} · ${count}杯` : dateStr}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1.5">
        本月 {activeDays} 天吨了 · 共 {records.length} 杯
      </p>
    </div>
  );
}
