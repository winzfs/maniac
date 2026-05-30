"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { equipmentCategories } from "@/shared/data/equipment-categories";

const visibilityOptions = [
  { value: "private", label: "비공개" },
  { value: "unlisted", label: "링크 공개" },
  { value: "public", label: "전체 공개" },
];

const usageMetricOptions = [
  { value: "km", label: "km" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "custom", label: "custom" },
];

type EquipmentDetail = {
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
};

type ApiResponse = { ok: boolean; equipment?: EquipmentDetail; nextPath?: string; error?: string };
type UploadResponse = { ok?: boolean; image?: { public_url: string }; error?: string };

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type PanelState =
  | { status: "loading" }
  | { status: "ready"; equipment: EquipmentDetail; message?: string }
  | { status: "saving"; equipment: EquipmentDetail }
  | { status: "deleting"; equipment: EquipmentDetail }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

function inputClassName(className = "") {
  return `h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

function fileInputClassName() {
  return "block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary file:mr-4 file:rounded-full file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";
}

function textareaClassName(className = "") {
  return `min-h-36 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

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

async function readApi(response: Response) {
  const data = (await response.json()) as ApiResponse;
  if (response.status === 401) {
    const error = new Error(data.error ?? "로그인이 필요합니다.");
    error.name = "AuthRequiredError";
    throw error;
  }
  if (!response.ok || !data.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data;
}

async function uploadEquipmentImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/uploads/equipment-image", {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as UploadResponse | null;
  if (!response.ok || !data?.ok || !data.image?.public_url) throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");
  return data.image.public_url;
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <p className="text-sm leading-6 text-text-secondary">{message || "장비를 수정하려면 먼저 로그인해 주세요."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/login/"><Button>로그인</Button></Link>
        <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
      </div>
    </Card>
  );
}

export function EquipmentEditPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  useEffect(() => {
    let isMounted = true;

    async function loadEquipment() {
      if (!id) {
        setState({ status: "error", message: "수정할 장비 id가 없습니다." });
        return;
      }

      try {
        const data = await readApi(await fetch(`/api/equipments/${id}`, { cache: "no-store", credentials: "same-origin" }));
        if (!data.equipment) throw new Error("장비를 찾을 수 없습니다.");
        if (isMounted) {
          setMainImageUrl(data.equipment.main_image_url ?? "");
          setState({ status: "ready", equipment: data.equipment });
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error && error.name === "AuthRequiredError") {
          setState({ status: "login-required", message: error.message });
          return;
        }
        setState({ status: "error", message: error instanceof Error ? error.message : "장비를 불러오지 못했습니다." });
      }
    }

    loadEquipment();
    return () => { isMounted = false; };
  }, [id]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadState({ status: "uploading" });
    try {
      const url = await uploadEquipmentImage(file);
      setMainImageUrl(url);
      setUploadState({ status: "success", message: "대표 사진이 업로드되었습니다. 저장 버튼을 눌러 반영하세요." });
    } catch (error) {
      setUploadState({ status: "error", message: error instanceof Error ? error.message : "이미지 업로드에 실패했습니다." });
    } finally {
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "ready" && state.status !== "saving") return;

    const current = state.equipment;
    setState({ status: "saving", equipment: current });

    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        category: textValue(formData, "category"),
        brand: textValue(formData, "brand"),
        model: textValue(formData, "model"),
        nickname: textValue(formData, "nickname"),
        slug: textValue(formData, "slug"),
        year: numberValue(formData, "year"),
        description: textValue(formData, "description"),
        mainImageUrl: textValue(formData, "mainImageUrl"),
        usageMetricType: textValue(formData, "usageMetricType"),
        usageMetricValue: numberValue(formData, "usageMetricValue"),
        visibility: textValue(formData, "visibility"),
      };

      const data = await readApi(await fetch(`/api/equipments/${current.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      }));

      if (!data.equipment) throw new Error("수정 결과를 불러오지 못했습니다.");
      setMainImageUrl(data.equipment.main_image_url ?? "");
      setState({ status: "ready", equipment: data.equipment, message: "장비 정보가 수정되었습니다." });
    } catch (error) {
      if (error instanceof Error && error.name === "AuthRequiredError") {
        setState({ status: "login-required", message: error.message });
        return;
      }
      setState({ status: "ready", equipment: current, message: error instanceof Error ? error.message : "수정에 실패했습니다." });
    }
  }

  async function handleDelete() {
    if (state.status !== "ready") return;
    if (!window.confirm("이 장비를 삭제할까요? 목록과 공개 페이지에서 사라집니다.")) return;

    const current = state.equipment;
    setState({ status: "deleting", equipment: current });

    try {
      await readApi(await fetch(`/api/equipments/${current.id}`, { method: "DELETE", credentials: "same-origin" }));
      router.push("/garage/");
    } catch (error) {
      if (error instanceof Error && error.name === "AuthRequiredError") {
        setState({ status: "login-required", message: error.message });
        return;
      }
      setState({ status: "ready", equipment: current, message: error instanceof Error ? error.message : "삭제에 실패했습니다." });
    }
  }

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">장비 정보를 불러오는 중입니다...</Card>;
  if (state.status === "login-required") return <LoginPrompt message={state.message} />;
  if (state.status === "error") {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-bold">장비를 불러올 수 없습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
        <Link href="/garage/"><Button>내 차고로 돌아가기</Button></Link>
      </Card>
    );
  }

  const equipment = state.equipment;
  const isSaving = state.status === "saving";
  const isDeleting = state.status === "deleting";
  const isUploading = uploadState.status === "uploading";

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" onSubmit={handleSubmit}>
      <Card className="space-y-6 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold">장비 정보 수정</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">이름, 스펙, 공개 상태, URL slug, 대표 사진을 수정할 수 있습니다.</p>
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-background p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-200 text-sm font-bold text-text-secondary sm:w-36">
              {mainImageUrl ? <img src={mainImageUrl} alt="장비 대표 사진" className="size-full object-cover" /> : "No Image"}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="text-sm font-semibold">대표 사진</label>
              <input className={fileInputClassName()} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} disabled={isUploading || isSaving || isDeleting} />
              <input type="hidden" name="mainImageUrl" value={mainImageUrl} />
              <p className="text-xs leading-5 text-text-secondary">새 사진을 업로드한 뒤 수정 저장을 눌러야 반영됩니다.</p>
            </div>
          </div>
          {uploadState.status === "uploading" ? <p className="text-sm text-text-secondary">대표 사진을 업로드하는 중입니다...</p> : null}
          {uploadState.status === "success" ? <p className="text-sm font-semibold text-green-700">{uploadState.message}</p> : null}
          {uploadState.status === "error" ? <p className="text-sm font-semibold text-red-700">{uploadState.message}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold">장비 이름</label><input className={inputClassName()} name="nickname" defaultValue={equipment.nickname} required /></div>
          <div className="space-y-2"><label className="text-sm font-semibold">카테고리</label><select className={inputClassName()} name="category" defaultValue={equipment.category}>{equipmentCategories.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}</select></div>
          <div className="space-y-2"><label className="text-sm font-semibold">공개 상태</label><select className={inputClassName()} name="visibility" defaultValue={equipment.visibility}>{visibilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="space-y-2"><label className="text-sm font-semibold">브랜드</label><input className={inputClassName()} name="brand" defaultValue={equipment.brand ?? ""} /></div>
          <div className="space-y-2"><label className="text-sm font-semibold">모델</label><input className={inputClassName()} name="model" defaultValue={equipment.model ?? ""} /></div>
          <div className="space-y-2"><label className="text-sm font-semibold">연식</label><input className={inputClassName()} name="year" inputMode="numeric" defaultValue={equipment.year ?? ""} /></div>
          <div className="space-y-2"><label className="text-sm font-semibold">사용량</label><div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2"><input className={inputClassName()} name="usageMetricValue" inputMode="numeric" defaultValue={equipment.usage_metric_value ?? ""} /><select className={inputClassName("px-3")} name="usageMetricType" defaultValue={equipment.usage_metric_type}>{usageMetricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold">공개 URL slug</label><input className={inputClassName()} name="slug" defaultValue={equipment.slug} /></div>
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold">장비 소개</label><textarea className={textareaClassName()} name="description" defaultValue={equipment.description ?? ""} /></div>
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <Card variant="dark" className="space-y-4 p-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">Manage</p><h2 className="mt-2 text-xl font-bold">저장 / 삭제</h2><p className="mt-2 text-sm leading-6 text-zinc-300">수정사항은 D1에 바로 반영됩니다. 삭제는 soft delete로 처리됩니다.</p></div>
          <Button className="w-full" type="submit" disabled={isSaving || isDeleting || isUploading}>{isSaving ? "저장 중..." : "수정 저장"}</Button>
          <Button className="w-full border-red-300 text-red-700" type="button" variant="secondary" disabled={isSaving || isDeleting || isUploading} onClick={handleDelete}>{isDeleting ? "삭제 중..." : "장비 삭제"}</Button>
          {state.status === "ready" && state.message ? <p className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-lime-100">{state.message}</p> : null}
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-bold">바로가기</h3>
          <div className="grid gap-2">
            <Link href={`/garage/${equipment.slug}/`}><Button className="w-full" variant="secondary">공개 페이지 보기</Button></Link>
            <Link href="/garage/"><Button className="w-full" variant="ghost">내 차고로 돌아가기</Button></Link>
          </div>
        </Card>
      </aside>
    </form>
  );
}
