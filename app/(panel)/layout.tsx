"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Activity, AppWindow, History, BarChart2, Settings, Monitor, Menu, X } from "lucide-react";
import { useMachines } from "@/hooks/useMachines";
import { MachineSelector } from "@/components/MachineSelector";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",         icon: LayoutDashboard },
  { href: "/activities",   label: "Canlı Aktiviteler", icon: Activity },
  { href: "/applications", label: "Uygulamalar",       icon: AppWindow },
  { href: "/history",      label: "Sistem Geçmişi",    icon: History },
  { href: "/statistics",   label: "İstatistikler",     icon: BarChart2 },
  { href: "/settings",     label: "Ayarlar",           icon: Settings },
];

function PanelInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { machines } = useMachines();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const deviceParam = searchParams.get("device");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem("pcm_selected_device"); } catch { return null; }
  });

  useEffect(() => {
    if (deviceParam) {
      setSelectedId(deviceParam);
      try { localStorage.setItem("pcm_selected_device", deviceParam); } catch {}
    }
  }, [deviceParam]);

  useEffect(() => {
    if (machines.length === 0) return;
    if (selectedId && machines.find(m => m.id === selectedId)) return;
    const first = machines[0]!.id;
    setSelectedId(first);
    try { localStorage.setItem("pcm_selected_device", first); } catch {}
  }, [machines, selectedId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    try { localStorage.setItem("pcm_selected_device", id); } catch {}
    const params = new URLSearchParams(searchParams.toString());
    params.set("device", id);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} selectedId={selectedId} onClose={() => {}} />
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent pathname={pathname} selectedId={selectedId} onClose={() => setSidebarOpen(false)} />
      </aside>
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 transition" onClick={() => setSidebarOpen(true)} aria-label="Menüyü aç">
            <Menu size={18} />
          </button>
          <MachineSelector machines={machines} selectedId={selectedId} onSelect={handleSelect} />
          {machines.length === 0 && <p className="text-sm text-gray-500 hidden sm:block">Henüz makine yok — Agent&apos;ı bir PC&apos;de çalıştırın</p>}
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, selectedId, onClose }: { pathname:string; selectedId:string|null; onClose:()=>void }) {
  return (
    <>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg"><Monitor size={16} className="text-white" /></div>
          <span className="font-semibold text-sm">PCMonitor</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded lg:hidden" aria-label="Kapat"><X size={16} /></button>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5" aria-label="Ana menü">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const full = selectedId ? `${href}?device=${selectedId}` : href;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={full} onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-blue-600/20 text-blue-300" : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"}`}>
              <Icon size={16} />{label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <PanelInner>{children}</PanelInner>
    </Suspense>
  );
}
