"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";
import type { MachineDoc } from "@/types";

export interface MachineEntry extends MachineDoc {
  id: string;
}

/**
 * machines koleksiyonunu canlı dinler.
 * Her makine: { id, machineGuid, computerName, username, label, lastSeenUtc }
 */
export function useMachines() {
  const [machines, setMachines] = useState<MachineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const col = collection(db, "machines");

    const unsub = onSnapshot(
      col,
      (snap: QuerySnapshot<DocumentData>) => {
        const list: MachineEntry[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as MachineDoc),
        }));
        setMachines(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useMachines error:", err);
        if (err.code === "resource-exhausted") {
          setError("Firestore okuma kotası doldu. Lütfen daha sonra tekrar deneyin.");
        } else if (err.code === "permission-denied") {
          setError("Bu verilere erişim izniniz yok.");
        } else {
          setError("Makine listesi yüklenemedi.");
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { machines, loading, error };
}
