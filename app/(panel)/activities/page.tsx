"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, Monitor } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventTimeline } from "@/components/EventTimeline";

type Filter = "all" | "system" | "process" | "windows";

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const [filter, setFilter] = useState<Filter>("all");
  const { events, loading, loadingMore, hasMore, loadMore, error } = useEvents(deviceId);

  if (!deviceId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
        <Monitor size={40} className="opacity-30" />
        <p>Üstten bir makine seçin</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2"><Activity size={20} /> Canlı Aktiviteler</h1>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(["all", "system", "process", "windows"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {f === "all" ? "Tümü" : f === "system" ? "Sistem" : f === "process" ? "Uygulamalar" : "Windows"}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2"><div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-28" /></div>
            </div>
          ))}
        </div>
      ) : (
        <EventTimeline events={events} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} filter={filter} />
      )}
    </div>
  );
}

export default function ActivitiesPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><ActivitiesContent /></Suspense>;
}
