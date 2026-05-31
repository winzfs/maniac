"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type UserActionMenuProps = {
  userId: string;
  nickname?: string | null;
  compact?: boolean;
};

export function UserActionMenu({ userId, nickname, compact = false }: UserActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const displayName = nickname || "GearDuck";
  const profileHref = `/users/?id=${encodeURIComponent(userId)}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex align-middle" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 font-black text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100 ${compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm"}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-orange-700">덕</span>
        {displayName}
      </button>

      {open ? (
        <span className="absolute left-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-2xl border border-border bg-white p-1 text-left shadow-xl" role="menu">
          <Link href={profileHref} className="block rounded-xl px-3 py-2 text-sm font-black text-text-primary transition hover:bg-surface" role="menuitem" onClick={() => setOpen(false)}>
            프로필 보기
          </Link>
          <button
            type="button"
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-black text-text-secondary transition hover:bg-surface"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              window.alert("쪽지 기능은 준비 중입니다.");
            }}
          >
            쪽지 보내기
          </button>
        </span>
      ) : null}
    </span>
  );
}
