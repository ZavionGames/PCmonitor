"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";
import type { MachineState, MachineSettings } from "@/types";

/** state/current dokümanını canlı dinler */
export function useMachineState(machineGuid: string | null) {
  const [state, setState] = useState<MachineState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) {
      setState(null);
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    const ref = doc(db, "machines", machineGuid, "state", "current");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setState(snap.exists() ? (snap.data() as MachineState) : null);
        setLoading(false);
      },
      (err) => {
        console.error("useMachineState error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [machineGuid]);

  return { state, loading };
}

/** settings/current dokümanını tek seferlik okur */
export function useMachineSettings(machineGuid: string | null) {
  const [settings, setSettings] = useState<MachineSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineGuid) {
      setSettings(null);
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    const ref = doc(db, "machines", machineGuid, "settings", "current");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setSettings(snap.exists() ? (snap.data() as MachineSettings) : null);
        setLoading(false);
      },
      (err) => {
        console.error("useMachineSettings error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [machineGuid]);

  return { settings, loading };
}
