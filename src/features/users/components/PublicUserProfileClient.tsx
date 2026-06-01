"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { JsonLd } from "@/shared/components/seo/JsonLd";
import { getEquipmentCategory } from "@/shared/data/equipment-categories";

const SITE_ORIGIN = "https://maniac-c7d.pages.dev";

type PublicUser = {
  id: string;
  nickname: string;
  bio: string | null;
  profile_image_url: string | null;
  created_at: number | null;
};

type UserPost = {
  id: string;
  title: string;
  board_title: string;
  board_slug: string;
  category: string;
  created_at: number;
  comment_count: number;
};

type State =
  | { status: "loading" }
  | { status: "ready"; user: PublicUser; posts: UserPost[] }
  | { status: "error"; message: string };

type ProfileResponse = { ok: true; user: PublicUser; posts: UserPost[] } | { ok: false; error?: string };

function formatDate(value?: number | null) {
  if (!value) return "가입일 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

function profileJsonLd(user: PublicUser, posts: UserPost[]) {
  const url = `${SITE_ORIGIN}/users/?id=${encodeURIComponent(user.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${user.nickname} 프로필`,
    description: user.bio || "GearDuck 유저 공개 프로필입니다.",
    mainEntity: {
      "@type": "Person",
      name: user.nickname,
      url,
      image: user.profile_image_url || undefined,
      description: user.bio || undefined,
    },
    hasPart: posts.slice(0, 10).map((post) => ({
      "@type": "DiscussionForumPosting",
      headline: post.title,
      url: `${SITE_ORIGIN}${postHref(post.id)}`,
      datePublished: new Date(post.created_at).toISOString(),
      commentCount: post.comment_count,
    })),
  };
}

export function PublicUserProfileClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setState({ status: "error", message: "유저 id가 필요합니다." });
        return;
      }

      try {
        const response = await fetch(`/api/public/users/${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as ProfileResponse | null;
        if (!response.ok || !data?.ok) throw new Error(data && !data.ok ? data.error ?? "프로필을 불러오지 못했습니다." : "프로필을 불러오지 못했습니다.");
        if (mounted) setState({ status: "ready", user: data.user, posts: data.posts });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "프로필을 불러오지 못했습니다." });
      }
    }

    void load();
    return () => { mounted = false; };
  }, [id]);

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">프로필을 불러오는 중입니다...</Card>;
  if (state.status === "error") return <Card className="space-y-3 p-6"><h1 className="text-xl font-black">프로필을 불러오지 못했습니다.</h1><p className="text-sm leading-6 text-text-secondary">{state.message}</p></Card>;

  const { user, posts } = state;

  return (
    <div className="space-y-6 lg:space-y-8">
      <JsonLd data={profileJsonLd(user, posts)} />
      <PageHeader breadcrumbs={[{ label: "홈", href: "/" }, { label: "프로필" }]} title="유저 프로필" description="기어덕 유저의 공개 활동을 확인합니다." />

      <Card className="grid gap-5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-7">
        {user.profile_image_url ? (
          <img src={user.profile_image_url} alt={`${user.nickname} 프로필 이미지`} className="size-20 rounded-3xl object-cover" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-3xl bg-orange-50 text-2xl font-black text-orange-700">덕</div>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-[-0.05em]">{user.nickname}</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{user.bio || "아직 소개글이 없습니다."}</p>
          <p className="mt-2 text-xs font-semibold text-text-secondary">가입일 {formatDate(user.created_at)}</p>
        </div>
        <Button type="button" variant="secondary" disabled>쪽지 준비 중</Button>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">작성글</h2>
            <p className="mt-1 text-sm text-text-secondary">공개 게시글 {posts.length}개</p>
          </div>
        </div>

        {posts.length === 0 ? <Card className="p-6 text-sm text-text-secondary">아직 공개 작성글이 없습니다.</Card> : null}
        <div className="grid gap-3">
          {posts.map((post) => {
            const category = getEquipmentCategory(post.category);
            return (
              <Link key={post.id} href={postHref(post.id)}>
                <Card className="space-y-2 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label={category?.label ?? post.category} tone="muted" />
                    <Badge label={post.board_title} tone="lime" />
                    <span className="text-xs font-semibold text-text-secondary">댓글 {post.comment_count}</span>
                  </div>
                  <h3 className="text-lg font-black tracking-[-0.04em]">{post.title}</h3>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
