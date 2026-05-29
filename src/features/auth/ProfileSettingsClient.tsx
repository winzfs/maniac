"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

const maxBioLength = 300;

type User = {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  profile_image_url: string | null;
  provider: string | null;
};

type ProfileResponse = {
  ok?: boolean;
  user?: User;
  error?: string;
};

type UploadResponse = {
  ok?: boolean;
  image?: { public_url: string };
  error?: string;
};

type SaveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "saving" }
  | { status: "success"; message: string }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function inputClassName() {
  return "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite";
}

function fileInputClassName() {
  return "block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-primary file:mr-4 file:rounded-full file:border-0 file:bg-graphite file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";
}

function textareaClassName() {
  return "min-h-40 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-graphite";
}

async function readProfile() {
  const response = await fetch("/api/me/profile", { cache: "no-store", credentials: "same-origin" });
  const data = (await response.json().catch(() => null)) as ProfileResponse | null;

  if (response.status === 401) {
    return { user: null, loginRequired: true, error: data?.error ?? "로그인이 필요합니다." };
  }

  if (!response.ok || !data?.ok || !data.user) {
    throw new Error(data?.error ?? "프로필을 불러오지 못했습니다.");
  }

  return { user: data.user, loginRequired: false, error: "" };
}

async function saveProfile(input: { nickname: string; bio: string }) {
  const response = await fetch("/api/me/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });
  const data = (await response.json().catch(() => null)) as ProfileResponse | null;

  if (response.status === 401) {
    return { user: null, loginRequired: true, error: data?.error ?? "로그인이 필요합니다." };
  }

  if (!response.ok || !data?.ok || !data.user) {
    throw new Error(data?.error ?? "프로필 저장에 실패했습니다.");
  }

  return { user: data.user, loginRequired: false, error: "" };
}

async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/uploads/profile-image", {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as UploadResponse | null;

  if (!response.ok || !data?.ok || !data.image?.public_url) {
    throw new Error(data?.error ?? "이미지 업로드에 실패했습니다.");
  }

  return data.image.public_url;
}

export function ProfileSettingsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [saveState, setSaveState] = useState<SaveState>({ status: "loading" });
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await readProfile();
        if (!mounted) return;

        if (result.loginRequired) {
          setSaveState({ status: "login-required", message: result.error });
          return;
        }

        if (result.user) {
          setUser(result.user);
          setNickname(result.user.nickname);
          setBio(result.user.bio ?? "");
          setSaveState({ status: "idle" });
        }
      } catch (error) {
        if (mounted) setSaveState({ status: "error", message: error instanceof Error ? error.message : "프로필을 불러오지 못했습니다." });
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({ status: "uploading" });

    try {
      const publicUrl = await uploadProfileImage(file);
      setUser((current) => current ? { ...current, profile_image_url: publicUrl } : current);
      setUploadState({ status: "success", message: "프로필 이미지가 업로드되었습니다." });
    } catch (error) {
      setUploadState({ status: "error", message: error instanceof Error ? error.message : "이미지 업로드에 실패했습니다." });
    } finally {
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState({ status: "saving" });

    try {
      const result = await saveProfile({ nickname, bio });
      if (result.loginRequired) {
        setSaveState({ status: "login-required", message: result.error });
        return;
      }

      if (result.user) {
        setUser(result.user);
        setNickname(result.user.nickname);
        setBio(result.user.bio ?? "");
        setSaveState({ status: "success", message: "프로필이 저장되었습니다." });
      }
    } catch (error) {
      setSaveState({ status: "error", message: error instanceof Error ? error.message : "프로필 저장에 실패했습니다." });
    }
  }

  if (saveState.status === "loading") {
    return <Card className="p-6 text-sm text-text-secondary">프로필 정보를 불러오는 중입니다...</Card>;
  }

  if (saveState.status === "login-required") {
    return (
      <Card className="space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-black">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-text-secondary">{saveState.message}</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link href="/login/"><Button className="w-full sm:w-auto">로그인</Button></Link>
          <Link href="/signup/"><Button className="w-full sm:w-auto" variant="secondary">회원가입</Button></Link>
        </div>
      </Card>
    );
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" onSubmit={handleSubmit}>
      <Card className="space-y-6 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">기본 프로필</h2>
          <p className="text-sm leading-6 text-text-secondary">서비스 안에서 표시되는 닉네임과 소개글을 관리합니다.</p>
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-background p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-200 text-sm font-bold text-text-secondary">
              {user?.profile_image_url ? <img src={user.profile_image_url} alt="프로필 이미지" className="size-full object-cover" /> : "No Image"}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="text-sm font-semibold" htmlFor="profile-image">프로필 이미지</label>
              <input id="profile-image" className={fileInputClassName()} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} disabled={uploadState.status === "uploading"} />
              <p className="text-xs leading-5 text-text-secondary">jpg, png, webp, gif / 최대 5MB. 현재 저장소 provider는 Supabase이며, image_assets 테이블 구조는 R2 이전을 지원합니다.</p>
            </div>
          </div>
          {uploadState.status === "uploading" ? <p className="text-sm text-text-secondary">이미지를 업로드하는 중입니다...</p> : null}
          {uploadState.status === "success" ? <p className="text-sm font-semibold text-green-700">{uploadState.message}</p> : null}
          {uploadState.status === "error" ? <p className="text-sm font-semibold text-red-700">{uploadState.message}</p> : null}
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              className={inputClassName()}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              minLength={2}
              maxLength={30}
              required
              placeholder="닉네임을 입력하세요"
            />
            <p className="text-xs leading-5 text-text-secondary">2~30자까지 사용할 수 있습니다.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <label className="text-sm font-semibold" htmlFor="bio">소개글</label>
              <span className="text-xs text-text-secondary">{bio.length}/{maxBioLength}</span>
            </div>
            <textarea
              id="bio"
              className={textareaClassName()}
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, maxBioLength))}
              maxLength={maxBioLength}
              placeholder="어떤 장비를 좋아하는지, 어떤 기록을 남기고 싶은지 짧게 적어보세요."
            />
            <p className="text-xs leading-5 text-text-secondary">공개 프로필 페이지가 추가되면 이 소개글을 표시할 수 있습니다.</p>
          </div>
        </div>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <Card variant="dark" className="space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-200">Profile</p>
            <h2 className="mt-2 text-xl font-bold">변경사항 저장</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">저장하면 메뉴와 내 정보 화면의 닉네임이 함께 바뀝니다.</p>
          </div>
          <Button className="w-full" type="submit" disabled={saveState.status === "saving"}>
            {saveState.status === "saving" ? "저장 중..." : "프로필 저장"}
          </Button>
          {saveState.status === "success" ? <p className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-lime-100">{saveState.message}</p> : null}
          {saveState.status === "error" ? <p className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-red-100">{saveState.message}</p> : null}
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-bold">현재 계정</h3>
          <div className="space-y-1 text-sm leading-6 text-text-secondary">
            <p className="break-all">{user?.email ?? "-"}</p>
            <p>{user?.provider === "email" ? "이메일 계정" : "계정"}</p>
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-bold">다음 단계</h3>
          <p className="text-sm leading-6 text-text-secondary">장비 대표 이미지와 부품 이미지는 같은 image_assets/provider 구조로 확장합니다.</p>
        </Card>
      </aside>
    </form>
  );
}
