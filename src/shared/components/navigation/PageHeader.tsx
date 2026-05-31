import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { MenuButton } from "./MenuButton";

export function PageHeader({
  breadcrumbs,
  menuLabel = "메뉴",
  title,
  description,
  action,
}: {
  breadcrumbs?: BreadcrumbItem[];
  menuLabel?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="space-y-2.5 sm:space-y-4">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">{action}</div>
          <MenuButton label={menuLabel} />
        </div>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      </div>
      {title || description ? (
        <div className="space-y-1.5 pt-0.5 sm:space-y-3 sm:pt-1">
          {title ? <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">{title}</h1> : null}
          {description ? <p className="max-w-2xl text-xs leading-5 text-text-secondary sm:text-base sm:leading-7">{description}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
