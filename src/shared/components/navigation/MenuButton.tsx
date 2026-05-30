"use client";

import { equipmentCategories } from "@/shared/data/equipment-categories";
import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string;
  nickname: string;
};

type MeResponse = {
  ok?: boolean;
  user?: CurrentUser | null;
};

const menuLinkClassName = "rounded-2xl px-3 py-2 text-left font-semibold hover:bg-background";
const sectionLabelClassName = "px-3 pt-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-text-secondary";

function hardNavigate(path: string) {
  window.location.assign(path);
}

export function MenuButton({ label = "메뉴" }: { label?: string }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json().catch(() => null)) as MeResponse | null;
        if (mounted) setUser(data?.user ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setUser(null);
    window.location.assign("/");
  }

  return (
    <details className="group relative inline-block">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-garage-orange px-5 py-3 text-sm font-black text-white shadow-sm transition hover:opacity-90 sm:px-6 sm:text-base">
        <span>{label}</span>
        <span aria-hidden="true" className="text-base transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-72 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-2 shadow-lg sm:w-80">
        <div className="grid gap-1 text-sm">
          <p className={sectionLabelClassName}>GearDuck</p>
          <button type="button" onClick={() => hardNavigate("/")} className={menuLinkClassName}>홈</button>
          <button type="button" onClick={() => hardNavigate("/explore/")} className={menuLinkClassName}>덕질 구경</button>
          <button type="button" onClick={() => hardNavigate("/garage/")} className={menuLinkClassName}>내 기어</button>
          {loaded && user ? (
            <>
              <button type="button" onClick={() => hardNavigate("/me/")} className={menuLinkClassName}>내 정보 · {user.nickname}</button>
              <button type="button" onClick={logout} className={menuLinkClassName}>로그아웃</button>
            </>
          ) : null}
          {loaded && !user ? (
            <>
              <button type="button" onClick={() => hardNavigate("/login/")} className={menuLinkClassName}>로그인</button>
              <button type="button" onClick={() => hardNavigate("/signup/")} className={menuLinkClassName}>회원가입</button>
            </>
          ) : null}
        </div>
        <div className="my-2 h-px bg-border" />
        <div className="grid max-h-72 gap-1 overflow-y-auto text-sm">
          <p className={sectionLabelClassName}>기어 카테고리</p>
          {equipmentCategories.map((category) => (
            <Link key={category.slug} href={`/explore/${category.slug}/`} className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-background">
              <span>{category.label}</span>
              <span className="text-xs text-text-secondary">{category.boards.length}</span>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
