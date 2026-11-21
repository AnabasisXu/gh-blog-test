const DEFAULT_TIMEZONE = "Asia/Shanghai";

/** Formats a date as YYYY-MM-DD in the given timezone (en-CA yields that order). */
export function formatDateISO(date: Date, timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
