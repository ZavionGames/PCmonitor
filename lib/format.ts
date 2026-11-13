/**
 * Görüntüleme biçimlendirme yardımcıları.
 */

/** Saniyeyi okunabilir formata çevirir: "3 sa 12 dk", "45 dk", "30 sn" */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || totalSeconds < 0) return "—";
  if (totalSeconds === 0) return "0 sn";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} sa`);
  if (m > 0) parts.push(`${m} dk`);
  if (s > 0 && h === 0) parts.push(`${s} sn`);
  return parts.join(" ") || "0 sn";
}

/** processName → görünen ad (uzantıyı kaldır, büyük harf yap) */
export function prettifyProcessName(name: string | null | undefined): string {
  if (!name) return "Bilinmeyen";
  return name.replace(/\.exe$/i, "");
}

/** appKey: processName küçük harf, '.' yerine '_' */
export function toAppKey(processName: string): string {
  return processName.toLowerCase().replace(/\./g, "_");
}
