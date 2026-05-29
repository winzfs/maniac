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
  profile_image_url: string | null;
  provider: string | null;
};

export function MeProfileClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadMe() {
    setLoading(true);
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const result = await response.json().catch(() => null) as { ok?: boolean; user?: User | null } | null;
    setUser(result?.user ?? null);
    setLoading(false);
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
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
          <Badge label="Guest" tone="neutral" />
          <h1 className="text-3xl font-black tracking-tight">로그인이 필요합니다</h1>
          <p className="text-sm text-text-secondary">내 차고와 작성 기능을 사용하려면 로그인해 주세요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/login/"><Button>로그인</Button></Link>
          <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
        </div>
      </Card>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      <Card variant="dark" className="space-y-5 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-gradient-to-br from-garage-orange to-zinc-300" />
          <div>
            <Badge label={user.provider === "email" ? "Email Account" : "Profile"} tone="lime" />
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{user.nickname}</h1>
            <p className="mt-1 text-sm text-zinc-300">{user.email}</p>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-zinc-300">내 장비, 작성 글, 알림, 공개 프로필, 프리미엄 스킨 설정을 관리하는 페이지로 확장됩니다.</p>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="font-bold">빠른 이동</h2>
        <Link href="/garage/"><Button className="w-full">내 차고 보기</Button></Link>
        <Button variant="secondary" className="w-full">작성 글 관리 준비중</Button>
        <Button variant="secondary" className="w-full">프로필 설정 준비중</Button>
        <Button variant="ghost" className="w-full" onClick={logout} disabled={loggingOut}>{loggingOut ? "로그아웃 중..." : "로그아웃"}</Button>
      </Card>
    </section>
  );
}
