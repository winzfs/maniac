"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ZodError } from "zod";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { equipmentCategories } from "@/shared/data/equipment-categories";
import { formDataToCreateEquipmentInput } from "../forms/form-data";

const visibilityOptions = [
  { value: "private", label: "비공개", description: "나만 볼 수 있는 관리용 장비입니다." },
  { value: "unlisted", label: "링크 공개", description: "링크를 아는 사람만 볼 수 있습니다." },
  { value: "public", label: "전체 공개", description: "탐색과 공개 페이지에 노출할 수 있습니다." },
];

const usageMetricOptions = [
  { value: "km", label: "km" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "custom", label: "custom" },
];

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string; nextPath?: string }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type CreateEquipmentResponse = {
  ok: boolean;
  equipment?: { id: string; slug: string };
  nextPath?: string;
  error?: string;
};

type UploadResponse = {
  ok?: boolean;
  image?: { public_url: string };
  error?: string;
};

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <label className="space-y-1 text-sm font-semibold text-text-primary">
      <span>{label}</span>
      {description ? <span className="block text-xs font-normal leading-5 text-text-secondary">{description}</span> : null}
    </label>
  );
}

function inputClassName(className = "") {
  return `h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

function fileInputClassName() {
  return "block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary file:mr-4 file:rounded-full file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";
}

function textareaClassName(className = "") {
  return `min-h-36 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite ${className}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "입력값을 다시 확인해주세요.";
  if (error instanceof Error) return error.message;
  return "입력값을 다시 확인해주세요.";
}

async function createEquipmentRequest(input: unknown) {
  const response = await fetch("/api/equipments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as CreateEquipmentResponse;

  if (response.status === 401) return { data, loginRequired: true };
  if (!response.ok || !data.ok) throw new Error(data.error ?? "장비 저장에 실패했습니다.");
  return { data, loginRequired: false };
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

export function EquipmentForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [mainImageUrl, setMainImageUrl] = useState("");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({ status: "uploading" });
    try {
      const url = await uploadEquipmentImage(file);
      setMainImageUrl(url);
      setUploadState({ status: "success", message: "대표 사진이 업로드되었습니다." });
    } catch (error) {
      setUploadState({ status: "error", message: getErrorMessage(error) });
    } finally {
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    try {
      const input = formDataToCreateEquipmentInput(new FormData(event.currentTarget));
      const result = await createEquipmentRequest(input);
      if (result.loginRequired) {
        setSubmitState({ status: "login-required", message: result.data.error ?? "장비를 등록하려면 먼저 로그인해 주세요." });
        return;
      }
      setSubmitState({ status: "success", message: `${input.nickname} 장비가 저장되었습니다.`, nextPath: result.data.nextPath });
    } catch (error) {
      setSubmitState({ status: "error", message: getErrorMessage(error) });
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" onSubmit={handleSubmit}>
      <Card className="space-y-6 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">기본 정보</h2>
          <p className="text-sm leading-6 text-text-secondary">장비 공개 페이지의 제목과 기본 스펙으로 사용됩니다.</p>
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-background p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-28 w-full shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-200 text-sm font-bold text-text-secondary sm:w-36">
              {mainImageUrl ? <img src={mainImageUrl} alt="장비 대표 사진" className="size-full object-cover" /> : "No Image"}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <FieldLabel label="대표 사진" description="장비 카드와 공개 페이지 상단에 사용할 사진입니다." />
              <input className={fileInputClassName()} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} disabled={uploadState.status === "uploading"} />
              <input type="hidden" name="mainImageUrl" value={mainImageUrl} />
              <p className="text-xs leading-5 text-text-secondary">jpg, png, webp, gif / 최대 8MB</p>
            </div>
          </div>
          {uploadState.status === "uploading" ? <p className="text-sm text-text-secondary">대표 사진을 업로드하는 중입니다...</p> : null}
          {uploadState.status === "success" ? <p className="text-sm font-semibold text-green-700">{uploadState.message}</p> : null}
          {uploadState.status === "error" ? <p className="text-sm font-semibold text-red-700">{uploadState.message}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><FieldLabel label="장비 이름" description="예: 닌자 400, 내 데스크 셋업, 투어링 자전거" /><input className={inputClassName()} name="nickname" placeholder="장비 이름을 입력하세요" required /></div>
          <div className="space-y-2"><FieldLabel label="카테고리" /><select className={inputClassName()} name="category" defaultValue="motorcycle">{equipmentCategories.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}</select></div>
          <div className="space-y-2"><FieldLabel label="공개 상태" /><select className={inputClassName()} name="visibility" defaultValue="private">{visibilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="space-y-2"><FieldLabel label="브랜드" /><input className={inputClassName()} name="brand" placeholder="Kawasaki" /></div>
          <div className="space-y-2"><FieldLabel label="모델" /><input className={inputClassName()} name="model" placeholder="Ninja 400" /></div>
          <div className="space-y-2"><FieldLabel label="연식" /><input className={inputClassName()} name="year" inputMode="numeric" placeholder="2023" /></div>
          <div className="space-y-2"><FieldLabel label="사용량" description="바이크는 주행거리, 장비는 사용 시간 등으로 기록합니다." /><div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2"><input className={inputClassName()} name="usageMetricValue" inputMode="numeric" placeholder="12800" /><select className={inputClassName("px-3")} name="usageMetricType" defaultValue="km">{usageMetricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
          <div className="space-y-2 sm:col-span-2"><FieldLabel label="공개 URL slug" description="비워두면 장비 이름으로 자동 생성됩니다. 중복 시 자동 보정됩니다." /><input className={inputClassName()} name="slug" placeholder="ninja-400" /></div>
          <div className="space-y-2 sm:col-span-2"><FieldLabel label="장비 소개" description="공개 페이지 상단에 들어갈 짧은 소개를 작성하세요." /><textarea className={textareaClassName()} name="description" placeholder="어떤 장비인지, 어떤 세팅으로 타고/쓰고 있는지 적어보세요." /></div>
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <Card variant="dark" className="space-y-4 p-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">DB Create</p><h2 className="mt-2 text-xl font-bold">장비 저장</h2><p className="mt-2 text-sm leading-6 text-zinc-300">로그인한 계정의 내 차고에 장비를 저장합니다.</p></div>
          <Button className="w-full" type="submit" disabled={submitState.status === "submitting" || uploadState.status === "uploading"}>{submitState.status === "submitting" ? "저장 중..." : "장비 저장하기"}</Button>
          {submitState.status === "success" ? <div className="space-y-3 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-lime-100"><p>{submitState.message}</p>{submitState.nextPath ? <a className="font-semibold underline underline-offset-4" href={submitState.nextPath}>공개 페이지 확인하기</a> : null}</div> : null}
          {submitState.status === "login-required" ? <div className="space-y-3 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-lime-100"><p>{submitState.message}</p><div className="flex flex-wrap gap-2"><Link className="font-semibold underline underline-offset-4" href="/login/">로그인</Link><Link className="font-semibold underline underline-offset-4" href="/signup/">회원가입</Link></div></div> : null}
          {submitState.status === "error" ? <p className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-red-100">{submitState.message}</p> : null}
        </Card>
        <Card className="space-y-3 p-5"><h3 className="font-bold">대표 사진 흐름</h3><p className="text-sm leading-6 text-text-secondary">사진은 먼저 이미지 provider에 업로드되고, 반환된 URL이 장비의 대표 이미지로 저장됩니다.</p></Card>
      </aside>
    </form>
  );
}
