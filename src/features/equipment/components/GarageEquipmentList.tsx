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
  main_image_url: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
  maintenance_log_count: number;
  latest_maintenance_at: number | null;
  total_maintenance_cost: number | null;
};

type EquipmentListResponse = { ok: boolean; equipments?: EquipmentListItem[]; error?: string };

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
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function formatCost(value: number | null) {
  if (!value) return "0원";
  return `${value.toLocaleString()}원`;
}

function formatVisibility(value: string) {
  if (value === "public") return "전체 공개";
  if (value === "unlisted") return "링크 공개";
  if (value === "private") return "비공개";
  return value;
}

function publicViewHref(slug: string) {
  return `/garage/view/?slug=${encodeURIComponent(slug)}`;
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-3 p-4 text-center sm:p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold sm:text-xl">로그인이 필요합니다</h3>
        <p className="text-sm leading-6 text-text-secondary">{message || "내 기어를 보려면 먼저 로그인해 주세요."}</p>
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
        const response = await fetch("/api/equipments", { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json()) as EquipmentListResponse;
        if (response.status === 401) {
          if (isMounted) setState({ status: "login-required", message: data.error ?? "내 기어를 보려면 먼저 로그인해 주세요." });
          return;
        }
        if (!response.ok || !data.ok) throw new Error(data.error ?? "기어 목록을 불러오지 못했습니다.");
        if (isMounted) setState({ status: "success", equipments: data.equipments ?? [] });
      } catch (error) {
        if (!isMounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "기어 목록을 불러오지 못했습니다." });
      }
    }
    loadEquipments();
    return () => { isMounted = false; };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 p-3 sm:flex sm:min-h-72 sm:flex-col sm:gap-4 sm:p-4">
            <div className="aspect-square animate-pulse rounded-xl bg-zinc-200 sm:aspect-[16/10] sm:rounded-2xl" />
            <div className="space-y-2"><div className="h-4 w-20 animate-pulse rounded-full bg-zinc-200" /><div className="h-5 w-32 animate-pulse rounded-full bg-zinc-200" /><div className="h-3 w-24 animate-pulse rounded-full bg-zinc-200" /></div>
          </Card>
        ))}
      </div>
    );
  }

  if (state.status === "login-required") return <LoginPrompt message={state.message} />;
  if (state.status === "error") return <Card className="space-y-2 p-4"><h3 className="text-lg font-bold">기어 목록을 불러오지 못했습니다.</h3><p className="text-sm leading-6 text-text-secondary">{state.message}</p></Card>;

  if (state.equipments.length === 0) {
    return (
      <Card className="space-y-3 p-4 text-center sm:p-5">
        <h3 className="text-lg font-bold sm:text-xl">아직 등록된 기어가 없습니다.</h3>
        <p className="text-sm leading-6 text-text-secondary">첫 기어를 등록하면 내 덕질 기록이 이곳에 표시됩니다.</p>
        <Link href="/garage/new/"><Button>내 기어 등록하기</Button></Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {state.equipments.map((equipment) => (
        <Card key={equipment.id} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 p-3 sm:flex sm:flex-col sm:gap-4 sm:p-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-400 sm:aspect-[16/10] sm:rounded-2xl">
            {equipment.main_image_url ? <img src={equipment.main_image_url} alt={`${equipment.nickname} 대표 사진`} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-[0.7rem] font-bold text-text-secondary">대표 사진 없음</div>}
            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[0.65rem] font-black text-text-primary shadow-sm sm:hidden">{formatVisibility(equipment.visibility)}</span>
          </div>

          <div className="min-w-0 space-y-2 sm:space-y-3">
            <div className="min-w-0 space-y-0.5">
              <div className="hidden items-center gap-2 sm:flex">
                <Badge label={equipment.category} tone="muted" />
                <span className="text-xs font-semibold tracking-[0.12em] text-text-secondary">{formatVisibility(equipment.visibility)}</span>
              </div>
              <h3 className="line-clamp-1 text-base font-black tracking-[-0.03em] sm:text-xl">{equipment.nickname}</h3>
              <p className="line-clamp-1 text-xs text-text-secondary sm:text-sm">{formatSpec(equipment)}</p>
              <p className="line-clamp-1 text-xs text-text-secondary sm:text-sm">{formatUsage(equipment)}</p>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-background p-1 text-center text-[0.68rem] sm:gap-2 sm:rounded-2xl sm:p-2 sm:text-xs">
              <div className="rounded-lg bg-surface p-1 sm:rounded-xl sm:p-2"><b className="block text-xs text-text-primary sm:text-sm">{equipment.maintenance_log_count}</b><span className="text-text-secondary">기록</span></div>
              <div className="rounded-lg bg-surface p-1 sm:rounded-xl sm:p-2"><b className="block text-xs text-text-primary sm:text-sm">{formatDate(equipment.latest_maintenance_at)}</b><span className="text-text-secondary">최근</span></div>
              <div className="rounded-lg bg-surface p-1 sm:rounded-xl sm:p-2"><b className="block truncate text-xs text-text-primary sm:text-sm">{formatCost(equipment.total_maintenance_cost)}</b><span className="text-text-secondary">비용</span></div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:mt-auto sm:gap-2">
              <Link href={publicViewHref(equipment.slug)}><Button className="w-full px-2 py-2 text-xs sm:text-sm">자랑 보기</Button></Link>
              <Link href={`/garage/edit/?id=${equipment.id}`}><Button className="w-full px-2 py-2 text-xs sm:text-sm" variant="secondary">관리</Button></Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
