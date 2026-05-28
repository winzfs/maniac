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
    <header className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          {action}
          <MenuButton label={menuLabel} />
        </div>
      </div>
      {title || description ? (
        <div className="space-y-3">
          {title ? <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1> : null}
          {description ? <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{description}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
