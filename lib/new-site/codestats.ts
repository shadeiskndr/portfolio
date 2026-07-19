import type { CodestatsProfileData } from "@/convex/codestats";

const LEVEL_FACTOR = 0.025;

export function levelFromXp(xp: number): number {
  return Math.floor(LEVEL_FACTOR * Math.sqrt(Math.max(xp, 0)));
}

export function xpForLevel(level: number): number {
  return Math.round((level / LEVEL_FACTOR) ** 2);
}

export function toDayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDayKey(key: string): Date {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const PROFILE_TIME_ZONE = "Asia/Kuala_Lumpur";

const zonedDayParts = new Intl.DateTimeFormat("en-US", {
  timeZone: PROFILE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayInProfileZone(now: Date): Date {
  const parts = zonedDayParts.formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return fromDayKey(`${part("year")}-${part("month")}-${part("day")}`);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function daysBetween(later: Date, earlier: Date): number {
  const ms =
    Date.UTC(later.getFullYear(), later.getMonth(), later.getDate()) -
    Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  return Math.round(ms / 86_400_000);
}

function activeDayKeys(dates: Record<string, number>): string[] {
  const keys: string[] = [];
  for (const [key, xp] of Object.entries(dates)) {
    if (xp > 0) keys.push(key);
  }
  keys.sort();
  return keys;
}

export function computeStreaks(
  dates: Record<string, number>,
  today: Date
): { current: number; longest: number } {
  const keys = activeDayKeys(dates);
  if (keys.length === 0) return { current: 0, longest: 0 };

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of keys) {
    const day = fromDayKey(key);
    run = previous && daysBetween(day, previous) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = day;
  }

  let current = 0;
  const lastKey = keys.at(-1);
  if (lastKey && daysBetween(today, fromDayKey(lastKey)) <= 1) {
    current = 1;
    for (let i = keys.length - 1; i > 0; i--) {
      const cur = keys[i];
      const prev = keys[i - 1];
      if (!(cur && prev)) break;
      if (daysBetween(fromDayKey(cur), fromDayKey(prev)) !== 1) break;
      current++;
    }
  }

  return { current, longest };
}

export type DailyPoint = {
  date: string;
  xp: number;
  cumulative: number;
};

export function buildDailySeries(
  dates: Record<string, number>,
  today: Date,
  days: number
): DailyPoint[] {
  const start = addDays(today, -(days - 1));

  let running = 0;
  for (const [key, xp] of Object.entries(dates)) {
    if (fromDayKey(key) < start) running += xp;
  }

  const points: DailyPoint[] = [];
  for (let offset = 0; offset < days; offset++) {
    const key = toDayKey(addDays(start, offset));
    const xp = dates[key] ?? 0;
    running += xp;
    points.push({ date: key, xp, cumulative: running });
  }
  return points;
}

export type LanguageSlice = {
  name: string;
  xp: number;
  recentXp: number;
  level: number;
  share: number;
};

export type LanguageBreakdown = {
  all: LanguageSlice[];
  top: LanguageSlice[];
  otherXp: number;
  otherCount: number;
  total: number;
};

export function buildLanguages(
  languages: CodestatsProfileData["languages"],
  topN = 8
): LanguageBreakdown {
  const all: LanguageSlice[] = [];
  let total = 0;
  for (const [name, entry] of Object.entries(languages)) {
    total += entry.xps;
    all.push({
      name,
      xp: entry.xps,
      recentXp: entry.new_xps,
      level: levelFromXp(entry.xps),
      share: 0,
    });
  }
  all.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

  let otherXp = 0;
  for (const [i, entry] of all.entries()) {
    entry.share = total > 0 ? entry.xp / total : 0;
    if (i >= topN) otherXp += entry.xp;
  }

  return {
    all,
    top: all.slice(0, topN),
    otherXp,
    otherCount: Math.max(all.length - topN, 0),
    total,
  };
}

export type MachineSlice = { name: string; xp: number; recentXp: number; share: number };

export function buildMachines(machines: CodestatsProfileData["machines"]): MachineSlice[] {
  const rows: MachineSlice[] = [];
  let total = 0;
  for (const [name, entry] of Object.entries(machines)) {
    total += entry.xps;
    rows.push({ name, xp: entry.xps, recentXp: entry.new_xps, share: 0 });
  }
  for (const row of rows) {
    row.share = total > 0 ? row.xp / total : 0;
  }
  rows.sort((a, b) => b.xp - a.xp);
  return rows;
}

export type CalendarCell = {
  date: string;
  xp: number;
  level: number;
  future: boolean;
};

export type Calendar = {
  weeks: CalendarCell[][];
  thresholds: [number, number, number];
  totalXp: number;
};

export function buildCalendar(
  dates: Record<string, number>,
  today: Date,
  { minWeeks = 12, maxWeeks = 53 }: { minWeeks?: number; maxWeeks?: number } = {}
): Calendar {
  let earliest: Date | null = null;
  for (const key of Object.keys(dates)) {
    const day = fromDayKey(key);
    if (!earliest || day < earliest) earliest = day;
  }

  const spanDays = earliest ? daysBetween(today, earliest) + 1 : 0;
  const weekCount = Math.min(
    maxWeeks,
    Math.max(minWeeks, Math.ceil((spanDays + today.getDay()) / 7))
  );

  const end = addDays(today, 6 - today.getDay());
  const start = addDays(end, -(weekCount * 7 - 1));

  const values: number[] = [];
  let totalXp = 0;
  for (let offset = 0; offset < weekCount * 7; offset++) {
    const xp = dates[toDayKey(addDays(start, offset))] ?? 0;
    if (xp > 0) {
      values.push(xp);
      totalXp += xp;
    }
  }
  values.sort((a, b) => a - b);

  const quantile = (q: number) => values[Math.floor((values.length - 1) * q)] ?? 0;
  const thresholds: [number, number, number] = [quantile(0.25), quantile(0.5), quantile(0.75)];

  const weeks: CalendarCell[][] = [];
  for (let week = 0; week < weekCount; week++) {
    const cells: CalendarCell[] = [];
    for (let day = 0; day < 7; day++) {
      const date = addDays(start, week * 7 + day);
      const key = toDayKey(date);
      const xp = dates[key] ?? 0;
      cells.push({ date: key, xp, level: levelFor(xp, thresholds), future: date > today });
    }
    weeks.push(cells);
  }

  return { weeks, thresholds, totalXp };
}

function levelFor(xp: number, thresholds: [number, number, number]): number {
  if (xp <= 0) return 0;
  if (xp <= thresholds[0]) return 1;
  if (xp <= thresholds[1]) return 2;
  if (xp <= thresholds[2]) return 3;
  return 4;
}

export type CodestatsSummary = {
  totalXp: number;
  recentXp: number;
  level: number;
  levelStartXp: number;
  nextLevelXp: number;
  levelRatio: number;
  xpToNextLevel: number;
  todayXp: number;
  last7Xp: number;
  activeDays: number;
  avgPerActiveDay: number;
  bestDay: { date: string; xp: number } | null;
  trackedSince: string | null;
  currentStreak: number;
  longestStreak: number;
  languageCount: number;
  machineCount: number;
};

export function summarize(data: CodestatsProfileData, today: Date): CodestatsSummary {
  const level = levelFromXp(data.total_xp);
  const levelStartXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = nextLevelXp - levelStartXp;

  const weekStart = addDays(today, -6);
  let activeDays = 0;
  let activeXp = 0;
  let last7Xp = 0;
  let bestDay: { date: string; xp: number } | null = null;
  let trackedSince: string | null = null;

  for (const [key, xp] of Object.entries(data.dates)) {
    if (xp > 0) {
      activeDays++;
      activeXp += xp;
      if (!bestDay || xp > bestDay.xp) bestDay = { date: key, xp };
    }
    if (!trackedSince || key < trackedSince) trackedSince = key;
    const day = fromDayKey(key);
    if (day >= weekStart && day <= today) last7Xp += xp;
  }

  const { current, longest } = computeStreaks(data.dates, today);

  return {
    totalXp: data.total_xp,
    recentXp: data.new_xp,
    level,
    levelStartXp,
    nextLevelXp,
    levelRatio: span > 0 ? Math.min(Math.max((data.total_xp - levelStartXp) / span, 0), 1) : 0,
    xpToNextLevel: Math.max(nextLevelXp - data.total_xp, 0),
    todayXp: data.dates[toDayKey(today)] ?? 0,
    last7Xp,
    activeDays,
    avgPerActiveDay: activeDays > 0 ? Math.round(activeXp / activeDays) : 0,
    bestDay,
    trackedSince,
    currentStreak: current,
    longestStreak: longest,
    languageCount: Object.keys(data.languages).length,
    machineCount: Object.keys(data.machines).length,
  };
}

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullFormatter = new Intl.NumberFormat("en-US");

export function formatXp(xp: number): string {
  return xp >= 10_000 ? compactFormatter.format(xp) : fullFormatter.format(xp);
}

export function formatCompactXp(xp: number): string {
  return compactFormatter.format(xp);
}

export function formatFullXp(xp: number): string {
  return fullFormatter.format(xp);
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDayShort(key: string): string {
  const [, month, day] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}`;
}

export function formatDayLong(key: string): string {
  const [year, month, day] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}, ${year}`;
}

export function formatMonthShort(key: string): string {
  return MONTH_NAMES[Number(key.split("-")[1]) - 1] ?? "";
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}
