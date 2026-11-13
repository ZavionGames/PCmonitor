"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, setDoc, increment } from "firebase/firestore";
import { Settings as SettingsIcon, Monitor, Plus, X, Save } from "lucide-react";
import { getFirebaseDb } from "@/lib/firebaseClient";
import { useMachineSettings } from "@/hooks/useMachineState";
import { useToast, ToastContainer } from "@/components/Toast";

function SettingsContent() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("device");
  const { settings, loading } = useMachineSettings(deviceId);
  const { toasts, show, dismiss } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [trackSystem, setTrackSystem] = useState(true);
  const [heartbeat, setHeartbeat] = useState(300);
  const [tracked, setTracked] = useState<string[]>([]);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [trackedInput, setTrackedInput] = useState("");
  const [ignoredInput, setIgnoredInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName ?? "");
      setTrackSystem(settings.trackSystemEvents ?? true);
      setHeartbeat(settings.heartbeatIntervalSeconds ?? 300);
      setTracked(settings.trackedApps ?? []);
      setIgnored(settings.ignoredApps ?? []);
    }
  }, [settings]);

  async function handleSave() {
    if (!deviceId) return;
    setSaving(true);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, "machines", deviceId, "settings", "current"), {
        displayName: displayName || null, trackSystemEvents: trackSystem,
        heartbeatIntervalSeconds: heartbeat, trackedApps: tracked,
        ignoredApps: ignored, configVersion: increment(1),
      }, { merge: true });
      show("Ayarlar kaydedildi", "success");
    } catch { show("Kayıt başarısız", "error"); }
    finally { setSaving(false); }
  }

  function addTag(list: string[], setList: (v:string[])=>void, input: string, setInput: (v:string)=>void) {
    const val = input.trim();
    if (val && !list.includes(val)) setList([...list, val]);
    setInput("");
  }

  if (!deviceId) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
      <Monitor size={40} className="opacity-30" /><p>Üstten bir makine seçin</p>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2"><SettingsIcon size={20} /> Ayarlar</h1>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}</div>
      ) : (
        <>
          <Section title="Makine Adı">
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Görünen ad (boşsa label veya computerName kullanılır)" maxLength={64}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-700" />
          </Section>
          <Section title="Takip Ayarları">
            <label className="flex items-center gap-3 cursor-pointer">
              <div role="switch" aria-checked={trackSystem} onClick={() => setTrackSystem(!trackSystem)}
                className={`relative w-10 h-5 rounded-full transition ${trackSystem ? "bg-blue-600" : "bg-gray-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${trackSystem ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-gray-300">Sistem olaylarını takip et</span>
            </label>
            <div className="mt-4">
              <label className="text-xs text-gray-500 mb-1 block">Heartbeat aralığı: {heartbeat} sn</label>
              <input type="range" min={60} max={3600} step={60} value={heartbeat} onChange={e => setHeartbeat(parseInt(e.target.value))} className="w-full" />
            </div>
          </Section>
          <Section title="İzlenecek Uygulamalar (boşsa tümü)">
            <TagInput tags={tracked} input={trackedInput} onInputChange={setTrackedInput}
              onAdd={() => addTag(tracked, setTracked, trackedInput, setTrackedInput)}
              onRemove={t => setTracked(tracked.filter(i => i !== t))} placeholder="chrome.exe" />
          </Section>
          <Section title="Hariç Tutulacak Uygulamalar">
            <TagInput tags={ignored} input={ignoredInput} onInputChange={setIgnoredInput}
              onAdd={() => addTag(ignored, setIgnored, ignoredInput, setIgnoredInput)}
              onRemove={t => setIgnored(ignored.filter(i => i !== t))} placeholder="notepad.exe" />
          </Section>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
            <Save size={15} />{saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </>
      )}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3"><h2 className="text-sm font-semibold text-gray-300">{title}</h2>{children}</div>;
}

function TagInput({ tags, input, onInputChange, onAdd, onRemove, placeholder }:
  { tags:string[]; input:string; onInputChange:(v:string)=>void; onAdd:()=>void; onRemove:(t:string)=>void; placeholder:string }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-300">
            {t}<button onClick={() => onRemove(t)} aria-label={`${t} kaldır`} className="hover:text-red-400"><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => onInputChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onAdd()}
          placeholder={placeholder} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-700" />
        <button onClick={onAdd} className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition" aria-label="Ekle"><Plus size={15} /></button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <Suspense fallback={<div className="p-8 text-gray-500">Yükleniyor…</div>}><SettingsContent /></Suspense>;
}
