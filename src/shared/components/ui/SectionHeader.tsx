export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return <div className="mb-4 space-y-1"><h2 className="text-xl font-bold">{title}</h2>{description ? <p className="text-sm text-text-secondary">{description}</p> : null}</div>;
}
