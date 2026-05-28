import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export function SectionHeader({ title, description, action, className, ...props }: HTMLAttributes<HTMLDivElement> & { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)} {...props}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>
        {description ? <p className="text-sm leading-6 text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
