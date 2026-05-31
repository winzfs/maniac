export type PublicPostRef = { id: string };

export type PublicPostDetailRow = {
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
  author_nickname: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
};

export type PublicPostListRow = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  category: string;
  title: string;
  body: string;
  author_id: string;
  author_nickname: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

export type PublicCommentRow = {
  id: string;
  post_id: string;
  body: string;
  author_id: string;
  author_nickname: string;
  created_at: number;
  updated_at: number;
};

export type PublicPostListFilters = {
  board?: string | null;
  category?: string | null;
  limit: number;
  sort?: "latest" | "popular";
};

const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";

const publicPostConditions = [
  "posts.deleted_at IS NULL",
  "posts.status = 'published'",
  "posts.visibility = 'public'",
  "posts.moderation_status = 'normal'",
  "boards.status = 'active'",
  "boards.permission = 'public'",
];

const publicPostWhereClause = `posts.id = ?
  AND ${publicPostConditions.join("\n  AND ")}`;

const seedUsers = [
  { id: "seed_user_rider", email: "rider@gearduck.seed", nickname: "라이더덕" },
  { id: "seed_user_builder", email: "builder@gearduck.seed", nickname: "빌드덕" },
  { id: "seed_user_reviewer", email: "reviewer@gearduck.seed", nickname: "리뷰덕" },
  { id: "seed_user_daily", email: "daily@gearduck.seed", nickname: "데일리덕" },
];

const seedCategories = [
  { slug: "motorcycle", label: "바이크" },
  { slug: "pc", label: "커스텀 PC" },
  { slug: "keyboard", label: "기계식 키보드" },
  { slug: "bicycle", label: "자전거" },
  { slug: "camera", label: "카메라" },
  { slug: "camping", label: "캠핑 장비" },
  { slug: "audio", label: "오디오" },
  { slug: "custom", label: "기타 장비" },
];

const seedTopics = [
  { type: "showcase", title: "장비 자랑", description: "내 장비 사진과 세팅을 공유하는 공간", sortOrder: 10 },
  { type: "review", title: "리뷰", description: "장비, 부품, 세팅, 사용 경험 리뷰", sortOrder: 20 },
  { type: "free", title: "자유", description: "장비 이야기를 자유롭게 나누는 공간", sortOrder: 30 },
  { type: "qna", title: "질문/상담", description: "구매, 세팅, 관리에 대한 질문 게시판", sortOrder: 40 },
  { type: "trade", title: "중고/나눔", description: "장비와 부품 거래, 나눔 정보", sortOrder: 50 },
];

const genericPostTemplates = [
  { topic: "showcase", seq: 1, author: "seed_user_builder", title: "최근 세팅한 {label} 장비 자랑합니다", body: "<p>{label} 카테고리에 올려보는 제 장비 세팅입니다. 처음에는 기본 구성으로 쓰다가 실제로 자주 쓰는 상황에 맞춰 조금씩 바꿨습니다. 핵심은 과한 튜닝보다 관리가 쉬운 구성입니다. 케이블, 수납, 소모품, 휴대성처럼 매일 체감되는 부분부터 손보니 만족도가 더 컸습니다.</p>" },
  { topic: "showcase", seq: 2, author: "seed_user_daily", title: "{label} 데일리 세팅 공유", body: "<p>매일 쓰는 기준으로 맞춘 {label} 세팅입니다. 보기 좋은 것도 중요하지만 결국 손이 자주 가고 정리하기 쉬운 구성이 오래 남는 것 같습니다. 아직 완성형은 아니지만 현재 구성에서 불편한 점과 마음에 드는 점이 분명해서 기록으로 남겨둡니다.</p>" },
  { topic: "review", seq: 1, author: "seed_user_reviewer", title: "{label} 제품 리뷰 모음용 테스트 글", body: "<p>{label} 리뷰 카테고리 기본 글입니다. 실제 사용 환경, 장점, 단점, 유지 관리 포인트를 중심으로 리뷰를 남기는 공간입니다. 카테고리별 실제 제품 기반 장문 리뷰도 함께 추가되어 있습니다.</p>" },
  { topic: "review", seq: 2, author: "seed_user_builder", title: "{label} 장비 고를 때 체감한 장단점", body: "<p>{label} 장비를 고를 때 스펙표보다 실제 사용 환경이 훨씬 중요했습니다. 소음, 무게, 유지비, 보관 방식, 교체 부품 구하기 쉬운지 같은 요소가 장기 만족도를 크게 바꿉니다. 앞으로 리뷰를 쓸 때는 단순 추천보다 어떤 사람에게 맞는지를 더 자세히 적어보려고 합니다.</p>" },
  { topic: "free", seq: 1, author: "seed_user_rider", title: "{label} 장비는 결국 자주 쓰는 게 답이네요", body: "<p>스펙표만 보고 고를 때보다 실제 생활 패턴에 맞춰 고를 때 만족도가 훨씬 높았습니다. 비싼 장비보다 자주 꺼내 쓰는 장비가 좋은 장비라는 말을 요즘 체감하고 있습니다. 다른 분들은 어떤 기준으로 장비를 정리하는지 궁금합니다.</p>" },
  { topic: "free", seq: 2, author: "seed_user_daily", title: "{label} 입문 후 가장 크게 느낀 점", body: "<p>처음에는 유명한 제품만 따라 사면 된다고 생각했는데, 막상 써보니 취향과 환경 차이가 정말 큽니다. 소음, 무게, 수납, 유지비 같은 작은 요소가 장기 만족도를 많이 바꾸네요. 요즘은 구매 전 실제 사용 후기를 더 꼼꼼히 보는 편입니다.</p>" },
  { topic: "qna", seq: 1, author: "seed_user_reviewer", title: "{label} 입문 장비 추천 부탁드립니다", body: "<p>{label} 쪽으로 제대로 입문해보려고 합니다. 너무 저렴한 제품을 샀다가 금방 바꾸는 것보다, 처음부터 어느 정도 오래 쓸 만한 제품을 사고 싶습니다. 예산과 유지 관리 난이도까지 생각했을 때 어떤 기준으로 고르면 좋을까요?</p>" },
  { topic: "qna", seq: 2, author: "seed_user_builder", title: "{label} 세팅할 때 가장 먼저 투자할 부분이 궁금합니다", body: "<p>한 번에 모든 장비를 맞추기는 부담돼서 우선순위를 정하려고 합니다. 성능, 편의성, 안전, 감성 중에서 실제로 오래 써본 분들이 가장 먼저 돈을 쓰라고 추천하는 부분이 궁금합니다.</p>" },
  { topic: "trade", seq: 1, author: "seed_user_daily", title: "{label} 입문용 장비 구합니다", body: "<p>{label} 입문용으로 부담 없이 써볼 수 있는 장비를 찾고 있습니다. 사용감은 어느 정도 괜찮지만 기능상 문제 없는 제품이면 좋겠습니다. 직거래 가능 지역이면 더 좋고, 구성품이 남아 있으면 알려주세요.</p>" },
  { topic: "trade", seq: 2, author: "seed_user_rider", title: "{label} 관련 소품 정리합니다", body: "<p>장비 구성을 바꾸면서 사용 빈도가 낮아진 소품을 정리합니다. 상태는 전체적으로 양호하고 실사용 위주라 미세한 사용감은 있습니다. 필요하신 분이 가져가서 잘 써주시면 좋겠습니다.</p>" },
];

const realReviewPosts = [
  { category: "motorcycle", id: "seed_review_motorcycle_shoei_gtair2", title: "Shoei GT-Air II 1년 사용 후기", body: "<p>Shoei GT-Air II를 약 1년 동안 출퇴근과 주말 투어에 사용했습니다. 가장 만족한 부분은 고속 주행에서의 안정감입니다. 100km/h 전후에서도 헬멧이 위로 들리거나 좌우로 털리는 느낌이 적고, 턱 아래로 들어오는 바람도 생각보다 잘 막아줍니다. 내장 선바이저는 해 질 무렵에 특히 편합니다. 다만 무게감은 분명 있습니다. 장거리에서 목이 예민한 분이라면 가벼운 풀페이스와 비교 착용해보는 것을 추천합니다. 통풍은 여름 한낮에는 기대만큼 시원하지 않지만, 상단 벤트를 열면 머리 위로 공기가 흐르는 느낌은 확실합니다. 안경 착용 공간도 괜찮고 내피 탈착 세탁도 어렵지 않았습니다. 가격은 높지만 정숙성, 마감, 편의 기능을 생각하면 투어링 헬멧으로는 충분히 납득되는 제품입니다.</p>" },
  { category: "pc", id: "seed_review_pc_4070super", title: "RTX 4070 Super QHD 실사용 리뷰", body: "<p>GeForce RTX 4070 Super를 QHD 165Hz 모니터와 함께 사용하고 있습니다. 가장 마음에 드는 점은 성능과 전력의 균형입니다. Cyberpunk 2077, Helldivers 2, Forza Horizon 5 같은 게임을 QHD에서 옵션 타협 없이 즐기기 좋고, DLSS를 켜면 프레임 확보가 훨씬 편합니다. 기존 RTX 3070에서 넘어왔을 때 체감은 분명했습니다. 특히 VRAM 12GB가 아주 넉넉하다고 보기는 어렵지만, 현재 QHD 게임에서는 큰 불편이 없었습니다. 발열은 케이스 통풍에 따라 차이가 있으나 제 시스템에서는 게임 중 60도 후반에서 70도 초반 정도로 안정적입니다. 단점은 가격입니다. 4K를 장기적으로 생각한다면 상위 모델이 더 낫습니다. 하지만 전기요금, 소음, QHD 실사용 성능을 모두 보면 4070 Super는 현재 가장 현실적인 고성능 카드 중 하나라고 느꼈습니다.</p>" },
  { category: "keyboard", id: "seed_review_keyboard_q1pro", title: "Keychron Q1 Pro 장문 사용 후기", body: "<p>Keychron Q1 Pro를 맥과 윈도우 양쪽에서 6개월 정도 사용했습니다. 가장 큰 장점은 완제품인데도 커스텀 키보드에 가까운 묵직함과 안정감입니다. 알루미늄 하우징이라 책상 위에서 밀리지 않고, 타건할 때 통울림이 적습니다. 기본 키캡은 나쁘지 않지만 표면 질감은 호불호가 있어 저는 PBT 키캡으로 교체했습니다. 블루투스 연결은 대체로 안정적이지만 게임처럼 입력 지연에 민감한 환경에서는 유선 연결을 추천합니다. VIA 지원 덕분에 키맵 수정이 쉬운 것도 큰 장점입니다. 단점은 무게와 높이입니다. 팜레스트 없이 오래 쓰면 손목 각도가 조금 부담스럽고, 휴대용으로는 사실상 어렵습니다. 그래도 사무용과 취미용을 한 대로 해결하고 싶은 사람에게는 Q1 Pro가 꽤 안전한 선택이라고 생각합니다.</p>" },
  { category: "bicycle", id: "seed_review_bicycle_edge540", title: "Garmin Edge 540 사용 후기", body: "<p>Garmin Edge 540을 로드와 그래블 라이딩에 사용했습니다. 가장 만족한 부분은 배터리와 물리 버튼입니다. 터치 모델보다 화려하지는 않지만 장갑을 끼거나 비가 올 때 버튼 조작이 훨씬 안정적입니다. GPS 잡는 속도도 빠르고, 클라임 프로 기능은 업힐에서 페이스 조절할 때 꽤 유용했습니다. 코스 이탈 알림도 명확해서 처음 가는 길에서 불안감이 줄었습니다. 단점은 초기 설정이 복잡하다는 점입니다. Garmin Connect, 센서 페어링, 데이터 화면 설정까지 처음에는 메뉴가 많아 당황할 수 있습니다. 화면도 스마트폰처럼 선명한 느낌은 아니지만 햇빛 아래 가독성은 좋습니다. 가격이 낮지는 않지만 라이딩 로그를 꾸준히 쌓고 코스 주행을 자주 한다면 충분히 투자할 가치가 있습니다.</p>" },
  { category: "camera", id: "seed_review_camera_x100vi", title: "Fujifilm X100VI 사용 후기", body: "<p>Fujifilm X100VI를 일상 스냅용으로 사용했습니다. 가장 큰 장점은 들고 나가게 만드는 디자인과 색감입니다. 필름 시뮬레이션을 잘 맞춰두면 JPEG만으로도 충분히 마음에 드는 결과물이 나오고, 35mm 환산 화각은 거리 스냅과 카페, 여행 기록에 잘 맞습니다. 손떨림 보정이 들어간 점도 이전 세대 대비 큰 장점입니다. 어두운 실내에서 셔터 속도를 조금 더 확보할 수 있어 실패 컷이 줄었습니다. 단점은 가격과 고정 렌즈의 제약입니다. 풍경에서 더 넓게 찍고 싶거나 인물에서 강한 배경 흐림을 원하면 아쉬울 수 있습니다. AF는 최신 Sony 바디처럼 압도적이지는 않지만 일상용으로는 충분합니다. 결국 이 카메라는 스펙보다 촬영 경험을 사는 제품에 가깝고, 그 감성에 공감한다면 만족도가 매우 높습니다.</p>" },
  { category: "camping", id: "seed_review_camping_chairone", title: "Helinox Chair One 장기 사용 후기", body: "<p>Helinox Chair One을 3년 가까이 사용했습니다. 비슷한 형태의 저렴한 체어도 써봤지만 결국 가장 오래 남은 건 Chair One입니다. 장점은 무게와 수납성, 그리고 프레임 신뢰감입니다. 백패킹까지는 아니어도 짐을 줄이고 싶은 캠핑에서 체어 부피가 작다는 건 큰 장점입니다. 조립은 익숙해지면 1분도 걸리지 않고, 원단 장력도 오래 유지됩니다. 착좌감은 릴렉스 체어처럼 푹 기대는 느낌은 아니지만 식사나 불멍용으로 충분합니다. 단점은 가격과 낮은 좌면입니다. 오래 앉아 있으면 허리를 받쳐주는 느낌은 약하고, 키가 큰 사람은 조금 불편할 수 있습니다. 그래도 내구성과 휴대성을 생각하면 오래 쓸수록 납득되는 제품입니다.</p>" },
  { category: "audio", id: "seed_review_audio_hd600", title: "Sennheiser HD600 지금 사도 좋은가요?", body: "<p>Sennheiser HD600을 몇 년째 사용하고 있습니다. 최신 헤드폰처럼 저음이 강하거나 공간감이 과장된 느낌은 아니지만, 중역대의 자연스러움은 여전히 매력적입니다. 보컬, 재즈, 어쿠스틱 음악을 들을 때 목소리와 악기가 과하게 꾸며지지 않고 편안하게 나옵니다. 장시간 착용감도 좋은 편입니다. 처음에는 장력이 강하게 느껴질 수 있지만 쓰다 보면 적당히 풀립니다. 단점은 구동 난이도와 저음 양감입니다. 스마트폰 직결로는 힘이 부족하고, 작은 DAC/AMP라도 연결했을 때 훨씬 안정적으로 들립니다. EDM이나 힙합처럼 깊은 저음을 기대하면 아쉬울 수 있습니다. 하지만 음악을 오래 듣고, 기준점이 되는 헤드폰을 하나 갖고 싶다면 HD600은 아직도 추천할 만합니다.</p>" },
  { category: "custom", id: "seed_review_custom_skeletool", title: "Leatherman Skeletool CX 사용 후기", body: "<p>Leatherman Skeletool CX를 가방에 넣고 다니며 사용했습니다. 풀사이즈 멀티툴보다 기능은 적지만 그래서 오히려 자주 쓰게 됩니다. 칼, 플라이어, 비트 드라이버, 병따개 정도면 일상에서는 충분했습니다. 특히 플라이어는 케이블 타이를 당기거나 작은 너트를 잡을 때 유용했고, 비트 드라이버는 장비 나사 조일 때 생각보다 자주 쓰였습니다. 무게가 가벼운 편이라 매일 휴대해도 부담이 덜합니다. 단점은 가위가 없다는 점과 손잡이 그립이 장시간 작업용은 아니라는 점입니다. 공구함을 대체할 물건은 아니지만 밖에서 갑자기 필요한 상황을 해결하는 EDC로는 아주 만족스럽습니다.</p>" },
];

let seedPromise: Promise<void> | null = null;

function replaceLabel(value: string, label: string) {
  return value.replaceAll("{label}", label);
}

async function ensureRuntimeSeedPosts(db: D1Database) {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const existing = await db.prepare("SELECT id FROM posts WHERE id = ? LIMIT 1").bind("seed_review_custom_skeletool").first<PublicPostRef>();
    if (existing) return;

    const now = Date.now();

    for (const user of seedUsers) {
      await db.prepare(
        "INSERT OR IGNORE INTO users (id, email, nickname, provider, created_at, updated_at) VALUES (?, ?, ?, 'seed', ?, ?)",
      ).bind(user.id, user.email, user.nickname, now, now).run();
    }

    for (const category of seedCategories) {
      for (const topic of seedTopics) {
        const boardSlug = `${category.slug}-${topic.type}`;
        await db.prepare(
          `INSERT OR IGNORE INTO boards (id, slug, title, status, permission, category, type, description, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, 'active', 'public', ?, ?, ?, ?, ?, ?)`,
        ).bind(`board_${category.slug}_${topic.type}`, boardSlug, topic.title, category.slug, topic.type, topic.description, topic.sortOrder, now, now).run();
        await db.prepare(
          `UPDATE boards SET status = 'active', permission = 'public', title = ?, category = ?, type = ?, description = ?, sort_order = ?, updated_at = ? WHERE slug = ?`,
        ).bind(topic.title, category.slug, topic.type, topic.description, topic.sortOrder, now, boardSlug).run();
      }
    }

    await db.prepare("UPDATE boards SET status = 'hidden', updated_at = ? WHERE type IN ('maintenance', 'parts') OR slug LIKE '%-maintenance' OR slug LIKE '%-parts'").bind(now).run();

    let index = 0;
    for (const category of seedCategories) {
      for (const template of genericPostTemplates) {
        index += 1;
        await db.prepare(
          `INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'published', 'public', 'normal', ?, ?)`,
        ).bind(
          `seed_runtime_${category.slug}_${template.topic}_${template.seq}`,
          `board_${category.slug}_${template.topic}`,
          template.author,
          replaceLabel(template.title, category.label),
          replaceLabel(template.body, category.label),
          1717200000000 + index * 3600000,
          1717200000000 + index * 3600000,
        ).run();
      }
    }

    for (let i = 0; i < realReviewPosts.length; i += 1) {
      const review = realReviewPosts[i];
      await db.prepare(
        `INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at)
         VALUES (?, ?, 'seed_user_reviewer', ?, ?, 'published', 'public', 'normal', ?, ?)`,
      ).bind(review.id, `board_${review.category}_review`, review.title, review.body, 1717500000000 + i * 3600000, 1717500000000 + i * 3600000).run();
    }
  })();

  return seedPromise;
}

export async function getPublicPost(db: D1Database, id: string) {
  await ensureRuntimeSeedPosts(db);

  return db.prepare(
    `SELECT posts.id
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE ${publicPostWhereClause}
     LIMIT 1`,
  ).bind(id).first<PublicPostRef>();
}

export async function getPublicPostDetail(db: D1Database, id: string) {
  await ensureRuntimeSeedPosts(db);

  return db.prepare(
    `SELECT
       posts.id,
       posts.board_id,
       boards.slug AS board_slug,
       boards.title AS board_title,
       boards.description AS board_description,
       boards.type AS board_type,
       ${derivedCategory} AS category,
       posts.title,
       posts.body,
       posts.author_id,
       COALESCE(users.nickname, posts.author_id) AS author_nickname,
       posts.status,
       posts.visibility,
       posts.moderation_status,
       posts.created_at,
       posts.updated_at
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN users ON users.id = posts.author_id
     WHERE ${publicPostWhereClause}
     LIMIT 1`,
  ).bind(id).first<PublicPostDetailRow>();
}

export async function listPublicPosts(db: D1Database, filters: PublicPostListFilters) {
  await ensureRuntimeSeedPosts(db);

  const conditions = [...publicPostConditions];
  const values: unknown[] = [];
  const orderBy = filters.sort === "popular" ? "comment_count DESC, posts.created_at DESC" : "posts.created_at DESC";

  if (filters.board) {
    conditions.push("boards.slug = ?");
    values.push(filters.board);
  }

  if (filters.category) {
    conditions.push(`${derivedCategory} = ?`);
    values.push(filters.category);
  }

  values.push(filters.limit);

  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.board_id,
       boards.slug AS board_slug,
       boards.title AS board_title,
       ${derivedCategory} AS category,
       posts.title,
       posts.body,
       posts.author_id,
       COALESCE(users.nickname, posts.author_id) AS author_nickname,
       posts.status,
       posts.visibility,
       posts.moderation_status,
       posts.created_at,
       posts.updated_at,
       COUNT(comments.id) AS comment_count
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN users ON users.id = posts.author_id
     LEFT JOIN comments
       ON comments.post_id = posts.id
      AND comments.deleted_at IS NULL
      AND comments.status = 'published'
      AND comments.moderation_status = 'normal'
     WHERE ${conditions.join(" AND ")}
     GROUP BY posts.id
     ORDER BY ${orderBy}
     LIMIT ?`,
  ).bind(...values).all<PublicPostListRow>();

  return rows.results ?? [];
}

export async function listPublicComments(db: D1Database, postId: string) {
  const rows = await db.prepare(
    `SELECT
       comments.id,
       comments.post_id,
       comments.body,
       comments.author_id,
       COALESCE(users.nickname, comments.author_id) AS author_nickname,
       comments.created_at,
       comments.updated_at
     FROM comments
     LEFT JOIN users ON users.id = comments.author_id
     WHERE comments.post_id = ?
       AND comments.deleted_at IS NULL
       AND comments.status = 'published'
       AND comments.moderation_status = 'normal'
     ORDER BY comments.created_at ASC
     LIMIT 100`,
  ).bind(postId).all<PublicCommentRow>();

  return rows.results ?? [];
}
