import { cn } from "@/shared/lib/cn";
export function Badge({ label, tone = "lime", className }: { label: string; tone?: "lime" | "graphite"; className?: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone === "lime" ? "bg-garage-lime text-graphite" : "bg-graphite text-white", className)}>{label}</span>;
}
