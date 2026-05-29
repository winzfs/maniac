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
  maintenance_log_count: number;
  latest_maintenance_at: number | null;
  total_maintenance_cost: number | null;
};

type EquipmentListResponse = {
  ok: boolean;
  equipments?: EquipmentListItem[];
  error?: string;
};

type ListState =
  | { status: "loading" }
  | { status: "success"; equipments: EquipmentListItem[] }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

function formatSpec(equipment: EquipmentListItem) {
  return [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ") || "스펙 미입력";
}

function formatUsage(equipment: EquipmentListItem) {
  if (equipment.usage_metric_value == null) return "사용량 미입력";
  return `${equipment.usage_metric_value.toLocaleString()} ${equipment.usage_metric_type}`;
}

function formatDate(value: number | null) {
  if (value == null) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function formatCost(value: number | null) {
  if (!value) return "0원";
  return `${value.toLocaleString()}원`;
}

function publicViewHref(slug: string) {
  return `/garage/view/?slug=${encodeURIComponent(slug)}`;
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">로그인이 필요합니다</h3>
        <p className="text-sm leading-6 text-text-secondary">{message || "내 차고를 보려면 먼저 로그인해 주세요."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/login/"><Button>로그인</Button></Link>
        <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
      </div>
    </Card>
  );
}

export function GarageEquipmentList() {
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadEquipments() {
      try {
        const response = await fetch("/api/equipments", { cache: "no-store" });
        const data = (await response.json()) as EquipmentListResponse;

        if (response.status === 401) {
          if (isMounted) setState({ status: "login-required", message: data.error ?? "내 차고를 보려면 먼저 로그인해 주세요." });
          return;
        }

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

  if (state.status === "login-required") {
    return <LoginPrompt message={state.message} />;
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
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-background p-2 text-center text-xs">
            <div className="rounded-xl bg-surface p-2">
              <b className="block text-sm text-text-primary">{equipment.maintenance_log_count}</b>
              <span className="text-text-secondary">기록</span>
            </div>
            <div className="rounded-xl bg-surface p-2">
              <b className="block text-sm text-text-primary">{formatDate(equipment.latest_maintenance_at).replace(/\. /g, ".")}</b>
              <span className="text-text-secondary">최근</span>
            </div>
            <div className="rounded-xl bg-surface p-2">
              <b className="block text-sm text-text-primary">{formatCost(equipment.total_maintenance_cost)}</b>
              <span className="text-text-secondary">비용</span>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Link href={publicViewHref(equipment.slug)}>
              <Button className="w-full">보기</Button>
            </Link>
            <Link href={`/garage/edit/?id=${equipment.id}`}>
              <Button className="w-full" variant="secondary">수정</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
