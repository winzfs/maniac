"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { PublicEquipmentDetail, type PublicEquipmentDetailData } from "./PublicEquipmentDetail";

const SITE_ORIGIN = "https://maniac-c7d.pages.dev";

type PublicEquipmentResponse =
  | ({ ok: true } & PublicEquipmentDetailData)
  | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; data: PublicEquipmentDetailData }
  | { status: "error"; message: string };

async function readPublicEquipment(identifier: string) {
  const response = await fetch(`/api/public/equipments/${encodeURIComponent(identifier)}`, { cache: "no-store" });
  const data = (await response.json()) as PublicEquipmentResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok === false ? data.error ?? "공개 장비를 불러오지 못했습니다." : "공개 장비를 불러오지 못했습니다.");
  }

  return {
    equipment: data.equipment,
    logs: data.logs,
    parts: data.parts,
  } satisfies PublicEquipmentDetailData;
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function textSnippet(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.length > 150 ? `${normalized.slice(0, 147)}...` : normalized;
}

function equipmentDetailHref(id: string) {
  return `/gears/${encodeURIComponent(id)}/`;
}

function equipmentCanonicalUrl(id: string) {
  return `${SITE_ORIGIN}${equipmentDetailHref(id)}`;
}

function updateEquipmentSeo(data: PublicEquipmentDetailData) {
  const { equipment, logs, parts } = data;
  const spec = [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ");
  const title = `${equipment.nickname} 장비 기록 | GearDuck`;
  const description = textSnippet(
    equipment.description,
    `${equipment.nickname}${spec ? ` (${spec})` : ""}의 정비 기록 ${logs.length}개와 부품 기록 ${parts.length}개를 GearDuck에서 확인하세요.`,
  );
  const canonical = equipmentCanonicalUrl(equipment.id);

  document.title = title;
  upsertMeta("description", description);
  upsertCanonical(canonical);
  upsertPropertyMeta("og:type", "article");
  upsertPropertyMeta("og:site_name", "GearDuck");
  upsertPropertyMeta("og:title", title);
  upsertPropertyMeta("og:description", description);
  upsertPropertyMeta("og:url", canonical);
  if (equipment.main_image_url) upsertPropertyMeta("og:image", equipment.main_image_url);
}

export function PublicEquipmentDetailClient({ identifier }: { identifier: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await readPublicEquipment(identifier);
        if (mounted) setState({ status: "ready", data });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "공개 장비를 불러오지 못했습니다." });
      }
    }

    if (!identifier) {
      setState({ status: "error", message: "장비 id가 필요합니다." });
      return;
    }

    load();
    return () => {
      mounted = false;
    };
  }, [identifier]);

  useEffect(() => {
    if (state.status === "ready") updateEquipmentSeo(state.data);
  }, [state]);

  if (state.status === "loading") {
    return (
      <main className="container-shell py-8">
        <Card className="p-6 text-sm text-text-secondary">공개 장비 정보를 불러오는 중입니다...</Card>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="container-shell py-8">
        <Card className="space-y-3 p-6">
          <h1 className="text-xl font-bold">공개 장비를 불러오지 못했습니다.</h1>
          <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
        </Card>
      </main>
    );
  }

  return <PublicEquipmentDetail {...state.data} />;
}
