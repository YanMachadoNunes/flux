"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./agenda.module.css";

interface Props {
  activeDates: string[]; // "YYYY-MM-DD" strings with appointments
  selectedDate: string;  // currently selected "YYYY-MM-DD"
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export function AgendaCalendar({ activeDates, selectedDate }: Props) {
  const router = useRouter();
  const today = new Date();

  const [viewYear, setViewYear] = useState(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return d.getMonth();
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const fmt = (d: number) => String(d).padStart(2, "0");

  const selectDay = (day: number) => {
    const dateStr = `${viewYear}-${fmt(viewMonth + 1)}-${fmt(day)}`;
    router.push(`/agenda?date=${dateStr}`);
  };

  const todayStr   = `${today.getFullYear()}-${fmt(today.getMonth() + 1)}-${fmt(today.getDate())}`;
  const activeSet  = new Set(activeDates);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={styles.calendarCard}>
      {/* Month navigation */}
      <div className={styles.calNavHeader}>
        <button className={styles.calNavBtn} onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className={styles.calMonthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className={styles.calNavBtn} onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className={styles.calGrid}>
        {WEEKDAYS.map((w) => (
          <div key={w} className={styles.calWeekday}>{w}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = `${viewYear}-${fmt(viewMonth + 1)}-${fmt(day)}`;
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasAppts   = activeSet.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => selectDay(day)}
              className={[
                styles.calDay,
                isToday    ? styles.calToday    : "",
                isSelected ? styles.calSelected : "",
              ].join(" ")}
            >
              {day}
              {hasAppts && !isSelected && (
                <span className={styles.calDot} />
              )}
            </button>
          );
        })}
      </div>

      {/* Go to today */}
      {selectedDate !== todayStr && (
        <button
          className={styles.calTodayBtn}
          onClick={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
            router.push("/agenda");
          }}
        >
          Ir para hoje
        </button>
      )}
    </div>
  );
}
