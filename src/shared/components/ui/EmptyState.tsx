import { Card } from "./Card";
export function EmptyState({ title, description }: { title: string; description: string }) { return <Card><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-text-secondary">{description}</p></Card>; }
