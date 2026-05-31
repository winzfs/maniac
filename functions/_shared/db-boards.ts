export type PublicBoardRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  status: string;
  permission: string;
  sort_order: number;
  post_count: number;
};

export async function listPublicBoards(db: D1Database) {
  const rows = await db.prepare(
    `SELECT
       boards.id,
       boards.slug,
       boards.title,
       COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1)) AS category,
       COALESCE(
         NULLIF(boards.type, ''),
         CASE
           WHEN boards.slug LIKE '%-showcase' THEN 'showcase'
           WHEN boards.slug LIKE '%-review' THEN 'review'
           WHEN boards.slug LIKE '%-free' THEN 'free'
           WHEN boards.slug LIKE '%-qna' THEN 'qna'
           WHEN boards.slug LIKE '%-trade' THEN 'trade'
           ELSE 'showcase'
         END
       ) AS type,
       COALESCE(
         NULLIF(boards.description, ''),
         CASE
           WHEN boards.slug LIKE '%-showcase' THEN '내 장비 사진과 세팅을 공유하는 공간'
           WHEN boards.slug LIKE '%-review' THEN '장비, 부품, 세팅, 사용 경험 리뷰'
           WHEN boards.slug LIKE '%-free' THEN '장비 이야기를 자유롭게 나누는 공간'
           WHEN boards.slug LIKE '%-qna' THEN '구매, 세팅, 관리에 대한 질문 게시판'
           WHEN boards.slug LIKE '%-trade' THEN '장비와 부품 거래, 나눔 정보'
           ELSE '장비 덕후를 위한 게시판'
         END
       ) AS description,
       boards.status,
       boards.permission,
       COALESCE(NULLIF(boards.sort_order, 0),
         CASE
           WHEN boards.slug LIKE '%-showcase' THEN 10
           WHEN boards.slug LIKE '%-review' THEN 20
           WHEN boards.slug LIKE '%-free' THEN 30
           WHEN boards.slug LIKE '%-qna' THEN 40
           WHEN boards.slug LIKE '%-trade' THEN 50
           ELSE 90
         END
       ) AS sort_order,
       COUNT(posts.id) AS post_count
     FROM boards
     LEFT JOIN posts
       ON posts.board_id = boards.id
      AND posts.deleted_at IS NULL
      AND posts.status = 'published'
      AND posts.visibility = 'public'
      AND posts.moderation_status = 'normal'
     WHERE boards.status = 'active'
       AND boards.permission = 'public'
       AND COALESCE(
         NULLIF(boards.type, ''),
         CASE
           WHEN boards.slug LIKE '%-showcase' THEN 'showcase'
           WHEN boards.slug LIKE '%-review' THEN 'review'
           WHEN boards.slug LIKE '%-free' THEN 'free'
           WHEN boards.slug LIKE '%-qna' THEN 'qna'
           WHEN boards.slug LIKE '%-trade' THEN 'trade'
           ELSE 'showcase'
         END
       ) IN ('showcase', 'review', 'free', 'qna', 'trade')
     GROUP BY boards.id
     ORDER BY category ASC, sort_order ASC, boards.slug ASC`,
  ).all<PublicBoardRow>();

  return rows.results ?? [];
}
