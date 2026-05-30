import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [];
}

export default async function PublicEquipmentSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/garage/view/?slug=${encodeURIComponent(slug)}`);
}
