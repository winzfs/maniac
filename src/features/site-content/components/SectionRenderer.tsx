import type { SiteSectionData, SiteSectionType } from "../types";
export function SectionRenderer({ type, data }: { type: SiteSectionType; data: SiteSectionData }) {
  if (!data.isVisible) return null;
  return <section data-section={type}><h3 className="text-lg font-semibold">{data.title}</h3>{data.body ? <p className="text-sm text-text-secondary">{data.body}</p> : null}</section>;
}
