import { cn } from "@/shared/lib/cn";
import type { InputHTMLAttributes } from "react";

export function SearchBar({ className, placeholder = "장비, 부품, 정비 기록 검색", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-4", className)}>
      <span aria-hidden="true" className="text-text-secondary">⌕</span>
      <input className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary" placeholder={placeholder} {...props} />
    </label>
  );
}
