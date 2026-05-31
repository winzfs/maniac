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

type DefaultBoard = {
  category: string;
  type: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
};

const categories = ["motorcycle", "pc", "keyboard", "bicycle", "camera", "camping", "audio", "custom"];

const topics = [
  { type: "showcase", title: "장비 자랑", description: "내 장비 사진과 세팅을 공유하는 공간", sortOrder: 10 },
  { type: "review", title: "리뷰", description: "장비, 부품, 세팅, 사용 경험 리뷰", sortOrder: 20 },
  { type: "free", title: "자유", description: "장비 이야기를 자유롭게 나누는 공간", sortOrder: 30 },
  { type: "qna", title: "질문/상담", description: "구매, 세팅, 관리에 대한 질문 게시판", sortOrder: 40 },
  { type: "trade", title: "중고/나눔", description: "장비와 부품 거래, 나눔 정보", sortOrder: 50 },
];

const defaultBoards: DefaultBoard[] = categories.flatMap((category) =>
  topics.map((topic) => ({
    category,
    type: topic.type,
    slug: `${category}-${topic.type}`,
    title: topic.title,
    description: topic.description,
    sortOrder: topic.sortOrder,
  })),
);

async function ensureDefaultBoards(db: D1Database) {
  const now = Date.now();

  for (const board of defaultBoards) {
    await db.prepare(
      `INSERT OR IGNORE INTO boards (
         id,
         slug,
         title,
         status,
         permission,
         category,
         type,
         description,
         sort_order,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, 'active', 'public', ?, ?, ?, ?, ?, ?)`,
    ).bind(
      `board_${board.slug.replace(/[^a-z0-9_]+/g, "_")}`,
      board.slug,
      board.title,
      board.category,
      board.type,
      board.description,
      board.sortOrder,
      now,
      now,
    ).run();

    await db.prepare(
      `UPDATE boards
       SET title = ?,
           status = 'active',
           permission = 'public',
           category = ?,
           type = ?,
           description = ?,
           sort_order = ?,
           updated_at = ?
       WHERE slug = ?`,
    ).bind(board.title, board.category, board.type, board.description, board.sortOrder, now, board.slug).run();
  }

  await db.prepare(
    `UPDATE boards
     SET status = 'hidden', updated_at = ?
     WHERE type IN ('maintenance', 'parts')
        OR slug LIKE '%-maintenance'
        OR slug LIKE '%-parts'`,
  ).bind(now).run();
}

export async function listPublicBoards(db: D1Database) {
  await ensureDefaultBoards(db);

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
