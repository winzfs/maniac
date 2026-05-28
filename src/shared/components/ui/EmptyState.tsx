import type { ReactNode } from "react";
import { Card } from "./Card";
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card className="text-center"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-text-secondary">{description}</p>{action ? <div className="mt-4">{action}</div> : null}</Card>;
}
