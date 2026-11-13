"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";
import type { EventDoc } from "@/types";

const PAGE_SIZE = 50;

/**
 * Son 50 olayı canlı dinler; "daha fazla" ile cursor-based sayfalama.
 */
export function useEvents(machineGuid: string | null) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    if (!machineGuid) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const q = query(
      collection(db, "machines", machineGuid, "events"),
      orderBy("occurredAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as EventDoc);
        setEvents(docs);
        setHasMore(snap.docs.length === PAGE_SIZE);
        lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useEvents error:", err);
        if (err.code === "resource-exhausted") {
          setError("Firestore okuma kotası doldu.");
        } else {
          setError("Olaylar yüklenemedi.");
        }
        setLoading(false);
      }
    );

    return () => {
      unsub();
      setEvents([]);
      setLoading(true);
      lastDocRef.current = null;
    };
  }, [machineGuid]);

  const loadMore = useCallback(async () => {
    if (!machineGuid || !lastDocRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, "machines", machineGuid, "events"),
        orderBy("occurredAt", "desc"),
        startAfter(lastDocRef.current),
        limit(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const more = snap.docs.map((d) => d.data() as EventDoc);
      setEvents((prev) => [...prev, ...more]);
      setHasMore(snap.docs.length === PAGE_SIZE);
      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [machineGuid, loadingMore]);

  return { events, loading, loadingMore, hasMore, loadMore, error };
}
