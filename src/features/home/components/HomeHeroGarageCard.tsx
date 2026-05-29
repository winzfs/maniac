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

function viewHref(equipment: Equipment) {
  return equipment.visibility === "public" ? `/garage/view/?slug=${encodeURIComponent(equipment.slug)}` : `/garage/edit/?id=${encodeURIComponent(equipment.id)}`;
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
      <Card variant="dark" className="min-h-72 overflow-hidden p-5 sm:p-6">
        <div className="h-44 animate-pulse rounded-[1.75rem] bg-white/10" />
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-white/10" />)}
        </div>
      </Card>
    );
  }

  if (loggedOut) {
    return (
      <Card variant="dark" className="flex min-h-72 flex-col justify-between overflow-hidden p-5 sm:p-6">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">My Garage</p>
          <h3 className="text-2xl font-black tracking-tight">내 장비를 등록하면 여기에 표시됩니다.</h3>
          <p className="text-sm leading-6 text-zinc-300">로그인 후 장비를 등록하면 홈에서 바로 내 대표 장비와 기록 수를 확인할 수 있습니다.</p>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link href="/login/"><Button className="w-full">로그인</Button></Link>
          <Link href="/signup/"><Button className="w-full" variant="secondary">회원가입</Button></Link>
        </div>
      </Card>
    );
  }

  if (!equipment) {
    return (
      <Card variant="dark" className="flex min-h-72 flex-col justify-between overflow-hidden p-5 sm:p-6">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">My Garage</p>
          <h3 className="text-2xl font-black tracking-tight">아직 등록된 장비가 없습니다.</h3>
          <p className="text-sm leading-6 text-zinc-300">첫 장비를 등록하면 홈 화면의 대표 카드로 바로 보여집니다.</p>
        </div>
        <Link href="/garage/new/" className="mt-6"><Button className="w-full">장비 등록하기</Button></Link>
      </Card>
    );
  }

  return (
    <Card variant="dark" className="min-h-72 overflow-hidden p-5 sm:p-6">
      {equipment.main_image_url ? (
        <img src={equipment.main_image_url} alt="" className="h-44 w-full rounded-[1.75rem] object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-zinc-700 via-zinc-400 to-garage-orange/80 text-xs font-black uppercase tracking-[0.18em] text-white/80">My Equipment</div>
      )}

      <div className="mt-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">내 대표 장비</p>
            <h3 className="break-words text-2xl font-black tracking-tight">{equipment.nickname}</h3>
            <p className="text-sm text-zinc-300">{formatSpec(equipment)}</p>
          </div>
          {equipments.length > 1 ? (
            <label className="grid gap-1 text-xs font-bold text-zinc-300 sm:w-40">
              <span>대표 장비 선택</span>
              <select value={equipment.id} onChange={changeHeroEquipment} className="h-10 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white outline-none">
                {equipments.map((item) => <option key={item.id} value={item.id} className="text-zinc-950">{item.nickname}</option>)}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl bg-white/10 p-3"><b>{formatUsage(equipment)}</b><p className="text-xs text-zinc-300">{equipment.usage_metric_type}</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>{equipment.maintenance_log_count ?? 0}</b><p className="text-xs text-zinc-300">records</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>{equipment.visibility}</b><p className="text-xs text-zinc-300">visibility</p></div>
        </div>

        <Link href={viewHref(equipment)}>
          <Button className="w-full" variant="secondary">장비 페이지 보기</Button>
        </Link>
      </div>
    </Card>
  );
}
