"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppWindow, Search, ArrowUpDown, Monitor } from "lucide-react";
import { useAppStats } from "@/hooks/useDailyStats";
import { formatTs } from "@/lib/time";
import { formatDuration } from "@/lib/format";
import type { FirestoreTime } from "@/types";

type SortKey = "totalSeconds" | "launchCount" | "lastStartedAt";

function toFirestoreDate(ts: FirestoreTime): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts === "string") { const d = new Date(ts); return isNaN(d.getTime()) ? null : d; }
  if (typeof ts === "object" && "toDate" in ts) return ts.toDate();
  return null;
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const { apps, loading } = useAppStats(deviceId);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalSeconds");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return apps
      .filter(a => a.processName.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortKey === "totalSeconds") return (b.totalSeconds ?? 0) - (a.totalSeconds ?? 0);
        if (sortKey === "launchCount") return (b.launchCount ?? 0) - (a.launchCount ?? 0);
        return (toFirestoreDate(b.lastStartedAt)?.getTime() ?? 0) - (toFirestoreDate(a.lastStartedAt)?.getTime() ?? 0);
      });
  }, [apps, search, sortKey]);

  if (!deviceId) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
      <Monitor size={40} className="opacity-30" /><p>Üstten bir makine seçin</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2"><AppWindow size={20} /> Uygulamalar</h1>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Uygulama ara…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-700" />
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(["totalSeconds","launchCount","lastStartedAt"] as SortKey[]).map(k => (
            <button key={k} onClick={() => setSortKey(k)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition ${sortKey === k ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              <ArrowUpDown size={12} />
              {k === "totalSeconds" ? "Süre" : k === "launchCount" ? "Açılma" : "Son Açılma"}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-4 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600"><AppWindow size={32} className="mx-auto mb-3 opacity-30" /><p>{search ? "Sonuç bulunamadı" : "Henüz kayıt yok"}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Uygulama</th>
                <th className="text-right px-4 py-3 font-medium">Toplam Süre</th>
                <th className="text-right px-4 py-3 font-medium">Açılma</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Son Açılma</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(app => (
                  <tr key={app.key} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3"><div className="font-medium text-gray-200">{app.displayName || app.processName}</div><div className="text-xs text-gray-600">{app.processName}</div></td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{formatDuration(app.totalSeconds)}</td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{app.launchCount ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{app.lastStartedAt ? formatTs(app.lastStartedAt) : "—"}</td>
                    <td className="px-4 py-3">{app.isRunning && <span className="flex items-center gap-1 text-xs text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Açık</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><ApplicationsContent /></Suspense>;
}
