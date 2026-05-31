"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

type AdminPost = {
  id: string;
  title: string;
  body: string;
  board_title: string;
  board_slug: string;
  category: string;
  author_nickname: string | null;
  author_email: string | null;
  created_at: number;
  comment_count: number;
};

type AdminComment = {
  id: string;
  post_id: string;
  post_title: string | null;
  body: string;
  author_nickname: string | null;
  author_email: string | null;
  created_at: number;
};

type AdminNews = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  published_at: number;
  image_url: string | null;
};

type OverviewResponse = {
  ok?: boolean;
  error?: string;
  posts?: AdminPost[];
  comments?: AdminComment[];
  news?: AdminNews[];
};

type Tab = "posts" | "comments" | "news" | "design";

type State =
  | { status: "loading" }
  | { status: "ready"; posts: AdminPost[]; comments: AdminComment[]; news: AdminNews[] }
  | { status: "error"; message: string };

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function snippet(value: string, max = 120) {
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

async function readOverview() {
  const response = await fetch("/api/admin/overview?limit=50", { cache: "no-store", credentials: "same-origin" });
  const data = (await response.json().catch(() => null)) as OverviewResponse | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? "관리자 데이터를 불러오지 못했습니다.");
  return {
    posts: data.posts ?? [],
    comments: data.comments ?? [],
    news: data.news ?? [],
  };
}

async function removeAdminItem(kind: "posts" | "comments" | "news", id: string) {
  const response = await fetch(`/api/admin/${kind}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? "삭제 처리에 실패했습니다.");
}

export function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [state, setState] = useState<State>({ status: "loading" });
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setState({ status: "loading" });
    setStatus("");
    try {
      const data = await readOverview();
      setState({ status: "ready", ...data });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "관리자 데이터를 불러오지 못했습니다." });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    if (state.status !== "ready") return { posts: 0, comments: 0, news: 0 };
    return { posts: state.posts.length, comments: state.comments.length, news: state.news.length };
  }, [state]);

  async function handleDelete(kind: "posts" | "comments" | "news", id: string, label: string) {
    if (!window.confirm(`${label}을(를) 삭제/숨김 처리할까요?`)) return;
    setBusyId(id);
    setStatus("처리 중입니다...");
    try {
      await removeAdminItem(kind, id);
      setStatus("처리되었습니다.");
      if (state.status === "ready") {
        if (kind === "posts") setState({ ...state, posts: state.posts.filter((item) => item.id !== id) });
        if (kind === "comments") setState({ ...state, comments: state.comments.filter((item) => item.id !== id) });
        if (kind === "news") setState({ ...state, news: state.news.filter((item) => item.id !== id) });
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "처리 실패");
    } finally {
      setBusyId(null);
    }
  }

  if (state.status === "loading") {
    return <Card className="p-6 text-sm text-text-secondary">관리자 데이터를 불러오는 중입니다...</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-black">접근할 수 없습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
        <Link href="/login/"><Button>관리자 계정으로 로그인</Button></Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="dark" className="grid gap-4 p-5 sm:grid-cols-4 sm:p-6">
        <div><p className="text-sm text-zinc-300">게시글</p><b className="text-2xl">{counts.posts}</b></div>
        <div><p className="text-sm text-zinc-300">댓글</p><b className="text-2xl">{counts.comments}</b></div>
        <div><p className="text-sm text-zinc-300">뉴스</p><b className="text-2xl">{counts.news}</b></div>
        <div><p className="text-sm text-zinc-300">디자인</p><b className="text-2xl">준비중</b></div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ["posts", `게시글 ${counts.posts}`],
          ["comments", `댓글 ${counts.comments}`],
          ["news", `뉴스 ${counts.news}`],
          ["design", "디자인/레이아웃"],
        ] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-graphite text-white" : "bg-surface text-text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {status ? <Card className="p-4 text-sm text-text-secondary">{status}</Card> : null}

      {activeTab === "posts" ? (
        <section className="space-y-4">
          <SectionHeader title="모든 게시글" description="관리자는 작성자와 관계없이 게시글을 삭제 처리할 수 있습니다." />
          <div className="grid gap-3">
            {state.posts.map((post) => (
              <Card key={post.id} className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2"><Badge label={post.board_title} tone="muted" /><span className="text-xs text-text-secondary">{formatDate(post.created_at)}</span><span className="text-xs text-text-secondary">댓글 {post.comment_count}</span></div>
                    <h3 className="text-lg font-black">{post.title}</h3>
                    <p className="text-sm leading-6 text-text-secondary">{snippet(post.body)}</p>
                    <p className="text-xs text-text-secondary">{post.author_nickname ?? "작성자 없음"} · {post.author_email ?? "email 없음"}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/explore/post/?id=${encodeURIComponent(post.id)}`} target="_blank"><Button variant="secondary">보기</Button></Link>
                    <Button variant="ghost" disabled={busyId === post.id} onClick={() => handleDelete("posts", post.id, "게시글")}>{busyId === post.id ? "처리 중" : "삭제"}</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "comments" ? (
        <section className="space-y-4">
          <SectionHeader title="모든 댓글" description="관리자는 작성자와 관계없이 댓글을 삭제 처리할 수 있습니다." />
          <div className="grid gap-3">
            {state.comments.map((comment) => (
              <Card key={comment.id} className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2"><Badge label="댓글" tone="muted" /><span className="text-xs text-text-secondary">{formatDate(comment.created_at)}</span></div>
                    <p className="text-sm leading-6 text-text-secondary">{comment.body}</p>
                    <p className="text-xs text-text-secondary">게시글: {comment.post_title ?? comment.post_id}</p>
                    <p className="text-xs text-text-secondary">{comment.author_nickname ?? "작성자 없음"} · {comment.author_email ?? "email 없음"}</p>
                  </div>
                  <Button variant="ghost" disabled={busyId === comment.id} onClick={() => handleDelete("comments", comment.id, "댓글")}>{busyId === comment.id ? "처리 중" : "삭제"}</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "news" ? (
        <section className="space-y-4">
          <SectionHeader title="뉴스" description="뉴스는 삭제 대신 숨김 처리됩니다." />
          <div className="grid gap-3">
            {state.news.map((item) => (
              <Card key={item.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                {item.image_url ? <img src={item.image_url} alt="" className="aspect-square w-full rounded-2xl object-cover" /> : <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-background text-xs font-black text-text-secondary">{item.category}</div>}
                <div className="min-w-0 space-y-2 py-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge label={item.category} tone="muted" /><span className="text-xs text-text-secondary">{formatDate(item.published_at)}</span></div>
                  <h3 className="line-clamp-2 font-bold leading-tight">{item.title}</h3>
                  <p className="truncate text-xs text-text-secondary">{item.source}</p>
                  <div className="flex gap-2"><a href={item.link} target="_blank" rel="noreferrer"><Button variant="secondary">원문</Button></a><Button variant="ghost" disabled={busyId === item.id} onClick={() => handleDelete("news", item.id, "뉴스")}>{busyId === item.id ? "처리 중" : "숨김"}</Button></div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "design" ? (
        <Card className="space-y-3 p-6">
          <SectionHeader title="디자인/레이아웃 관리" description="나중에 홈 배너, 카테고리 순서, 추천 영역, 색상 테마를 관리하는 기능을 붙일 예정입니다." />
          <p className="text-sm leading-6 text-text-secondary">현재는 자리만 만들어두었습니다. 다음 단계에서 사이트 설정 테이블과 관리자 UI를 연결하면 됩니다.</p>
        </Card>
      ) : null}
    </div>
  );
}
