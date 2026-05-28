import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
export function SectionHeader({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex items-end justify-between gap-3", className)}><div className="space-y-1"><h2 className="text-xl font-bold">{title}</h2>{description ? <p className="text-sm text-text-secondary">{description}</p> : null}</div>{action}</div>;
}
