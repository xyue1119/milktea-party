"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RecordDay {
  date: string; // YYYY-MM-DD
  drinks: { name: string; brandName: string; rating?: number }[];
}

export function CalendarView({ records }: { records: RecordDay[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const recordMap = useMemo(() => {
    const map = new Map<string, RecordDay>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const monthLabel = `${year} 年 ${month + 1} 月`;
  const dayHeaders = ["日", "一", "二", "三", "四", "五", "六"];

  const selectedRecord = selectedDate ? recordMap.get(selectedDate) : null;

  return (
    <div className="mb-6">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 日历网格 */}
      <Card>
        <CardContent className="p-3">
          {/* 星期头 */}
          <div className="grid grid-cols-7 mb-1">
            {dayHeaders.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-px">
            {/* 空白填充 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* 日期 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasRecords = recordMap.has(dateStr);
              const dayData = recordMap.get(dateStr);
              const isToday = dateStr === today.toISOString().slice(0, 10);
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => hasRecords && setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-md text-xs transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "bg-primary/10 text-primary font-bold"
                        : hasRecords
                          ? "hover:bg-accent"
                          : "text-muted-foreground/40"
                  }`}
                >
                  <span className={hasRecords ? "font-semibold" : ""}>{day}</span>
                  {hasRecords && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayData!.drinks.slice(0, 3).map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 选中日期详情 */}
      {selectedRecord && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            {selectedRecord.date}
          </p>
          {selectedRecord.drinks.map((d, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="py-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{d.brandName}</Badge>
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                {d.rating && (
                  <span className="text-xs text-amber-500 font-medium">★ {d.rating}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
