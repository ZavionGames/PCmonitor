"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, orderBy, limit, startAfter, where, getDocs, type QueryDocumentSnapshot, type DocumentData } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";
import { History, Monitor } from "lucide-react";
import type { EventDoc } from "@/types";
import { SYSTEM_EVENT_TYPES } from "@/types";
import { EventTimeline } from "@/components/EventTimeline";

const PAGE_SIZE = 50;

function HistoryContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchPage = useCallback(async (after: QueryDocumentSnapshot<DocumentData> | null) => {
    if (!deviceId) return;
    after ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const db = getFirebaseDb();
      const types = SYSTEM_EVENT_TYPES.slice(0, 30) as string[];
      const q = query(
        collection(db, "machines", deviceId, "events"),
        where("eventType", "in", types),
        orderBy("occurredAt", "desc"),
        limit(PAGE_SIZE),
        ...(after ? [startAfter(after)] : [])
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as EventDoc);
      after ? setEvents(prev => [...prev, ...docs]) : setEvents(docs);
      setHasMore(snap.docs.length === PAGE_SIZE);
      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
    } catch (e: unknown) {
      setError((e as {code?:string})?.code === "resource-exhausted" ? "Firestore okuma kotası doldu." : "Sistem geçmişi yüklenemedi.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [deviceId]);

  useEffect(() => { setEvents([]); lastDocRef.current = null; fetchPage(null); }, [fetchPage]);

  if (!deviceId) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
      <Monitor size={40} className="opacity-30" /><p>Üstten bir makine seçin</p>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2"><History size={20} /> Sistem Geçmişi</h1>
      {error && <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({length:8}).map((_,i) => <div key={i} className="flex gap-3"><div className="skeleton h-8 w-8 rounded-lg" /><div className="flex-1 space-y-2"><div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-28" /></div></div>)}</div>
      ) : (
        <EventTimeline events={events} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={() => fetchPage(lastDocRef.current)} filter="system" />
      )}
    </div>
  );
}

export default function HistoryPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><HistoryContent /></Suspense>;
}
