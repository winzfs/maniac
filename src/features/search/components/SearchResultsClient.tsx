"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SearchType = "all" | "equipment" | "post" | "news";

type SearchResult = {
  type: SearchType;
  id: string;
  title: string;
  description: string | null;
  href: string;
  label: string;
  imageUrl?: string | null;
  createdAt?: number | null;
};

type SearchResponse = {
  ok?: boolean;
  query?: string;
  type?: SearchType;
  results?: SearchResult[];
  error?: string;
};

const filterOptions: { label: string; value: SearchType }[] = [
  { label: "전체", value: "all" },
  { label: "장비", value: "equipment" },
  { label: "게시글", value: "post" },
  { label: "뉴스", value: "news" },
];

function parseType(value: string | null): SearchType {
  if (value === "equipment" || value === "post" || value === "news") return value;
  return "all";
}

function resultTypeLabel(type: SearchType) {
  if (type === "equipment") return "장비";
  if (type === "post") return "게시글";
  if (type === "news") return "뉴스";
  return "전체";
}

function formatDate(value?: number | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function ResultCard({ result }: { result: SearchResult }) {
  const isExternal = result.href.startsWith("http://") || result.href.startsWith("https://");
  const content = (
    <Card className="flex gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:p-4">
      {result.imageUrl ? (
        <img src={result.imageUrl} alt="" className="size-20 shrink-0 rounded-2xl object-cover sm:size-24" />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-background text-xs font-black text-text-secondary sm:size-24">
          {resultTypeLabel(result.type)}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge label={resultTypeLabel(result.type)} tone={result.type === "equipment" ? "lime" : result.type === "post" ? "orange" : "muted"} />
          <span className="text-xs font-semibold text-text-secondary">{result.label}</span>
          {formatDate(result.createdAt) ? <span className="text-xs text-text-secondary">· {formatDate(result.createdAt)}</span> : null}
        </div>
        <h2 className="line-clamp-2 text-base font-black leading-snug sm:text-lg">{result.title}</h2>
        <p className="line-clamp-2 text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">{result.description || "설명이 없습니다."}</p>
      </div>
    </Card>
  );

  if (isExternal) {
    return <a href={result.href} target="_blank" rel="noreferrer" className="block">{content}</a>;
  }

  return <Link href={result.href} className="block">{content}</Link>;
}

export function SearchResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const type = parseType(searchParams.get("type"));
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedQuery = useMemo(() => initialQuery.trim(), [initialQuery]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      if (!normalizedQuery) {
        setResults([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}&type=${encodeURIComponent(type)}&limit=20`, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as SearchResponse | null;
        if (!response.ok || !data?.ok) throw new Error(data?.error ?? "검색 결과를 불러오지 못했습니다.");
        if (mounted) setResults(data.results ?? []);
      } catch (loadError) {
        if (mounted) {
          setResults([]);
          setError(loadError instanceof Error ? loadError.message : "검색 결과를 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadResults();

    return () => {
      mounted = false;
    };
  }, [normalizedQuery, type]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    router.push(`/search/?q=${encodeURIComponent(trimmedQuery)}&type=${encodeURIComponent(type)}`);
  }

  function changeType(nextType: SearchType) {
    const params = new URLSearchParams();
    if (normalizedQuery) params.set("q", normalizedQuery);
    if (nextType !== "all") params.set("type", nextType);
    router.push(`/search/?${params.toString()}`);
  }

  return (
    <section className="space-y-5">
      <form onSubmit={submitSearch} className="flex gap-2">
        <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1" placeholder="게시글 제목·본문·장비·뉴스 검색" />
        <button type="submit" className="h-12 shrink-0 rounded-full bg-graphite px-5 text-sm font-black text-white transition hover:opacity-90">검색</button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => changeType(option.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${type === option.value ? "bg-garage-lime text-graphite" : "bg-surface text-text-secondary"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!normalizedQuery ? (
        <Card className="p-5 text-sm leading-6 text-text-secondary">검색어를 입력하면 게시글 제목과 본문, 공개 장비, 장비 뉴스를 한 번에 검색합니다.</Card>
      ) : null}

      {loading ? <Card className="h-28 animate-pulse" /> : null}
      {error ? <Card className="p-5 text-sm text-text-secondary">{error}</Card> : null}

      {!loading && !error && normalizedQuery ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-text-secondary">“{normalizedQuery}” 검색 결과 {results.length}개</p>
          {results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((result) => <ResultCard key={`${result.type}-${result.id}`} result={result} />)}
            </div>
          ) : (
            <Card className="space-y-1 p-5">
              <h2 className="font-black">검색 결과가 없습니다.</h2>
              <p className="text-sm leading-6 text-text-secondary">게시글 본문에 있는 정확한 단어, 제목, 장비명 또는 브랜드명으로 다시 검색해보세요.</p>
            </Card>
          )}
        </div>
      ) : null}
    </section>
  );
}
