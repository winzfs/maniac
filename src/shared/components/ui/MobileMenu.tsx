import { equipmentCategories } from "@/shared/data/equipment-categories";
import Link from "next/link";

export function MobileMenu() {
  return (
    <nav className="rounded-card border border-border bg-surface p-4 text-sm">
      <div className="grid gap-3">
        <Link href="/" className="font-semibold">홈</Link>
        <Link href="/explore/" className="font-semibold">장비 둘러보기</Link>
        <div className="grid gap-2 rounded-2xl bg-background p-3">
          {equipmentCategories.map((category) => (
            <Link key={category.slug} href={`/explore/${category.slug}/`} className="flex items-center justify-between gap-3 text-text-secondary">
              <span>{category.label}</span>
              <span className="text-xs">{category.boards.length}</span>
            </Link>
          ))}
        </div>
        <Link href="/garage/" className="font-semibold">내 차고</Link>
      </div>
    </nav>
  );
}
