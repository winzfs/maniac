import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeTone = "lime" | "orange" | "graphite" | "muted";

const toneClass: Record<BadgeTone, string> = {
  lime: "bg-garage-lime text-graphite",
  orange: "bg-garage-orange text-white",
  graphite: "bg-graphite text-white",
  muted: "bg-background text-text-secondary",
};

export function Badge({ label, tone = "lime", className, ...props }: HTMLAttributes<HTMLSpanElement> & { label: string; tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", toneClass[tone], className)} {...props}>{label}</span>;
}
