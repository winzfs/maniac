"use client";

import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

type PartItem = {
  id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
  visibility: string;
};

type PartsResponse = { ok: boolean; parts?: PartItem[]; error?: string };
type ImageUploadResponse = { ok?: boolean; image?: { public_url?: string }; error?: string };
type State = { status: "loading" } | { status: "ready"; parts: PartItem[]; message?: string } | { status: "saving"; parts: PartItem[] } | { status: "error"; message: string };

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
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`).getTime();
  return Number.isFinite(parsed) ? parsed : undefined;
}
function msToDateInput(ms: number | null) {
  if (ms == null) return "";
  const date = new Date(ms);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDate(ms: number | null) {
  if (ms == null) return "장착일 미입력";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}
function formatPrice(value: number | null) {
  if (value == null) return "가격 미입력";
  return `${value.toLocaleString()}원`;
}
async function readApi(response: Response) {
  const data = (await response.json()) as PartsResponse;
  if (!response.ok || !data.ok) throw new Error(data.error ?? "덕템 기록 요청에 실패했습니다.");
  return data;
}
async function uploadPartImage(file: File) {
  const formData = new FormData();
  formData.set("image", file);
  const response = await fetch("/api/uploads/part-image", { method: "POST", body: formData, credentials: "same-origin" });
  const data = await response.json().catch(() => null) as ImageUploadResponse | null;
  if (!response.ok || !data?.image?.public_url) throw new Error(data?.error || "이미지 업로드에 실패했습니다.");
  return data.image.public_url;
}

function PartImagePicker({ defaultValue, disabled }: { defaultValue?: string | null; disabled?: boolean }) {
  const inputId = useId();
  const [imageUrl, setImageUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setStatus("이미지 업로드 중...");
    try {
      const uploadedUrl = await uploadPartImage(file);
      setImageUrl(uploadedUrl);
      setStatus("덕템 사진이 업로드되었습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-text-primary">덕템 사진</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">사진을 선택하면 업로드 후 이미지 URL이 자동으로 들어갑니다.</p>
        </div>
        <label htmlFor={inputId} className="shrink-0 cursor-pointer rounded-full bg-graphite px-4 py-2 text-sm font-bold text-white">
          사진 선택
        </label>
      </div>
      {imageUrl ? <img src={imageUrl} alt="덕템 사진 미리보기" className="aspect-square w-24 rounded-2xl border border-border object-cover" /> : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input id={inputId} type="file" accept="image/*" disabled={disabled} onChange={handleFile} className="sr-only" />
      <input className={fieldClass} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="이미지 URL 또는 업로드" disabled={disabled} />
      {status ? <p className="text-xs text-text-secondary">{status}</p> : null}
    </div>
  );
}

export function PartsPanel({ equipmentId }: { equipmentId: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await readApi(await fetch(`/api/equipments/${equipmentId}/parts`, { cache: "no-store" }));
        if (mounted) setState({ status: "ready", parts: data.parts ?? [] });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "덕템 기록을 불러오지 못했습니다." });
      }
    }
    load();
    return () => { mounted = false; };
  }, [equipmentId]);

  function makePayload(formData: FormData) {
    return {
      category: textValue(formData, "category") ?? "custom",
      brand: textValue(formData, "brand"),
      name: textValue(formData, "name"),
      price: numberValue(formData, "price"),
      installedAt: dateToMs(textValue(formData, "installedAt")),
      purchaseUrl: textValue(formData, "purchaseUrl"),
      imageUrl: textValue(formData, "imageUrl"),
      memo: textValue(formData, "memo"),
      visibility: textValue(formData, "visibility") ?? "public",
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "ready") return;
    const form = event.currentTarget;
    const payload = makePayload(new FormData(form));
    const previous = state.parts;
    setState({ status: "saving", parts: previous });
    try {
      const data = await readApi(await fetch(`/api/equipments/${equipmentId}/parts`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
      form.reset();
      setState({ status: "ready", parts: data.parts ?? [], message: "덕템 기록이 추가되었습니다." });
    } catch (error) {
      setState({ status: "ready", parts: previous, message: error instanceof Error ? error.message : "덕템 기록 추가에 실패했습니다." });
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, partId: string) {
    event.preventDefault();
    if (state.status !== "ready") return;
    const payload = makePayload(new FormData(event.currentTarget));
    const previous = state.parts;
    setState({ status: "saving", parts: previous });
    try {
      const data = await readApi(await fetch(`/api/equipments/${equipmentId}/parts?partId=${encodeURIComponent(partId)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
      setEditingPartId(null);
      setState({ status: "ready", parts: data.parts ?? [], message: "덕템 기록이 수정되었습니다." });
    } catch (error) {
      setState({ status: "ready", parts: previous, message: error instanceof Error ? error.message : "덕템 기록 수정에 실패했습니다." });
    }
  }

  async function handleDelete(partId: string) {
    if (state.status !== "ready") return;
    const confirmed = window.confirm("이 덕템 기록을 삭제할까요? 기어 자랑 페이지에서도 사라집니다.");
    if (!confirmed) return;
    const previous = state.parts;
    setState({ status: "saving", parts: previous });
    try {
      const data = await readApi(await fetch(`/api/equipments/${equipmentId}/parts?partId=${encodeURIComponent(partId)}`, { method: "DELETE" }));
      setEditingPartId(null);
      setState({ status: "ready", parts: data.parts ?? [], message: "덕템 기록이 삭제되었습니다." });
    } catch (error) {
      setState({ status: "ready", parts: previous, message: error instanceof Error ? error.message : "덕템 기록 삭제에 실패했습니다." });
    }
  }

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">덕템 기록을 불러오는 중입니다...</Card>;
  if (state.status === "error") return <Card className="p-6 text-sm text-red-700">{state.message}</Card>;

  const parts = state.parts;
  const isSaving = state.status === "saving";

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Card className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold">덕템 기록</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">튜닝 부품, 교체 부품, 소모품처럼 기어에 붙인 덕템을 기록합니다.</p>
        </div>
        {parts.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-text-secondary">아직 덕템 기록이 없습니다.</div> : null}
        <div className="space-y-3">
          {parts.map((part) => {
            const isEditing = editingPartId === part.id;
            return (
              <article key={part.id} className="rounded-2xl border border-border bg-surface p-4">
                {isEditing ? (
                  <form className="space-y-3" onSubmit={(event) => handleUpdate(event, part.id)}>
                    <input className={fieldClass} name="name" defaultValue={part.name} required />
                    <input className={fieldClass} name="brand" defaultValue={part.brand ?? ""} placeholder="브랜드" />
                    <select className={fieldClass} name="category" defaultValue={part.category}><option value="custom">기타</option><option value="performance">성능</option><option value="exterior">외장</option><option value="maintenance">관리</option><option value="consumable">소모품</option></select>
                    <input className={fieldClass} name="installedAt" type="date" defaultValue={msToDateInput(part.installed_at)} />
                    <input className={fieldClass} name="price" inputMode="numeric" defaultValue={part.price ?? ""} placeholder="가격" />
                    <input className={fieldClass} name="purchaseUrl" defaultValue={part.purchase_url ?? ""} placeholder="구매 링크" />
                    <PartImagePicker defaultValue={part.image_url} disabled={isSaving} />
                    <textarea className={areaClass} name="memo" defaultValue={part.memo ?? ""} placeholder="메모" />
                    <select className={fieldClass} name="visibility" defaultValue={part.visibility}><option value="public">전체 공개</option><option value="unlisted">링크 공개</option><option value="private">비공개</option></select>
                    <div className="grid grid-cols-2 gap-2"><Button type="submit" disabled={isSaving}>{isSaving ? "저장 중..." : "저장"}</Button><Button type="button" variant="secondary" disabled={isSaving} onClick={() => setEditingPartId(null)}>취소</Button></div>
                  </form>
                ) : (
                  <div className="flex gap-3">
                    {part.image_url ? <img src={part.image_url} alt="덕템 사진" className="aspect-square h-20 w-20 shrink-0 rounded-2xl border border-border object-cover" /> : <div className="flex aspect-square h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-[0.65rem] font-bold text-text-secondary">NO IMG</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">{part.category} · {formatDate(part.installed_at)}</p>
                          <h3 className="mt-1 truncate text-lg font-bold">{part.brand ? `${part.brand} ` : ""}{part.name}</h3>
                        </div>
                        <div className="flex shrink-0 gap-1"><Button type="button" size="sm" variant="ghost" disabled={isSaving} onClick={() => setEditingPartId(part.id)}>수정</Button><Button type="button" size="sm" variant="ghost" disabled={isSaving} onClick={() => handleDelete(part.id)}>삭제</Button></div>
                      </div>
                      {part.memo ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{part.memo}</p> : null}
                      <p className="mt-3 text-xs font-semibold text-text-secondary">{formatPrice(part.price)} · {part.visibility}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Card>
      <Card className="space-y-4 p-5">
        <h3 className="font-bold">덕템 추가</h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input className={fieldClass} name="name" placeholder="예: 오일 필터" required />
          <input className={fieldClass} name="brand" placeholder="브랜드" />
          <select className={fieldClass} name="category" defaultValue="custom"><option value="custom">기타</option><option value="performance">성능</option><option value="exterior">외장</option><option value="maintenance">관리</option><option value="consumable">소모품</option></select>
          <input className={fieldClass} name="installedAt" type="date" />
          <input className={fieldClass} name="price" inputMode="numeric" placeholder="가격" />
          <input className={fieldClass} name="purchaseUrl" placeholder="구매 링크" />
          <PartImagePicker disabled={isSaving} />
          <textarea className={areaClass} name="memo" placeholder="메모" />
          <select className={fieldClass} name="visibility" defaultValue="public"><option value="public">전체 공개</option><option value="unlisted">링크 공개</option><option value="private">비공개</option></select>
          <Button className="w-full" type="submit" disabled={isSaving}>{isSaving ? "처리 중..." : "덕템 기록 추가"}</Button>
          {state.status === "ready" && state.message ? <p className="rounded-2xl bg-background p-3 text-sm leading-6 text-text-secondary">{state.message}</p> : null}
        </form>
      </Card>
    </section>
  );
}
