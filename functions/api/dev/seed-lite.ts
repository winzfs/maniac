/// <reference types="@cloudflare/workers-types" />

type Env = { DB: D1Database };

const now = Date.now();
const hour = 60 * 60 * 1000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function run(db: D1Database, label: string, statements: D1PreparedStatement[]) {
  try {
    await db.batch(statements);
    return { label, ok: true, count: statements.length };
  } catch (error) {
    return { label, ok: false, error: message(error) };
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 500);

  try {
    const stages = [];

    stages.push(await run(env.DB, "users", [
      env.DB.prepare("INSERT OR IGNORE INTO users (id, email, nickname, provider) VALUES ('seed_editor', 'seed-editor@maniac.local', '장비에디터', 'seed')"),
      env.DB.prepare("INSERT OR IGNORE INTO users (id, email, nickname, provider) VALUES ('seed_reviewer', 'seed-reviewer@maniac.local', '리뷰어', 'seed')"),
      env.DB.prepare("INSERT OR IGNORE INTO users (id, email, nickname, provider) VALUES ('seed_questioner', 'seed-questioner@maniac.local', '질문러', 'seed')"),
    ]));

    stages.push(await run(env.DB, "boards", [
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_motorcycle_showcase', 'motorcycle-showcase', '장비 자랑', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_motorcycle_qna', 'motorcycle-qna', '질문/상담', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_pc_showcase', 'pc-showcase', '장비 자랑', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_pc_parts', 'pc-parts', '부품/튜닝 리뷰', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_keyboard_showcase', 'keyboard-showcase', '장비 자랑', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_camera_showcase', 'camera-showcase', '장비 자랑', 'active', 'public')"),
      env.DB.prepare("INSERT OR IGNORE INTO boards (id, slug, title, status, permission) VALUES ('board_audio_showcase', 'audio-showcase', '장비 자랑', 'active', 'public')"),
    ]));

    stages.push(await run(env.DB, "equipments", [
      env.DB.prepare("INSERT OR IGNORE INTO equipments (id, user_id, category, brand, model, nickname, slug, year, description, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at, updated_at) VALUES ('seed_eq_ninja400', 'seed_editor', 'motorcycle', 'Kawasaki', 'Ninja 400', '입문 스포츠 닌자 400', 'seed-ninja-400', 2023, '가벼운 차체와 부담 없는 포지션의 입문 스포츠 바이크.', 'km', 12840, 'public', 'normal', ?, ?)").bind(now, now),
      env.DB.prepare("INSERT OR IGNORE INTO equipments (id, user_id, category, brand, model, nickname, slug, year, description, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at, updated_at) VALUES ('seed_eq_pc', 'seed_reviewer', 'pc', 'AMD / NVIDIA', 'Ryzen 7 7800X3D + RTX 4070', '1440p 게이밍 PC', 'seed-7800x3d-rtx4070', 2024, '소음과 온도를 균형 있게 잡은 1440p 게이밍 데스크탑.', 'hours', 860, 'public', 'normal', ?, ?)").bind(now, now),
    ]));

    stages.push(await run(env.DB, "posts", [
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_ninja400', 'board_motorcycle_showcase', 'seed_editor', 'Kawasaki Ninja 400 입문 3개월 후기', '<p>Ninja 400은 입문 스포츠 바이크로 부담이 적었습니다. 차체가 가볍고 포지션이 과격하지 않아서 출퇴근과 주말 와인딩을 같이 쓰기 좋았습니다.</p><p>가장 만족한 부분은 유지비와 조작감입니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - hour, now - hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_z400_qna', 'board_motorcycle_qna', 'seed_questioner', 'Z400이 Ninja 400보다 시내 주행에 편한가요?', '<p>Ninja 400과 Z400 중 고민 중입니다. 시내 위주면 네이키드 포지션인 Z400이 확실히 편할까요?</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 2 * hour, now - 2 * hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_pc_build', 'board_pc_showcase', 'seed_reviewer', 'Ryzen 7 7800X3D + RTX 4070 1440p 빌드', '<p>게임 위주로 맞춘 AM5 빌드입니다. 1440p 고주사율을 목표로 했고, 소음이 거슬리지 않도록 팬 커브를 완만하게 잡았습니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 3 * hour, now - 3 * hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_noctua', 'board_pc_parts', 'seed_reviewer', 'Noctua NH-D15 장착 후 소음 변화', '<p>대형 공랭으로 바꾸니 풀로드 온도보다 소음 체감이 더 크게 달라졌습니다. 케이스 폭과 RAM 높이만 맞으면 만족도가 높은 업그레이드였습니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 4 * hour, now - 4 * hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_q1he', 'board_keyboard_showcase', 'seed_editor', 'Keychron Q1 HE 자석축 데일리 사용기', '<p>Q1 HE는 75% 배열이라 책상 공간을 아끼면서 방향키와 펑션열을 유지할 수 있어 데일리로 쓰기 좋았습니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 5 * hour, now - 5 * hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_eosr50', 'board_camera_showcase', 'seed_editor', 'Canon EOS R50 여행용 입문 세팅', '<p>EOS R50은 작고 가벼워서 여행용으로 들고 다니기 좋았습니다. 낮 시간 스냅 위주라면 번들렌즈도 충분했습니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 6 * hour, now - 6 * hour),
      env.DB.prepare("INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at) VALUES ('seed_post_whxm5', 'board_audio_showcase', 'seed_reviewer', 'Sony WH-1000XM5 출퇴근 노캔 세팅', '<p>지하철 출퇴근용으로 WH-1000XM5를 사용 중입니다. 노이즈캔슬링은 강하게 두고 EQ는 저역을 조금 줄였습니다.</p>', 'published', 'public', 'normal', ?, ?)").bind(now - 7 * hour, now - 7 * hour),
    ]));

    stages.push(await run(env.DB, "comments", [
      env.DB.prepare("INSERT OR IGNORE INTO comments (id, post_id, author_id, body, status, moderation_status, created_at, updated_at) VALUES ('seed_cmt_pc_1', 'seed_post_pc_build', 'seed_questioner', '1440p 기준이면 이 조합 꽤 오래 쓸 수 있어 보이네요.', 'published', 'normal', ?, ?)").bind(now, now),
      env.DB.prepare("INSERT OR IGNORE INTO comments (id, post_id, author_id, body, status, moderation_status, created_at, updated_at) VALUES ('seed_cmt_ninja_1', 'seed_post_ninja400', 'seed_reviewer', '입문용으로 유지비 정보도 궁금합니다.', 'published', 'normal', ?, ?)").bind(now, now),
      env.DB.prepare("INSERT OR IGNORE INTO comments (id, post_id, author_id, body, status, moderation_status, created_at, updated_at) VALUES ('seed_cmt_audio_1', 'seed_post_whxm5', 'seed_editor', '이어패드 관리도 같이 기록하면 좋을 것 같습니다.', 'published', 'normal', ?, ?)").bind(now, now),
    ]));

    return json({ ok: true, message: "Lite sample content seeded. Refresh the home page.", stages });
  } catch (error) {
    return json({ ok: false, error: message(error) }, 500);
  }
};

export const onRequestPost = onRequestGet;
