"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Monitor } from "lucide-react";
import type { MachineEntry } from "@/hooks/useMachines";
import { StatusBadge } from "./StatusBadge";

interface MachineSelectorProps {
  machines: MachineEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function displayName(m: MachineEntry): string {
  return m.label || m.computerName || m.machineGuid.slice(0, 8);
}

export function MachineSelector({ machines, selectedId, onSelect }: MachineSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = machines.find((m) => m.id === selectedId);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition min-w-[160px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Monitor size={14} className="text-gray-400 shrink-0" />
        <span className="flex-1 text-left truncate">
          {selected ? displayName(selected) : "Makine Seç"}
        </span>
        {selected && <StatusBadge lastSeenUtc={selected.lastSeenUtc} dotOnly />}
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {machines.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Henüz makine yok</div>
          ) : (
            <ul role="listbox" className="py-1">
              {machines.map((m) => (
                <li key={m.id}>
                  <button
                    role="option"
                    aria-selected={m.id === selectedId}
                    onClick={() => { onSelect(m.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-800 transition text-left
                      ${m.id === selectedId ? "bg-gray-800 text-white" : "text-gray-300"}`}
                  >
                    <StatusBadge lastSeenUtc={m.lastSeenUtc} dotOnly />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{displayName(m)}</div>
                      <div className="text-xs text-gray-500 truncate">{m.computerName}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
