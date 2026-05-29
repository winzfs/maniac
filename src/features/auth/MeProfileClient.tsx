"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  profile_image_url: string | null;
  provider: string | null;
};

export function MeProfileClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadMe() {
    setLoading(true);
    const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
    const result = await response.json().catch(() => null) as { ok?: boolean; user?: User | null } | null;
    setUser(result?.user ?? null);
    setLoading(false);
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setUser(null);
    setLoggingOut(false);
  }

  useEffect(() => {
    void loadMe();
  }, []);

  if (loading) {
    return <Card className="p-6 text-sm text-text-secondary">내 정보를 불러오는 중입니다...</Card>;
  }

  if (!user) {
    return (
      <Card className="space-y-5 p-6">
        <div className="space-y-1">
          <Badge label="Guest" tone="muted" />
          <h1 className="text-3xl font-black tracking-tight">로그인이 필요합니다</h1>
          <p className="text-sm text-text-secondary">내 차고와 작성 기능을 사용하려면 로그인해 주세요.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link href="/login/"><Button className="w-full sm:w-auto">로그인</Button></Link>
          <Link href="/signup/"><Button className="w-full sm:w-auto" variant="secondary">회원가입</Button></Link>
        </div>
      </Card>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <Card variant="dark" className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="size-16 shrink-0 rounded-full bg-gradient-to-br from-garage-orange to-zinc-300" />
          <div className="min-w-0">
            <Badge label={user.provider === "email" ? "Email Account" : "Profile"} tone="lime" />
            <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">{user.nickname}</h1>
            <p className="mt-1 break-all text-sm text-zinc-300">{user.email}</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5">
          <p className="max-w-2xl text-sm leading-6 text-zinc-300">{user.bio || "내 장비, 작성 글, 댓글, 알림, 공개 프로필 설정을 관리하는 공간입니다."}</p>
        </div>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-black">빠른 이동</h2>
          <p className="text-xs leading-5 text-text-secondary">내 콘텐츠 관리 화면으로 바로 이동합니다.</p>
        </div>
        <div className="grid gap-2">
          <Link href="/garage/"><Button className="w-full">내 차고 보기</Button></Link>
          <Link href="/me/posts/"><Button variant="secondary" className="w-full">내 작성글 관리</Button></Link>
          <Link href="/me/comments/"><Button variant="secondary" className="w-full">내 댓글 관리</Button></Link>
          <Link href="/me/settings/"><Button variant="secondary" className="w-full">프로필 설정</Button></Link>
        </div>
        <div className="border-t border-border pt-3">
          <Button variant="ghost" className="w-full" onClick={logout} disabled={loggingOut}>{loggingOut ? "로그아웃 중..." : "로그아웃"}</Button>
        </div>
      </Card>
    </section>
  );
}
