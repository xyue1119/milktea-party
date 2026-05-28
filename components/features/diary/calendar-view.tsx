"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RecordDay {
  date: string;
  drinks: { name: string; brandName: string; rating?: number }[];
}

function weekdayOffset(year: number, month: number, day: number) {
  // 0=Sun .. 6=Sat
  return new Date(year, month, day).getDay();
}

export function CalendarView({ records }: { records: RecordDay[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = weekdayOffset(year, month, 1);

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

  const monthLabel = `${year}年${month + 1}月`;
  const dayHeaders = ["日", "一", "二", "三", "四", "五", "六"];
  const todayStr = today.toISOString().slice(0, 10);
  const selectedRecord = selectedDate ? recordMap.get(selectedDate) : null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronRight className="size-4" />
        </button>
      </div>

      <Card>
        <CardContent className="p-2">
          {/* 星期头 */}
          <div className="grid grid-cols-7 mb-1">
            {dayHeaders.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} className="h-[52px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayData = recordMap.get(dateStr);
              const hasRecords = !!dayData;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const count = dayData?.drinks.length || 0;
              const firstDrink = dayData?.drinks[0];

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => hasRecords && setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-[52px] rounded-md flex flex-col items-center justify-start pt-1 gap-0.5 transition-colors relative ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "bg-primary/10"
                        : hasRecords
                          ? "hover:bg-accent/50"
                          : ""
                  }`}
                >
                  <span className={`text-[11px] leading-none ${isToday && !isSelected ? "text-primary font-bold" : hasRecords ? "font-semibold" : "text-muted-foreground/40"}`}>
                    {day}
                  </span>
                  {firstDrink && (
                    <span className={`text-[9px] leading-tight truncate w-[90%] text-center ${
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {firstDrink.brandName.length <= 3 ? firstDrink.brandName : firstDrink.name}
                    </span>
                  )}
                  {count > 1 && (
                    <span className={`absolute top-0.5 right-0.5 text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                      isSelected ? "bg-primary-foreground/30 text-primary-foreground" : "bg-primary text-primary-foreground"
                    }`}>
                      {count}
                    </span>
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
          <p className="text-xs text-muted-foreground font-medium">{selectedRecord.date}</p>
          {selectedRecord.drinks.map((d, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="py-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="text-[10px] shrink-0">{d.brandName}</Badge>
                  <span className="text-sm font-medium truncate">{d.name}</span>
                </div>
                {d.rating && (
                  <span className="text-xs text-amber-500 font-medium shrink-0 ml-2">★ {d.rating}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
