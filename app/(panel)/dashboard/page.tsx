"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, User, Monitor, LogIn, Cpu, Activity } from "lucide-react";
import { useMachines } from "@/hooks/useMachines";
import { useRecentLogins } from "@/hooks/useDailyStats";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard, StatCardSkeleton } from "@/components/StatCard";
import { formatIso } from "@/lib/time";

function DashboardContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const { machines } = useMachines();
  const machine = machines.find((m) => m.id === deviceId);
  const { logins, loading: loginsLoading } = useRecentLogins(deviceId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!deviceId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
        <Monitor size={40} className="opacity-30" />
        <p>Üstten bir makine seçin</p>
      </div>
    );
  }

  const displayName = machine?.label || machine?.computerName || deviceId.slice(0, 8);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-gray-500">{machine?.computerName} · {machine?.username}</p>
        </div>
        <StatusBadge lastSeenUtc={machine?.lastSeenUtc} key={tick} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {!machine ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Clock} label="Son Başlatma" value={formatIso(machine.lastSeenUtc)} color="blue" />
            <StatCard icon={Cpu} label="Kullanıcı" value={machine.username ?? "—"} color="gray" />
            <StatCard icon={Monitor} label="Bilgisayar" value={machine.computerName ?? "—"} color="gray" />
            <StatCard icon={Activity} label="Etiket" value={machine.label || "—"} color="yellow" />
          </>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <LogIn size={14} /> Son Girişler
        </h2>
        {loginsLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-4 w-full" />)}</div>
        ) : logins.length === 0 ? (
          <p className="text-sm text-gray-600">Giriş kaydı yok. Agent çalıştığında burada görünür.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {logins.map((l, i) => (
              <div key={i} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <User size={12} className="text-gray-500" /> {l.username}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Monitor size={12} /> {l.computerName}
                </span>
                <span className="text-gray-600 text-xs ml-auto">{formatIso(l.startedAtUtc)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-500 space-y-2">
        <p className="font-semibold text-gray-400">Nasıl çalışır?</p>
        <p>• Agent her PC&apos;de başladığında Firestore&apos;a makine bilgisini ve giriş kaydını yazar.</p>
        <p>• Panel bu veriyi doğrudan Firestore&apos;dan okur.</p>
        <p>• Durum, son başlatma zamanına göre hesaplanır (son 5 dk içindeyse çevrimiçi).</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><DashboardContent /></Suspense>;
}
