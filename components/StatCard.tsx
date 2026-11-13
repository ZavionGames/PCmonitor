import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}

const COLOR_MAP = {
  blue:   "bg-blue-950 text-blue-400 border-blue-900",
  green:  "bg-green-950 text-green-400 border-green-900",
  yellow: "bg-yellow-950 text-yellow-400 border-yellow-900",
  red:    "bg-red-950 text-red-400 border-red-900",
  gray:   "bg-gray-900 text-gray-400 border-gray-800",
};

const ICON_COLOR = {
  blue:   "text-blue-400",
  green:  "text-green-400",
  yellow: "text-yellow-400",
  red:    "text-red-400",
  gray:   "text-gray-400",
};

export function StatCard({ icon: Icon, label, value, sub, color = "gray" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${COLOR_MAP[color]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-gray-800 ${ICON_COLOR[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 p-4 space-y-2">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-7 w-16" />
      <div className="skeleton h-3 w-28" />
    </div>
  );
}
