import type { ReactNode } from "react";

export function HorizontalScroller({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 max-w-full gap-4 overflow-x-auto overflow-y-hidden pb-2">{children}</div>;
}
