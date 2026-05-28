import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";
export function HorizontalScroller({ children, className }: { children: ReactNode; className?: string }) { return <div role="region" aria-label="horizontal scroller" className={cn("flex gap-4 overflow-x-auto pb-2", className)}>{children}</div>; }
