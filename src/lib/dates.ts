import { addDays as dfAddDays, differenceInCalendarDays, format } from "date-fns";
import type { ISODate } from "@/types";

/** Parse "yyyy-MM-dd" as a local calendar date (never UTC-shifted). */
export function parseISODate(iso: ISODate): Date {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  return toISODate(dfAddDays(parseISODate(iso), days));
}

export function diffDays(later: ISODate, earlier: ISODate): number {
  return differenceInCalendarDays(parseISODate(later), parseISODate(earlier));
}

/**
 * Half-open interval overlap: [aStart, aEnd) and [bStart, bEnd).
 * A stay ending on the 12th does not overlap one starting on the 12th.
 */
export function rangesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
