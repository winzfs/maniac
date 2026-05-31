"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type UserActionMenuProps = {
  userId: string;
  nickname?: string | null;
  compact?: boolean;
  align?: "left" | "right";
};

export function UserActionMenu({ userId, nickname, compact = false, align = "left" }: UserActionMenuProps) {
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
        className={`inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 font-black text-orange-700 shadow-sm transition hover:bg-orange-100 ${compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm"}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-orange-700">덕</span>
        <span className="max-w-28 truncate">{displayName}</span>
      </button>

      {open ? (
        <span className={`absolute top-full z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-white p-1 text-left shadow-xl ${align === "right" ? "right-0" : "left-0"}`} role="menu">
          <Link href={profileHref} className="block rounded-xl px-3 py-2 text-sm font-black text-text-primary transition hover:bg-surface" role="menuitem" onClick={() => setOpen(false)}>
            👤 프로필 보기
          </Link>
          <span className="block cursor-not-allowed rounded-xl px-3 py-2 text-sm font-black text-text-secondary/60" role="menuitem" aria-disabled="true">
            ✉️ 쪽지 보내기 준비 중
          </span>
        </span>
      ) : null}
    </span>
  );
}
