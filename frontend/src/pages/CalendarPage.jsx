import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { apiGet, getSession } from "../lib/teamData";

// GET /api/om/calendar?month=&am=
export default function CalendarPage() {
  const session = getSession();
  const [amFilter, setAmFilter] = useState("all");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(1);
  const [deadlines, setDeadlines] = useState([]);
  const [accountManagers, setAccountManagers] = useState([]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  useEffect(() => {
    const accountManagerId = session?.role?.toLowerCase().includes("account") ? session.id : amFilter === "all" ? "" : amFilter;
    const query = new URLSearchParams({ month: monthKey });
    if (accountManagerId) query.set("accountManagerId", accountManagerId);
    Promise.all([apiGet(`/om/calendar?${query}`), apiGet("/om/account-managers")])
      .then(([items, managers]) => {
        setDeadlines(items);
        setAccountManagers(managers);
      })
      .catch((error) => console.error("Could not load calendar deadlines:", error));
  }, [monthKey, amFilter, session?.id, session?.role]);

  const cells = useMemo(() => {
    const startOffset = new Date(year, monthIndex, 1).getDay();
    const arr = Array(startOffset).fill(null);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) arr.push(day);
    return arr;
  }, [year, monthIndex]);

  const filteredDeadlines = (day) => {
    return deadlines.filter((item) => Number(item.date.slice(8, 10)) === day);
  };

  const upcoming = deadlines.slice().sort((a, b) => a.date.localeCompare(b.date));
  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const moveMonth = (offset) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    setSelectedDay(1);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">Calendar</h1>
        <label className="text-sm" style={{ color: colors.muted }}>
          <span className="sr-only">Filter deadlines by account manager</span>
          <select value={amFilter} onChange={(e) => setAmFilter(e.target.value)} className="rounded px-3 py-2 text-sm w-full sm:w-auto" style={{ border: `1px solid ${colors.border}` }}>
            <option value="all">All account managers</option>
            {accountManagers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft size={16} color={colors.muted} /></button>
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">{monthLabel}</h3>
            <button type="button" aria-label="Next month" onClick={() => moveMonth(1)}><ChevronRight size={16} color={colors.muted} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ color: colors.muted, ...fontBody }} className="text-xs uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const hasDeadline = day && filteredDeadlines(day).length > 0;
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
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-3">{monthLabel} {selectedDay}</h3>
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
                  <span style={{ color: colors.muted, ...fontBody }} className="text-xs">{new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}