"use client";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Equipment = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  main_image_url?: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  maintenance_log_count?: number;
  total_maintenance_cost?: number | null;
};

type EquipmentResponse = {
  ok?: boolean;
  equipments?: Equipment[];
  error?: string;
};

const heroEquipmentStorageKey = "maniac.heroEquipmentId";

function formatSpec(equipment: Equipment) {
  return [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ") || equipment.category;
}

function formatUsage(equipment: Equipment) {
  if (equipment.usage_metric_value == null) return "-";
  return equipment.usage_metric_value.toLocaleString();
}

function formatVisibility(value: string) {
  if (value === "public") return "전체 공개";
  if (value === "unlisted") return "링크 공개";
  if (value === "private") return "비공개";
  return value;
}

function viewHref(equipment: Equipment) {
  return `/garage/view/?slug=${encodeURIComponent(equipment.slug)}`;
}

export function HomeHeroGarageCard() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);

  const equipment = useMemo(() => {
    if (equipments.length === 0) return null;
    return equipments.find((item) => item.id === selectedEquipmentId) ?? equipments[0];
  }, [equipments, selectedEquipmentId]);

  useEffect(() => {
    let mounted = true;

    async function loadEquipment() {
      try {
        const response = await fetch("/api/equipments", { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json().catch(() => null)) as EquipmentResponse | null;

        if (response.status === 401) {
          if (mounted) setLoggedOut(true);
          return;
        }

        if (!response.ok || !data?.ok) return;

        const loadedEquipments = data.equipments ?? [];
        const storedId = window.localStorage.getItem(heroEquipmentStorageKey) ?? "";
        const nextSelectedId = loadedEquipments.some((item) => item.id === storedId) ? storedId : loadedEquipments[0]?.id ?? "";

        if (mounted) {
          setEquipments(loadedEquipments);
          setSelectedEquipmentId(nextSelectedId);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadEquipment();

    return () => {
      mounted = false;
    };
  }, []);

  function changeHeroEquipment(event: ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value;
    setSelectedEquipmentId(nextId);
    window.localStorage.setItem(heroEquipmentStorageKey, nextId);
  }

  if (loading) {
    return (
      <Card variant="dark" className="overflow-hidden p-3 sm:min-h-72 sm:p-6">
        <div className="h-28 animate-pulse rounded-xl bg-white/10 sm:h-44 sm:rounded-[1.75rem]" />
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-5 sm:gap-2">
          {[0, 1, 2].map((item) => <div key={item} className="h-10 animate-pulse rounded-xl bg-white/10 sm:h-16 sm:rounded-2xl" />)}
        </div>
      </Card>
    );
  }

  if (loggedOut) {
    return (
      <Card variant="dark" className="flex flex-col justify-between overflow-hidden p-4 sm:min-h-72 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-lime-200 sm:text-xs">내 차고</p>
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">내 장비를 등록하면 여기에 표시됩니다.</h3>
          <p className="line-clamp-2 text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">로그인 후 장비를 등록하면 홈에서 바로 내 대표 장비와 기록 수를 확인할 수 있습니다.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6">
          <Link href="/login/"><Button className="w-full px-2 py-2 text-xs sm:text-sm">로그인</Button></Link>
          <Link href="/signup/"><Button className="w-full px-2 py-2 text-xs sm:text-sm" variant="secondary">회원가입</Button></Link>
        </div>
      </Card>
    );
  }

  if (!equipment) {
    return (
      <Card variant="dark" className="flex flex-col justify-between overflow-hidden p-4 sm:min-h-72 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-lime-200 sm:text-xs">내 차고</p>
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">아직 등록된 장비가 없습니다.</h3>
          <p className="line-clamp-2 text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">첫 장비를 등록하면 홈 화면의 대표 카드로 바로 보여집니다.</p>
        </div>
        <Link href="/garage/new/" className="mt-4 sm:mt-6"><Button className="w-full px-2 py-2 text-xs sm:text-sm">장비 등록하기</Button></Link>
      </Card>
    );
  }

  return (
    <Card variant="dark" className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 overflow-hidden p-3 sm:block sm:min-h-72 sm:p-6">
      {equipment.main_image_url ? (
        <img src={equipment.main_image_url} alt="" className="aspect-square size-full rounded-xl object-cover sm:h-44 sm:w-full sm:rounded-[1.75rem]" />
      ) : (
        <div className="flex aspect-square size-full items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 via-zinc-400 to-garage-orange/80 text-[0.65rem] font-black uppercase tracking-[0.12em] text-white/80 sm:h-44 sm:w-full sm:rounded-[1.75rem] sm:text-xs sm:tracking-[0.18em]">내 장비</div>
      )}

      <div className="min-w-0 space-y-2 sm:mt-5 sm:space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-lime-200 sm:text-xs sm:tracking-[0.18em]">대표 장비</p>
            <h3 className="line-clamp-1 text-lg font-black tracking-tight sm:break-words sm:text-2xl">{equipment.nickname}</h3>
            <p className="line-clamp-1 text-xs text-zinc-300 sm:text-sm">{formatSpec(equipment)}</p>
          </div>
          {equipments.length > 1 ? (
            <label className="grid gap-1 text-xs font-bold text-zinc-300 sm:w-40">
              <span className="hidden sm:inline">대표 장비 선택</span>
              <select value={equipment.id} onChange={changeHeroEquipment} className="h-8 rounded-xl border border-white/10 bg-white/10 px-2 text-xs font-semibold text-white outline-none sm:h-10 sm:rounded-2xl sm:px-3 sm:text-sm">
                {equipments.map((item) => <option key={item.id} value={item.id} className="text-zinc-950">{item.nickname}</option>)}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-1 text-center text-[0.68rem] sm:gap-2 sm:text-sm">
          <div className="rounded-xl bg-white/10 p-1.5 sm:rounded-2xl sm:p-3"><b>{formatUsage(equipment)}</b><p className="text-[0.65rem] text-zinc-300 sm:text-xs">{equipment.usage_metric_type}</p></div>
          <div className="rounded-xl bg-white/10 p-1.5 sm:rounded-2xl sm:p-3"><b>{equipment.maintenance_log_count ?? 0}</b><p className="text-[0.65rem] text-zinc-300 sm:text-xs">기록</p></div>
          <div className="rounded-xl bg-white/10 p-1.5 sm:rounded-2xl sm:p-3"><b>{formatVisibility(equipment.visibility)}</b><p className="text-[0.65rem] text-zinc-300 sm:text-xs">공개</p></div>
        </div>

        <Link href={viewHref(equipment)}>
          <Button className="w-full px-2 py-2 text-xs sm:text-sm" variant="secondary">장비 상세 보기</Button>
        </Link>
      </div>
    </Card>
  );
}
