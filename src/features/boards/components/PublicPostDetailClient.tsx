"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { sanitizePostHtml } from "@/features/boards/utils/html";

const SITE_ORIGIN = "https://maniac-c7d.pages.dev";

type User = { id: string; email: string; nickname: string };

type PublicPost = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  board_description: string | null;
  board_type: string;
  category: string;
  title: string;
  body: string;
  author_id: string;
  author_nickname: string | null;
  created_at: number;
  updated_at: number;
};

type PublicComment = {
  id: string;
  post_id: string;
  body: string;
  author_id: string;
  author_nickname: string | null;
  created_at: number;
};

type State =
  | { status: "loading" }
  | { status: "ready"; post: PublicPost; comments: PublicComment[] }
  | { status: "error"; message: string };

async function readMe() {
  const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
  const data = await response.json().catch(() => null) as { ok?: boolean; user?: User | null } | null;
  return data?.ok ? data.user ?? null : null;
}

async function readPost(id: string) {
  const response = await fetch(`/api/public/posts/${encodeURIComponent(id)}`, { cache: "no-store", credentials: "same-origin" });
  const data = await response.json() as { ok: true; post: PublicPost; comments: PublicComment[] } | { ok: false; error?: string };
  if (!response.ok || !data.ok) throw new Error(data.ok === false ? data.error ?? "게시글을 불러오지 못했습니다." : "게시글을 불러오지 못했습니다.");
  return data;
}

async function createComment(postId: string, body: string) {
  const response = await fetch(`/api/public/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ body }),
  });
  const data = await response.json() as { ok: true; comment: PublicComment } | { ok: false; error?: string };
  if (!response.ok || !data.ok) throw new Error(data.ok === false ? data.error ?? "댓글 저장에 실패했습니다." : "댓글 저장에 실패했습니다.");
  return data.comment;
}

async function removePost(postId: string) {
  const response = await fetch(`/api/me/posts/${encodeURIComponent(postId)}`, { method: "DELETE", credentials: "same-origin" });
  const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? "게시글 처리에 실패했습니다.");
}

async function removeComment(postId: string, commentId: string) {
  const response = await fetch(`/api/public/posts/${encodeURIComponent(postId)}/comments?commentId=${encodeURIComponent(commentId)}`, { method: "DELETE", credentials: "same-origin" });
  const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? "댓글 처리에 실패했습니다.");
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function textSnippet(value: string, fallback: string) {
  const normalized = stripHtml(value);
  if (!normalized) return fallback;
  return normalized.length > 150 ? `${normalized.slice(0, 147)}...` : normalized;
}

function firstImageFromHtml(value: string) {
  const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function updatePostSeo(post: PublicPost, commentCount: number) {
  const title = `${post.title} | GearDuck`;
  const description = textSnippet(post.body, `${post.board_title} 게시판의 장비 이야기와 댓글 ${commentCount}개를 GearDuck에서 확인하세요.`);
  const canonical = `${SITE_ORIGIN}/explore/post/?id=${encodeURIComponent(post.id)}`;
  const image = firstImageFromHtml(post.body);

  document.title = title;
  upsertMeta("description", description);
  upsertCanonical(canonical);
  upsertPropertyMeta("og:type", "article");
  upsertPropertyMeta("og:site_name", "GearDuck");
  upsertPropertyMeta("og:title", title);
  upsertPropertyMeta("og:description", description);
  upsertPropertyMeta("og:url", canonical);
  if (image) upsertPropertyMeta("og:image", image);
}

export function PublicPostDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [me, setMe] = useState<User | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentStatus, setCommentStatus] = useState("");
  const [ownerStatus, setOwnerStatus] = useState("");
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingPost, setRemovingPost] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [user, data] = await Promise.all([readMe(), readPost(id)]);
        if (!mounted) return;
        setMe(user);
        setState({ status: "ready", post: data.post, comments: data.comments });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." });
      }
    }
    if (!id) setState({ status: "error", message: "게시글 id가 필요합니다." });
    else void load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (state.status === "ready") updatePostSeo(state.post, state.comments.length);
  }, [state]);

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "ready") return;
    const body = commentBody.trim();
    if (body.length < 2) return setCommentStatus("댓글은 2자 이상 입력해 주세요.");
    setSubmitting(true);
    setCommentStatus("댓글을 저장하는 중입니다...");
    try {
      const comment = await createComment(state.post.id, body);
      setState({ ...state, comments: [...state.comments, comment] });
      setCommentBody("");
      setCommentStatus("댓글이 저장되었습니다.");
    } catch (error) {
      setCommentStatus(error instanceof Error ? error.message : "댓글 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemovePost() {
    if (state.status !== "ready") return;
    if (!window.confirm("게시글을 삭제할까요?")) return;
    setRemovingPost(true);
    setOwnerStatus("게시글을 처리하는 중입니다...");
    try {
      await removePost(state.post.id);
      router.push(`/explore/${state.post.category}/${state.post.board_slug}/`);
    } catch (error) {
      setOwnerStatus(error instanceof Error ? error.message : "게시글 처리에 실패했습니다.");
      setRemovingPost(false);
    }
  }

  async function handleRemoveComment(commentId: string) {
    if (state.status !== "ready") return;
    if (!window.confirm("댓글을 삭제할까요?")) return;
    setBusyCommentId(commentId);
    setCommentStatus("댓글을 처리하는 중입니다...");
    try {
      await removeComment(state.post.id, commentId);
      setState({ ...state, comments: state.comments.filter((comment) => comment.id !== commentId) });
      setCommentStatus("댓글이 삭제되었습니다.");
    } catch (error) {
      setCommentStatus(error instanceof Error ? error.message : "댓글 처리에 실패했습니다.");
    } finally {
      setBusyCommentId(null);
    }
  }

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">게시글을 불러오는 중입니다...</Card>;
  if (state.status === "error") return <Card className="space-y-3 p-6"><h1 className="text-xl font-bold">게시글을 불러오지 못했습니다.</h1><p className="text-sm leading-6 text-text-secondary">{state.message}</p></Card>;

  const { post, comments } = state;
  const isPostOwner = Boolean(me && me.id === post.author_id);

  return (
    <article className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-5">
        <Card className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
            <Badge label={post.board_title} tone={post.board_type === "trade" ? "orange" : "muted"} />
            <span>{post.author_nickname ?? "GearDuck"}</span><span>·</span><span>{formatDate(post.created_at)}</span><span>·</span><span>{comments.length} comments</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="min-w-0 text-3xl font-black tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
            {isPostOwner ? (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:justify-end">
                <Link href={`/me/posts/edit/?id=${encodeURIComponent(post.id)}`}><Button variant="secondary" className="w-full sm:w-auto">수정</Button></Link>
                <Button variant="ghost" className="w-full sm:w-auto" onClick={handleRemovePost} disabled={removingPost}>{removingPost ? "삭제 중..." : "삭제"}</Button>
              </div>
            ) : null}
          </div>
          {ownerStatus ? <p className="rounded-2xl bg-surface p-3 text-sm leading-6 text-text-secondary">{ownerStatus}</p> : null}

          <div className="post-body text-sm leading-7 text-text-secondary sm:text-base sm:leading-8 [&_a]:font-bold [&_a]:text-garage-orange [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-garage-orange [&_blockquote]:bg-surface [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:my-3" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.body) }} />
        </Card>

        <Card className="space-y-5 p-5 sm:p-6">
          <div><h2 className="text-xl font-black tracking-[-0.04em]">댓글</h2><p className="mt-1 text-sm leading-6 text-text-secondary">내가 쓴 댓글은 이 화면에서 바로 삭제할 수 있습니다.</p></div>
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} className="min-h-28 w-full rounded-2xl border border-border bg-background p-4 text-sm leading-6 outline-none focus:border-graphite" placeholder="댓글을 입력하세요" maxLength={1000} />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-text-secondary">{commentStatus || `${commentBody.length}/1000`}</p><Button type="submit" disabled={submitting}>{submitting ? "저장 중..." : "댓글 저장"}</Button></div>
          </form>

          {comments.length === 0 ? <p className="text-sm text-text-secondary">아직 공개된 댓글이 없습니다.</p> : null}
          <div className="space-y-3">
            {comments.map((comment) => {
              const isCommentOwner = Boolean(me && me.id === comment.author_id);
              return (
                <div key={comment.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                    <div className="flex flex-wrap items-center gap-2"><span>{comment.author_nickname ?? "GearDuck"}</span><span>·</span><span>{formatDate(comment.created_at)}</span></div>
                    {isCommentOwner ? <button type="button" className="font-bold text-red-600 disabled:opacity-50" onClick={() => handleRemoveComment(comment.id)} disabled={busyCommentId === comment.id}>{busyCommentId === comment.id ? "삭제 중..." : "삭제"}</button> : null}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{comment.body}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <aside className="min-w-0 space-y-3">
        <Card variant="dark" className="p-5 sm:p-6"><p className="text-sm text-zinc-300">게시판</p><h2 className="mt-1 text-xl font-bold">{post.board_title}</h2><p className="mt-2 text-sm leading-6 text-zinc-300">{post.board_description ?? "게시판 설명이 없습니다."}</p></Card>
        <Card className="p-5 sm:p-6"><p className="text-sm font-bold">바로가기</p><Link className="mt-2 inline-flex text-sm font-black text-orange-600" href={`/explore/${post.category}/${post.board_slug}/`}>게시판으로 돌아가기</Link></Card>
      </aside>
    </article>
  );
}
