import { cn } from "@/shared/lib/cn";
import type { InputHTMLAttributes } from "react";
export function SearchBar({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input aria-label="검색" placeholder="장비, 부품, 정비 기록 검색" className={cn("w-full rounded-full border border-border bg-surface px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garage-orange", className)} {...props} />;
}
