import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SimpleHtmlEditor } from "@/features/editor/SimpleHtmlEditor";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) => category.boards.map((board) => ({ category: category.slug, board: board.slug })));
}

export default async function BoardWritePage({ params }: { params: Promise<{ category: string; board: string }> }) {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  if (!category || !board) notFound();

  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <section className="space-y-4">
        <Badge label={`${category.label} · ${board.title}`} tone="orange" />
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">글쓰기</h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">모던하고 심플한 HTML 에디터 mock입니다. 실제 저장은 이후 DB posts와 연결합니다.</p>
      </section>

      <form className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div className="space-y-5">
          <Card className="space-y-2 p-4 sm:p-5">
            <label htmlFor="title" className="font-semibold">제목</label>
            <input id="title" name="title" className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-graphite" placeholder="제목을 입력하세요" />
          </Card>
          <SimpleHtmlEditor helperText="굵게, 제목, 인용, 코드, 목록 정도만 지원하는 가벼운 HTML 에디터입니다." />
        </div>

        <aside className="space-y-3">
          <Card variant="dark" className="p-5">
            <p className="text-sm text-zinc-300">작성 위치</p>
            <h2 className="mt-1 text-xl font-bold">{board.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{board.description}</p>
          </Card>
          <Card className="space-y-3 p-5">
            <Button className="w-full">저장 준비중</Button>
            <Button variant="secondary" className="w-full">임시저장 준비중</Button>
            <p className="text-xs leading-5 text-text-secondary">현재는 정적 mock 화면입니다. 다음 단계에서 Pages Functions와 DB 저장을 연결합니다.</p>
          </Card>
        </aside>
      </form>
    </main>
  );
}
