export type SiteSectionType = "hero" | "featured_garage" | "maintenance_preview" | "popular_categories" | "cta";
export type SiteSectionData = { title: string; body?: string; image?: string; cta?: { label: string; href: string }; sortOrder: number; isVisible: boolean; };
export type Banner = { title: string; description?: string; imageUrl?: string; ctaLabel?: string; linkUrl?: string; sortOrder: number; isVisible: boolean; };
export type Notice = { title: string; body: string; status: "draft" | "scheduled" | "published" | "archived" };
export type FAQItem = { question: string; answer: string; sortOrder: number; isPublished: boolean };
