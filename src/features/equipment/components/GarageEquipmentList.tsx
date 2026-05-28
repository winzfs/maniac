"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type EquipmentListItem = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
};

type EquipmentListResponse = {
  ok: boolean;
  equipments?: EquipmentListItem[];
  error?: string;
};

type ListState =
  | { status: "loading" }
  | { status: "success"; equipments: EquipmentListItem[] }
  | { status: "error"; message: string };

function formatSpec(equipment: EquipmentListItem) {
  return [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ") || "스펙 미입력";
}

function formatUsage(equipment: EquipmentListItem) {
  if (equipment.usage_metric_value == null) return "사용량 미입력";
  return `${equipment.usage_metric_value.toLocaleString()} ${equipment.usage_metric_type}`;
}

export function GarageEquipmentList() {
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadEquipments() {
      try {
        const response = await fetch("/api/equipments", { cache: "no-store" });
        const data = (await response.json()) as EquipmentListResponse;

        if (!response.ok || !data.ok) throw new Error(data.error ?? "장비 목록을 불러오지 못했습니다.");
        if (isMounted) setState({ status: "success", equipments: data.equipments ?? [] });
      } catch (error) {
        if (!isMounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "장비 목록을 불러오지 못했습니다." });
      }
    }

    loadEquipments();

    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="flex min-h-72 flex-col gap-4 p-4 sm:p-5">
            <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200" />
            <div className="space-y-3">
              <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-7 w-40 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-3 p-6">
        <h3 className="text-xl font-bold">장비 목록을 불러오지 못했습니다.</h3>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  if (state.equipments.length === 0) {
    return (
      <Card className="space-y-4 p-6 text-center">
        <h3 className="text-xl font-bold">아직 등록된 장비가 없습니다.</h3>
        <p className="text-sm leading-6 text-text-secondary">첫 장비를 등록하면 이곳에 바로 표시됩니다.</p>
        <Link href="/garage/new/">
          <Button>장비 추가하기</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {state.equipments.map((equipment) => (
        <Card key={equipment.id} className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
          <div className="space-y-1">
            <Badge label={equipment.category} tone="muted" />
            <h3 className="text-xl font-bold">{equipment.nickname}</h3>
            <p className="text-sm text-text-secondary">{formatSpec(equipment)}</p>
            <p className="text-sm text-text-secondary">{formatUsage(equipment)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">{equipment.visibility}</p>
          </div>
          <Link href={`/garage/${equipment.slug}/`} className="mt-auto">
            <Button className="w-full">공개 페이지 보기</Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}
