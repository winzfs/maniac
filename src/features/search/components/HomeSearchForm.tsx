"use client";

import { SearchBar } from "@/shared/components/ui/SearchBar";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HomeSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    router.push(`/search/?q=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <SearchBar
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="장비, 게시글, 뉴스 검색"
        className="min-w-0 flex-1"
      />
      <button
        type="submit"
        className="hidden h-12 shrink-0 rounded-full bg-graphite px-5 text-sm font-black text-white transition hover:opacity-90 sm:inline-flex sm:items-center sm:justify-center"
      >
        검색
      </button>
    </form>
  );
}
