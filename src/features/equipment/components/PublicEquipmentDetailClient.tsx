"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/Card";
import { PublicEquipmentDetail, type PublicEquipmentDetailData } from "./PublicEquipmentDetail";

type PublicEquipmentResponse =
  | ({ ok: true } & PublicEquipmentDetailData)
  | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; data: PublicEquipmentDetailData }
  | { status: "error"; message: string };

async function readPublicEquipment(slug: string) {
  const response = await fetch(`/api/public/equipments/${encodeURIComponent(slug)}`, { cache: "no-store" });
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

export function PublicEquipmentDetailClient({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await readPublicEquipment(slug);
        if (mounted) setState({ status: "ready", data });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "공개 장비를 불러오지 못했습니다." });
      }
    }

    if (!slug) {
      setState({ status: "error", message: "장비 slug가 필요합니다." });
      return;
    }

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

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
