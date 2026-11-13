"use client";

import { useMemo } from "react";

type OnlineStatus = "online" | "offline" | "unknown";

interface StatusBadgeProps {
  /** machines/{id}/state/current dokümanındaki status ("running"|"paused"|"offline") */
  stateStatus?: string | null;
  /** machines/{id}.lastSeenUtc — fallback */
  lastSeenUtc?: string | null;
  dotOnly?: boolean;
}

/**
 * Online/offline durumu hesaplar:
 * 1. stateStatus === "offline"  → Çevrimdışı
 * 2. stateStatus === "running" | "paused" ve son 15 dk içinde → Çevrimiçi
 * 3. Fallback: lastSeenUtc son 10 dk içindeyse Çevrimiçi
 */
export function StatusBadge({ stateStatus, lastSeenUtc, dotOnly = false }: StatusBadgeProps) {
  const status = useMemo((): OnlineStatus => {
    if (stateStatus === "offline") return "offline";
    if (stateStatus === "running" || stateStatus === "paused") {
      return "online";
    }
    if (lastSeenUtc) {
      const diff = Date.now() - new Date(lastSeenUtc).getTime();
      if (diff < 10 * 60 * 1000) return "online";
      return "offline";
    }
    return "unknown";
  }, [stateStatus, lastSeenUtc]);

  const cfg = {
    online:  { dot: "bg-green-400",  label: "Çevrimiçi",   badge: "bg-green-950 text-green-300 border-green-800" },
    offline: { dot: "bg-gray-500",   label: "Çevrimdışı",  badge: "bg-gray-900 text-gray-400 border-gray-700" },
    unknown: { dot: "bg-gray-600",   label: "Bilinmiyor",  badge: "bg-gray-900 text-gray-500 border-gray-800" },
  }[status];

  if (dotOnly) {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${cfg.dot} ${status === "online" ? "animate-pulse" : ""}`}
        title={cfg.label}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "online" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}
