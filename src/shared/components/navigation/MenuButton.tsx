"use client";

import { equipmentCategories } from "@/shared/data/equipment-categories";
import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string;
  nickname: string;
  isAdmin?: boolean;
};

type MeResponse = {
  ok?: boolean;
  user?: CurrentUser | null;
};

const menuLinkClassName = "rounded-2xl px-4 py-3 text-left font-semibold transition hover:bg-background";
const sectionLabelClassName = "px-4 pt-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-text-secondary";

function hardNavigate(path: string) {
  window.location.assign(path);
}

export function MenuButton({ label = "메뉴" }: { label?: string }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setUser(null);
    window.location.assign("/");
  }

  function navigate(path: string) {
    setIsOpen(false);
    hardNavigate(path);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="사이드 네비게이션 열기"
        aria-expanded={isOpen}
        className="inline-flex size-12 items-center justify-center rounded-full border border-border bg-surface text-2xl font-black text-text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:size-14"
      >
        <span aria-hidden="true">☰</span>
        <span className="sr-only">{label}</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="사이드 네비게이션 닫기"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(86vw,24rem)] flex-col overflow-hidden rounded-l-[2rem] border-l border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary">GearDuck</p>
                <p className="text-xl font-black text-text-primary">사이드 메뉴</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="메뉴 닫기"
                className="inline-flex size-10 items-center justify-center rounded-full bg-background text-xl font-black transition hover:opacity-80"
              >
                ×
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <div className="grid gap-1 text-sm">
                <p className={sectionLabelClassName}>GearDuck</p>
                <button type="button" onClick={() => navigate("/")} className={menuLinkClassName}>홈</button>
                <button type="button" onClick={() => navigate("/explore/")} className={menuLinkClassName}>기어 둘러보기</button>
                <button type="button" onClick={() => navigate("/garage/")} className={menuLinkClassName}>내 기어</button>
                {loaded && user ? (
                  <>
                    <button type="button" onClick={() => navigate("/me/")} className={menuLinkClassName}>내 정보 · {user.nickname}</button>
                    {user.isAdmin ? <button type="button" onClick={() => navigate("/admin/")} className={`${menuLinkClassName} text-orange-600`}>관리 모드</button> : null}
                    <button type="button" onClick={logout} className={menuLinkClassName}>로그아웃</button>
                  </>
                ) : null}
                {loaded && !user ? (
                  <>
                    <button type="button" onClick={() => navigate("/login/")} className={menuLinkClassName}>로그인</button>
                    <button type="button" onClick={() => navigate("/signup/")} className={menuLinkClassName}>회원가입</button>
                  </>
                ) : null}
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="grid gap-1 text-sm">
                <p className={sectionLabelClassName}>기어 카테고리</p>
                {equipmentCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/explore/${category.slug}/`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 font-semibold transition hover:bg-background"
                  >
                    <span>{category.label}</span>
                    <span className="text-xs text-text-secondary">{category.boards.length}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
