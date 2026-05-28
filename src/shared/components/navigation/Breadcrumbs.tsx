import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-1 text-xs text-text-secondary">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true" className="text-border">›</span> : null}
            {item.href && !isLast ? (
              <Link href={item.href} className="rounded-full px-1.5 py-1 transition hover:bg-background hover:text-text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="px-1.5 py-1 font-medium text-text-primary">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
