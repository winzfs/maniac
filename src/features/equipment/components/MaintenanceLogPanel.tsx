"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type LogItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
  visibility: string;
};

type LogResponse = { ok: boolean; logs?: LogItem[]; error?: string };
type State = { status: "loading" } | { status: "ready"; logs: LogItem[]; message?: string } | { status: "saving"; logs: LogItem[] } | { status: "error"; message: string };

const fieldClass = "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite";
const areaClass = "min-h-24 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function dateToMs(value?: string) {
  if (!value) return Date.now();
  const parsed = new Date(`${value}T00:00:00`).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
}
function formatDate(ms: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}
async function readApi(response: Response) {
  const data = (await response.json()) as LogResponse;
  if (!response.ok || !data.ok) throw new Error(data.error ?? "정비 기록 요청에 실패했습니다.");
  return data;
}

export function MaintenanceLogPanel({ equipmentId }: { equipmentId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await readApi(await fetch(`/api/equipments/${equipmentId}/logs`, { cache: "no-store" }));
        if (mounted) setState({ status: "ready", logs: data.logs ?? [] });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "정비 기록을 불러오지 못했습니다." });
      }
    }
    load();
    return () => { mounted = false; };
  }, [equipmentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "ready") return;
    const previous = state.logs;
    setState({ status: "saving", logs: previous });
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        type: textValue(formData, "type") ?? "custom",
        title: textValue(formData, "title"),
        description: textValue(formData, "description"),
        performedAt: dateToMs(textValue(formData, "performedAt")),
        usageMetricValue: numberValue(formData, "usageMetricValue"),
        cost: numberValue(formData, "cost"),
        shopName: textValue(formData, "shopName"),
        isPublic: true,
        visibility: textValue(formData, "visibility") ?? "public",
      };
      const data = await readApi(await fetch(`/api/equipments/${equipmentId}/logs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
      event.currentTarget.reset();
      setState({ status: "ready", logs: data.logs ?? [], message: "정비 기록이 추가되었습니다." });
    } catch (error) {
      setState({ status: "ready", logs: previous, message: error instanceof Error ? error.message : "정비 기록 추가에 실패했습니다." });
    }
  }

  async function handleDelete(logId: string) {
    if (state.status !== "ready") return;
    const confirmed = window.confirm("이 정비 기록을 삭제할까요? 공개 페이지에서도 사라집니다.");
    if (!confirmed) return;

    const previous = state.logs;
    setState({ status: "saving", logs: previous });

    try {
      const data = await readApi(await fetch(`/api/equipments/${equipmentId}/logs?logId=${encodeURIComponent(logId)}`, { method: "DELETE" }));
      setState({ status: "ready", logs: data.logs ?? [], message: "정비 기록이 삭제되었습니다." });
    } catch (error) {
      setState({ status: "ready", logs: previous, message: error instanceof Error ? error.message : "정비 기록 삭제에 실패했습니다." });
    }
  }

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">정비 기록을 불러오는 중입니다...</Card>;
  if (state.status === "error") return <Card className="p-6 text-sm text-red-700">{state.message}</Card>;

  const logs = state.logs;
  const isSaving = state.status === "saving";

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Card className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold">정비 타임라인</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">오일 교환, 소모품 교체, 점검 내역을 기록합니다.</p>
        </div>
        {logs.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-text-secondary">아직 정비 기록이 없습니다.</div> : null}
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">{log.type} · {formatDate(log.performed_at)}</p>
                  <h3 className="mt-1 text-lg font-bold">{log.title}</h3>
                </div>
                <Button type="button" size="sm" variant="ghost" disabled={isSaving} onClick={() => handleDelete(log.id)}>삭제</Button>
              </div>
              {log.description ? <p className="mt-2 text-sm leading-6 text-text-secondary">{log.description}</p> : null}
              <p className="mt-3 text-xs font-semibold text-text-secondary">{log.usage_metric_value != null ? `${log.usage_metric_value.toLocaleString()} km` : ""} {log.cost != null ? `· ${log.cost.toLocaleString()}원` : ""} {log.shop_name ? `· ${log.shop_name}` : ""}</p>
            </article>
          ))}
        </div>
      </Card>
      <Card className="space-y-4 p-5">
        <h3 className="font-bold">정비 기록 추가</h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input className={fieldClass} name="title" placeholder="예: 엔진오일 교환" required />
          <select className={fieldClass} name="type" defaultValue="oil"><option value="oil">오일</option><option value="tire">타이어</option><option value="inspection">점검</option><option value="custom">기타</option></select>
          <input className={fieldClass} name="performedAt" type="date" />
          <input className={fieldClass} name="usageMetricValue" inputMode="numeric" placeholder="주행거리 km" />
          <input className={fieldClass} name="cost" inputMode="numeric" placeholder="비용" />
          <input className={fieldClass} name="shopName" placeholder="정비소명" />
          <textarea className={areaClass} name="description" placeholder="메모" />
          <select className={fieldClass} name="visibility" defaultValue="public"><option value="public">전체 공개</option><option value="unlisted">링크 공개</option><option value="private">비공개</option></select>
          <Button className="w-full" type="submit" disabled={isSaving}>{isSaving ? "처리 중..." : "정비 기록 추가"}</Button>
          {state.status === "ready" && state.message ? <p className="rounded-2xl bg-background p-3 text-sm leading-6 text-text-secondary">{state.message}</p> : null}
        </form>
      </Card>
    </section>
  );
}
