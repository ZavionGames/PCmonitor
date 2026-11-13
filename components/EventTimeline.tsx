"use client";

import {
  Power, PowerOff, Moon, Sun, LogIn, LogOut, Lock, Unlock,
  Play, Square, Pause, RotateCcw, AlertTriangle, Zap,
  BedDouble, Activity, ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EventDoc, EventType } from "@/types";
import { formatTs } from "@/lib/time";
import { formatDuration } from "@/lib/format";

// ── Olay tipi → görsel config ────────────────────────────────────────────────

interface EventConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bgColor: string;
}

const EVENT_CONFIG: Partial<Record<EventType, EventConfig>> = {
  agent_started:              { icon: Activity,      label: "Agent Başladı",           color: "text-blue-400",   bgColor: "bg-blue-950" },
  agent_stopped:              { icon: Activity,      label: "Agent Durdu",             color: "text-gray-400",   bgColor: "bg-gray-800" },
  system_started:             { icon: Power,         label: "Bilgisayar Açıldı",       color: "text-green-400",  bgColor: "bg-green-950" },
  system_shutdown:            { icon: PowerOff,      label: "Bilgisayar Kapatıldı",    color: "text-red-400",    bgColor: "bg-red-950" },
  system_restart:             { icon: RotateCcw,     label: "Yeniden Başlatıldı",      color: "text-orange-400", bgColor: "bg-orange-950" },
  system_unexpected_shutdown: { icon: AlertTriangle, label: "Beklenmedik Kapanış",     color: "text-red-400",    bgColor: "bg-red-950" },
  system_sleep:               { icon: Moon,          label: "Uyku Modu",               color: "text-indigo-400", bgColor: "bg-indigo-950" },
  system_resume:              { icon: Sun,           label: "Uykudan Çıkıldı",         color: "text-yellow-400", bgColor: "bg-yellow-950" },
  system_hibernate:           { icon: BedDouble,     label: "Hazırda Bekleme",         color: "text-indigo-400", bgColor: "bg-indigo-950" },
  session_logon:              { icon: LogIn,         label: "Oturum Açıldı",           color: "text-cyan-400",   bgColor: "bg-cyan-950" },
  session_logoff:             { icon: LogOut,        label: "Oturum Kapatıldı",        color: "text-cyan-400",   bgColor: "bg-cyan-950" },
  session_lock:               { icon: Lock,          label: "Ekran Kilitlendi",        color: "text-purple-400", bgColor: "bg-purple-950" },
  session_unlock:             { icon: Unlock,        label: "Kilit Açıldı",            color: "text-purple-400", bgColor: "bg-purple-950" },
  process_started:            { icon: Play,          label: "Uygulama Açıldı",         color: "text-emerald-400",bgColor: "bg-emerald-950" },
  process_stopped:            { icon: Square,        label: "Uygulama Kapatıldı",      color: "text-gray-400",   bgColor: "bg-gray-800" },
  tracking_paused:            { icon: Pause,         label: "Takip Duraklatıldı",      color: "text-yellow-400", bgColor: "bg-yellow-950" },
  tracking_resumed:           { icon: Zap,           label: "Takip Devam Ediyor",      color: "text-yellow-400", bgColor: "bg-yellow-950" },
};

function getConfig(type: EventType): EventConfig {
  return EVENT_CONFIG[type] ?? {
    icon: Activity,
    label: type,
    color: "text-gray-400",
    bgColor: "bg-gray-800",
  };
}

// ── Grup (gün) başlığı ───────────────────────────────────────────────────────

function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === "string") { const d = new Date(ts); return isNaN(d.getTime()) ? null : d; }
  if (typeof ts === "object" && "toDate" in ts && typeof (ts as {toDate:unknown}).toDate === "function") {
    return (ts as {toDate(): Date}).toDate();
  }
  return null;
}

function dayLabel(ts: unknown): string {
  const d = toDate(ts);
  if (!d) return "Bilinmiyor";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Bugün";
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

// ── Tek olay satırı ──────────────────────────────────────────────────────────

function EventRow({ event }: { event: EventDoc }) {
  const cfg = getConfig(event.eventType);
  const Icon = cfg.icon;
  const isProcess = event.eventType === "process_started" || event.eventType === "process_stopped";
  const isInferred = Boolean(event.flags?.inferred);
  const isInitial = Boolean(event.flags?.initial);

  return (
    <div className="flex gap-3 py-2.5 group">
      {/* İkon */}
      <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bgColor} shrink-0`}>
        <Icon size={14} className={cfg.color} />
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-gray-200 font-medium">
            {isProcess && event.displayName
              ? event.displayName
              : cfg.label}
          </span>
          {isProcess && (
            <span className="text-xs text-gray-500">
              {event.eventType === "process_stopped"
                ? event.processName
                : event.processName}
            </span>
          )}
          {event.eventType === "process_stopped" && event.durationSeconds != null && (
            <span className="text-xs text-gray-500">({formatDuration(event.durationSeconds)})</span>
          )}
          {isInferred && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-900">
              tahmini
            </span>
          )}
          {isInitial && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-900">
              başlangıç
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">
          {formatTs(event.occurredAt)}
        </p>
      </div>
    </div>
  );
}

// ── Ana bileşen ──────────────────────────────────────────────────────────────

interface EventTimelineProps {
  events: EventDoc[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  filter?: "all" | "system" | "process" | "windows";
}

export function EventTimeline({
  events,
  hasMore,
  loadingMore,
  onLoadMore,
  filter = "all",
}: EventTimelineProps) {
  const filtered = filter === "all"
    ? events
    : filter === "system"
    ? events.filter((e) => !["process_started", "process_stopped"].includes(e.eventType))
    : filter === "windows"
    ? events.filter((e) => ["process_started", "process_stopped"].includes(e.eventType) && (e as EventDoc & {category?: string}).category === "windows")
    : events.filter((e) => ["process_started", "process_stopped"].includes(e.eventType) && (e as EventDoc & {category?: string}).category !== "windows");

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <Activity size={32} className="mx-auto mb-3 opacity-30" />
        <p>Henüz olay yok</p>
      </div>
    );
  }

  // Güne göre grupla
  const groups: { day: string; events: EventDoc[] }[] = [];
  let currentDay = "";
  for (const e of filtered) {
    const d = dayLabel(e.occurredAt);
    if (d !== currentDay) {
      groups.push({ day: d, events: [e] });
      currentDay = d;
    } else {
      groups[groups.length - 1]!.events.push(e);
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.day}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            {g.day}
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
            {g.events.map((e) => (
              <div key={e.eventId} className="px-4">
                <EventRow event={e} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-gray-200 transition"
        >
          <ChevronDown size={16} />
          {loadingMore ? "Yükleniyor…" : "Daha Fazla Yükle"}
        </button>
      )}
    </div>
  );
}
