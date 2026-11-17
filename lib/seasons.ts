export type Season = "tet" | "trungthu" | "noel";

export const SEASONS: Season[] = ["tet", "trungthu", "noel"];

// Lunar dates, solar calendar (Vietnam). Extend these lists when they run out.
const TET = ["2026-02-17", "2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03", "2031-01-23"];
const TRUNG_THU = ["2026-09-25", "2027-09-15", "2028-10-03", "2029-09-22", "2030-09-12", "2031-10-01"];

const DAY = 86_400_000;
const daysFrom = (iso: string, d: Date) => {
  const [y, m, day] = iso.split("-").map(Number);
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((today - Date.UTC(y, m - 1, day)) / DAY);
};

/**
 * Which festival, if any, the page celebrates on this date (the visitor's local date):
 * Tết from a week before to the 10th day; Trung thu (Mid-Autumn) from a week before to two days
 * after; Christmas from 20 to 26 December.
 */
export function seasonFor(d: Date): Season | null {
  if (TET.some((t) => {
    const n = daysFrom(t, d);
    return n >= -7 && n <= 9;
  }))
    return "tet";
  if (TRUNG_THU.some((t) => {
    const n = daysFrom(t, d);
    return n >= -7 && n <= 2;
  }))
    return "trungthu";
  if (d.getMonth() === 11 && d.getDate() >= 20 && d.getDate() <= 26) return "noel";
  return null;
}
