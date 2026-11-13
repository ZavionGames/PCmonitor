"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart2, Monitor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useDailyStats } from "@/hooks/useDailyStats";
import { formatDuration } from "@/lib/format";

type Range = "7" | "30" | "90";

function StatisticsContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const [range, setRange] = useState<Range>("30");
  const { data, loading } = useDailyStats(deviceId, parseInt(range));

  const dailyChart = useMemo(() =>
    [...data].reverse().map(d => ({
      day: d.day.slice(5),
      "Aktif (saat)": Math.round((d.totalActiveSeconds ?? 0) / 36) / 100,
      "Uygulama": d.appLaunchCount ?? 0,
    })), [data]);

  const appTotals = useMemo(() => {
    const map: Record<string, {name:string;seconds:number;launches:number}> = {};
    for (const d of data) {
      for (const [key, app] of Object.entries(d.apps ?? {})) {
        if (!map[key]) map[key] = { name: app.displayName || key, seconds: 0, launches: 0 };
        map[key]!.seconds += app.seconds ?? 0;
        map[key]!.launches += app.launches ?? 0;
      }
    }
    return Object.values(map).sort((a,b) => b.seconds - a.seconds).slice(0, 10);
  }, [data]);

  const appChart = useMemo(() =>
    appTotals.map(a => ({ name: a.name.length > 14 ? a.name.slice(0,14)+"…" : a.name, "Süre (saat)": Math.round((a.seconds ?? 0) / 36) / 100 })),
    [appTotals]);

  if (!deviceId) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
      <Monitor size={40} className="opacity-30" /><p>Üstten bir makine seçin</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2"><BarChart2 size={20} /> İstatistikler</h1>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(["7","30","90"] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm transition ${range === r ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
              {r === "7" ? "7 Gün" : r === "30" ? "30 Gün" : "90 Gün"}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="space-y-6"><div className="skeleton h-48 w-full rounded-xl" /><div className="skeleton h-48 w-full rounded-xl" /></div>
      ) : data.length === 0 ? (
        <div className="text-center py-24 text-gray-600"><BarChart2 size={40} className="mx-auto mb-3 opacity-30" /><p>Bu dönem için veri yok</p></div>
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Günlük Aktif Süre (Saat)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" tick={{fill:"#6b7280",fontSize:11}} />
                <YAxis tick={{fill:"#6b7280",fontSize:11}} />
                <Tooltip contentStyle={{background:"#111827",border:"1px solid #374151",borderRadius:8}} labelStyle={{color:"#9ca3af"}} />
                <Line type="monotone" dataKey="Aktif (saat)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">En Çok Kullanılan Uygulamalar</h2>
            {appChart.length === 0 ? <p className="text-sm text-gray-600 py-8 text-center">Veri yok</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={appChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" tick={{fill:"#6b7280",fontSize:11}} />
                  <YAxis dataKey="name" type="category" tick={{fill:"#d1d5db",fontSize:11}} width={100} />
                  <Tooltip contentStyle={{background:"#111827",border:"1px solid #374151",borderRadius:8}} labelStyle={{color:"#9ca3af"}} />
                  <Bar dataKey="Süre (saat)" fill="#10b981" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Uygulama</th>
                <th className="text-right px-4 py-3 font-medium">Toplam Süre</th>
                <th className="text-right px-4 py-3 font-medium">Açılma</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-800">
                {appTotals.map((a,i) => (
                  <tr key={i} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 text-gray-200">{a.name}</td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{formatDuration(a.seconds)}</td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{a.launches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function StatisticsPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><StatisticsContent /></Suspense>;
}
