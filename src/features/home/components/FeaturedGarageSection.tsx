"use client";

import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicEquipment = {
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
  created_at: number;
  maintenance_log_count: number;
  part_count: number;
  activity_score: number;
};

type PublicEquipmentResponse = {
  ok?: boolean;
  equipments?: PublicEquipment[];
  error?: string;
};

function equipmentHref(equipment: PublicEquipment) {
  return `/garage/view/?slug=${encodeURIComponent(equipment.slug)}`;
}

function formatSpec(equipment: PublicEquipment) {
  return [equipment.brand, equipment.model, equipment.year].filter(Boolean).join(" · ") || equipment.category;
}

function formatUsage(equipment: PublicEquipment) {
  if (equipment.usage_metric_value == null) return null;
  return `${equipment.usage_metric_value.toLocaleString()} ${equipment.usage_metric_type}`;
}

export function FeaturedGarageSection() {
  const [equipments, setEquipments] = useState<PublicEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadEquipments() {
      try {
        const response = await fetch("/api/public/equipments?limit=6", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as PublicEquipmentResponse | null;
        if (!response.ok || !data?.ok) throw new Error(data?.error ?? "인기 공개 장비를 불러오지 못했습니다.");
        if (mounted) setEquipments(data.equipments ?? []);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "인기 공개 장비를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadEquipments();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section>
        <SectionHeader title="인기 공개 장비" description="공개 장비 중 정비 기록과 부품 기록이 활발한 장비입니다." />
        <HorizontalScroller>
          {[0, 1, 2].map((item) => (
            <Card key={item} className="min-w-56 sm:min-w-72">
              <div className="h-28 animate-pulse rounded-xl bg-zinc-200 sm:h-40" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-zinc-200 sm:mt-4 sm:h-5 sm:w-36" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-zinc-200 sm:h-4" />
            </Card>
          ))}
        </HorizontalScroller>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <SectionHeader title="인기 공개 장비" description="공개 장비 중 정비 기록과 부품 기록이 활발한 장비입니다." />
        <Card className="p-3 text-sm text-text-secondary sm:p-5">{error}</Card>
      </section>
    );
  }

  if (equipments.length === 0) {
    return (
      <section>
        <SectionHeader title="인기 공개 장비" description="공개 장비 중 정비 기록과 부품 기록이 활발한 장비입니다." />
        <Card className="space-y-1 p-3 sm:space-y-2 sm:p-5">
          <h3 className="font-bold">아직 공개 장비가 없습니다.</h3>
          <p className="text-sm leading-6 text-text-secondary">내 차고에서 장비 공개 상태를 전체 공개로 바꾸면 이 영역에 표시됩니다.</p>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="인기 공개 장비" description="정비 기록과 부품 기록이 활발한 공개 장비를 모았습니다." />
      <HorizontalScroller>
        {equipments.map((equipment) => (
          <Link key={equipment.id} href={equipmentHref(equipment)} className="block min-w-56 sm:min-w-72">
            <Card className="h-full space-y-3 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:space-y-4 sm:p-4">
              {equipment.main_image_url ? (
                <img src={equipment.main_image_url} alt="" className="h-28 w-full rounded-xl object-cover sm:h-40" />
              ) : (
                <div className="flex h-28 items-center justify-center rounded-xl bg-zinc-200 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:h-40 sm:text-xs sm:tracking-[0.16em]">대표 사진 없음</div>
              )}
              <div className="space-y-0.5 sm:space-y-1">
                <h3 className="line-clamp-1 font-black leading-tight">{equipment.nickname}</h3>
                <p className="line-clamp-1 text-xs text-text-secondary sm:text-sm">{formatSpec(equipment)}</p>
                {formatUsage(equipment) ? <p className="line-clamp-1 text-[0.7rem] text-text-secondary sm:text-xs">{formatUsage(equipment)}</p> : null}
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-background p-1.5 text-center text-[0.68rem] text-text-secondary sm:gap-2 sm:rounded-2xl sm:p-2 sm:text-xs">
                <span><b className="block text-xs text-text-primary sm:text-sm">{equipment.maintenance_log_count}</b>정비</span>
                <span><b className="block text-xs text-text-primary sm:text-sm">{equipment.part_count}</b>부품</span>
                <span><b className="block text-xs text-text-primary sm:text-sm">{equipment.activity_score}</b>점수</span>
              </div>
            </Card>
          </Link>
        ))}
      </HorizontalScroller>
    </section>
  );
}
