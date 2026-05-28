import type { ReactNode } from "react";
export function HorizontalScroller({ children }: { children: ReactNode }) { return <div className="flex gap-4 overflow-x-auto pb-2">{children}</div>; }
