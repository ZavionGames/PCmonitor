"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: { id: number; type: ToastType; message: string }[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm
            ${t.type === "success"
              ? "bg-green-950 border-green-800 text-green-200"
              : "bg-red-950 border-red-800 text-red-200"}`}
        >
          {t.type === "success"
            ? <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-400" />
            : <XCircle size={16} className="shrink-0 mt-0.5 text-red-400" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Kapat">
            <X size={14} className="text-gray-400 hover:text-gray-200" />
          </button>
        </div>
      ))}
    </div>
  );
}
