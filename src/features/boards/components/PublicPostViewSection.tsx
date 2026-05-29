"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/components/ui/Card";
import { PublicPostDetailClient } from "./PublicPostDetailClient";

export function PublicPostViewSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  if (!id) {
    return (
      <Card className="space-y-3 p-6">
        <h1 className="text-xl font-bold">게시글 id가 필요합니다.</h1>
        <p className="text-sm leading-6 text-text-secondary">예: /explore/post/?id=post_motorcycle_showcase_1</p>
        <Link className="text-sm font-bold text-orange-600" href="/explore/">장비 둘러보기로 돌아가기</Link>
      </Card>
    );
  }

  return <PublicPostDetailClient id={id} />;
}
