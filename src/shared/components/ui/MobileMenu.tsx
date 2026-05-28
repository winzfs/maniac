import { cn } from "@/shared/lib/cn";
export function MobileMenu({ items, className }: { items?: string[]; className?: string }) {
  const menu = items ?? ["홈", "장비 둘러보기", "인기 장비", "정비 기록 예시", "내 차고"];
  return <nav aria-label="모바일 메뉴" className={cn("rounded-card border border-border bg-surface p-4", className)}><ul className="space-y-3 text-sm">{menu.map((item) => <li key={item}>{item}</li>)}</ul></nav>;
}
