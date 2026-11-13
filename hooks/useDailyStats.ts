"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";
import type { DailyStatsDoc, AppStatsDoc } from "@/types";

/** Bugünün dailyStats dokümanını okur */
export function useTodayStats(machineGuid: string | null) {
  const [stats, setStats] = useState<DailyStatsDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) { setLoading(false); return; }
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Europe/Istanbul",
    }).format(new Date());

    const db = getFirebaseDb();
    const ref = doc(db, "machines", machineGuid, "dailyStats", today);
    getDoc(ref)
      .then((snap) => {
        setStats(snap.exists() ? (snap.data() as DailyStatsDoc) : null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [machineGuid]);

  return { stats, loading };
}

/** Son N günün dailyStats dokümanlarını okur (İstatistikler sayfası) */
export function useDailyStats(machineGuid: string | null, days = 30) {
  const [data, setData] = useState<Array<{ day: string } & DailyStatsDoc>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) { setLoading(false); return; }
    const db = getFirebaseDb();
    const q = query(
      collection(db, "machines", machineGuid, "dailyStats"),
      orderBy("__name__", "desc"),
      limit(days)
    );
    getDocs(q)
      .then((snap) => {
        setData(
          snap.docs.map((d) => ({ day: d.id, ...(d.data() as DailyStatsDoc) }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [machineGuid, days]);

  return { data, loading };
}

/** appStats koleksiyonunu okur */
export function useAppStats(machineGuid: string | null) {
  const [apps, setApps] = useState<Array<{ key: string } & AppStatsDoc>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) { setLoading(false); return; }
    const db = getFirebaseDb();
    getDocs(collection(db, "machines", machineGuid, "appStats"))
      .then((snap) => {
        setApps(
          snap.docs.map((d) => ({ key: d.id, ...(d.data() as AppStatsDoc) }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [machineGuid]);

  return { apps, loading };
}

/** Son girişleri okur (logins sub-collection, son 5) */
export function useRecentLogins(machineGuid: string | null) {
  const [logins, setLogins] = useState<Array<Record<string, string>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) { setLoading(false); return; }
    const db = getFirebaseDb();
    const q = query(
      collection(db, "machines", machineGuid, "logins"),
      orderBy("startedAtUtc", "desc"),
      limit(5)
    );
    getDocs(q)
      .then((snap) => {
        setLogins(snap.docs.map((d) => d.data() as Record<string, string>));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [machineGuid]);

  return { logins, loading };
}
