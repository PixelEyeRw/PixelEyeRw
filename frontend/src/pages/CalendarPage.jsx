import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { DEADLINES } from "../lib/mockData";

// GET /api/om/calendar?month=&am=
export default function CalendarPage() {
  const [amFilter, setAmFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState(12);
  const startOffset = 2;

  const cells = useMemo(() => {
    const arr = Array(startOffset).fill(null);
    for (let d = 1; d <= 30; d++) arr.push(d);
    return arr;
  }, []);

  const filteredDeadlines = (day) => {
    const items = DEADLINES[day] || [];
    return amFilter === "all" ? items : items.filter((i) => i.am === amFilter);
  };

  const upcoming = Object.entries(DEADLINES)
    .flatMap(([day, items]) => items.map((i) => ({ ...i, day: Number(day) })))
    .filter((i) => amFilter === "all" || i.am === amFilter)
    .sort((a, b) => a.day - b.day);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">Calendar</h1>
        <label className="text-sm" style={{ color: colors.muted }}>
          <span className="sr-only">Filter deadlines by account manager</span>
          <select value={amFilter} onChange={(e) => setAmFilter(e.target.value)} className="rounded px-3 py-2 text-sm w-full sm:w-auto" style={{ border: `1px solid ${colors.border}` }}>
            <option value="all">All account managers</option>
            <option value="Elena Rossi">Elena Rossi</option>
            <option value="Marcus Thorne">Marcus Thorne</option>
            <option value="Jordan Vance">Jordan Vance</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <ChevronLeft size={16} color={colors.muted} />
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">June 2024</h3>
            <ChevronRight size={16} color={colors.muted} />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ color: colors.muted, ...fontBody }} className="text-xs uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const hasDeadline = day && DEADLINES[day];
              const isSelected = day === selectedDay;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => day && setSelectedDay(day)}
                  disabled={!day}
                  className="rounded aspect-square flex flex-col items-center justify-center cursor-pointer text-sm"
                  style={{
                    background: isSelected ? colors.primary : "transparent",
                    color: isSelected ? colors.neutral : colors.primary,
                    border: day ? `1px solid ${colors.border}` : "none",
                    ...fontBody,
                  }}
                >
                  {day}
                  {hasDeadline && <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: isSelected ? colors.secondary : colors.danger }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-3">June {selectedDay}</h3>
            {filteredDeadlines(selectedDay).length === 0 ? (
              <p style={{ color: colors.muted, ...fontBody }} className="text-sm">No deadlines on this day.</p>
            ) : (
              <div className="space-y-2">
                {filteredDeadlines(selectedDay).map((d, i) => (
                  <div key={i} className="p-2 rounded" style={{ border: `1px solid ${colors.border}` }}>
                    <div style={{ color: colors.primary, ...fontBody }} className="text-sm font-semibold">{d.title}</div>
                    <div style={{ color: colors.muted, ...fontBody }} className="text-xs">{d.am}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-3">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {upcoming.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div style={{ color: colors.primary, ...fontBody }} className="text-sm font-semibold">{d.title}</div>
                    <div style={{ color: colors.muted, ...fontBody }} className="text-xs">{d.am}</div>
                  </div>
                  <span style={{ color: colors.muted, ...fontBody }} className="text-xs">June {d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}