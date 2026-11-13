/**
 * Zaman yardımcıları.
 * APP_TIMEZONE: günlük istatistik gün sınırlarını belirler.
 */

const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Europe/Istanbul";

/** UTC ISO string'i APP_TIMEZONE'a göre yyyy-MM-dd'ye çevirir */
export function utcToDayKey(utcIso: string): string {
  const date = new Date(utcIso);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // "2026-11-13"
}

/** Bugünün APP_TIMEZONE'a göre yyyy-MM-dd anahtarı */
export function todayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** UTC now ISO string */
export function utcNow(): string {
  return new Date().toISOString();
}

/** Timestamp'i tarayıcı yerel saatine çevirir: dd.MM.yyyy HH:mm:ss */
export function formatTs(ts: { toDate(): Date } | Date | string | null | undefined): string {
  if (!ts) return "—";
  let date: Date;
  if (typeof ts === "string") {
    date = new Date(ts);
  } else if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === "object" && "toDate" in ts && typeof ts.toDate === "function") {
    date = ts.toDate();
  } else {
    return "—";
  }
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: APP_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/** ISO string'i yerel saate çevirir */
export function formatIso(iso: string | null | undefined): string {
  if (!iso) return "—";
  return formatTs(new Date(iso));
}
