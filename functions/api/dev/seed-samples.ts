/// <reference types="@cloudflare/workers-types" />

type Env = { DB: D1Database };

type SeedUser = { id: string; email: string; nickname: string };
type SeedEquipment = {
  id: string;
  userId: string;
  category: string;
  brand: string;
  model: string;
  nickname: string;
  slug: string;
  year: number;
  description: string;
  usageType: string;
  usageValue: number;
};
type SeedLog = { id: string; equipmentId: string; type: string; title: string; description: string; performedAt: number; usageValue: number; cost: number; shop: string };
type SeedPart = { id: string; equipmentId: string; category: string; brand: string; name: string; price: number; memo: string };
type SeedPost = { id: string; boardId: string; authorId: string; title: string; body: string };
type SeedComment = { id: string; postId: string; authorId: string; body: string };

const hour = 60 * 60 * 1000;
const day = 24 * hour;
const baseTime = Date.UTC(2026, 4, 29, 12, 0, 0);

const users: SeedUser[] = [
  { id: "seed_user_editorial", email: "seed-editorial@maniac-garage.local", nickname: "Gear Editor" },
  { id: "seed_user_mechanic", email: "seed-mechanic@maniac-garage.local", nickname: "정비노트" },
  { id: "seed_user_parts", email: "seed-parts@maniac-garage.local", nickname: "부품리뷰어" },
  { id: "seed_user_qna", email: "seed-qna@maniac-garage.local", nickname: "궁금한마니아" },
];

const equipments: SeedEquipment[] = [
  { id: "sample_eq_ninja400", userId: "seed_user_editorial", category: "motorcycle", brand: "Kawasaki", model: "Ninja 400", nickname: "입문 스포츠 닌자 400", slug: "sample-ninja-400", year: 2023, description: "가벼운 차체와 부담 없는 포지션으로 주말 와인딩과 출퇴근을 함께 쓰는 스포츠 바이크.", usageType: "km", usageValue: 12840 },
  { id: "sample_eq_mt09", userId: "seed_user_mechanic", category: "motorcycle", brand: "Yamaha", model: "MT-09", nickname: "토크맛 MT-09", slug: "sample-mt-09", year: 2022, description: "강한 토크와 민첩한 차체가 매력인 네이키드 바이크. 체인 관리와 타이어 상태를 자주 기록 중.", usageType: "km", usageValue: 21300 },
  { id: "sample_eq_pc_7800x3d", userId: "seed_user_editorial", category: "pc", brand: "AMD / NVIDIA", model: "Ryzen 7 7800X3D + RTX 4070", nickname: "1440p 게이밍 PC", slug: "sample-7800x3d-rtx4070", year: 2024, description: "소음과 온도를 균형 있게 잡은 1440p 게이밍 데스크탑.", usageType: "hours", usageValue: 860 },
  { id: "sample_eq_keychron_q1he", userId: "seed_user_parts", category: "keyboard", brand: "Keychron", model: "Q1 HE", nickname: "Q1 HE 자석축 데스크", slug: "sample-keychron-q1-he", year: 2024, description: "게임용 입력 깊이와 타이핑용 프로필을 따로 쓰는 75% 배열 키보드.", usageType: "days", usageValue: 96 },
  { id: "sample_eq_domane_al4", userId: "seed_user_editorial", category: "bicycle", brand: "Trek", model: "Domane AL 4", nickname: "장거리 입문 로드", slug: "sample-domane-al4", year: 2023, description: "편한 지오메트리와 안정적인 알루미늄 프레임으로 장거리 입문에 맞춘 로드 자전거.", usageType: "km", usageValue: 1840 },
  { id: "sample_eq_eos_r50", userId: "seed_user_qna", category: "camera", brand: "Canon", model: "EOS R50", nickname: "여행용 EOS R50", slug: "sample-eos-r50", year: 2023, description: "가볍게 들고 다니는 APS-C 미러리스 여행 세팅.", usageType: "days", usageValue: 142 },
  { id: "sample_eq_wh1000xm5", userId: "seed_user_parts", category: "audio", brand: "Sony", model: "WH-1000XM5", nickname: "출퇴근 노캔 헤드폰", slug: "sample-wh1000xm5", year: 2022, description: "출퇴근 노이즈캔슬링과 장시간 음악 감상을 위해 EQ를 조정해둔 헤드폰.", usageType: "hours", usageValue: 520 },
];

const logs: SeedLog[] = [
  { id: "sample_log_ninja_oil", equipmentId: "sample_eq_ninja400", type: "oil", title: "엔진오일 교환", description: "주행감이 거칠어져 10W-40 합성유로 교환. 필터도 함께 교체.", performedAt: baseTime - 8 * day, usageValue: 12680, cost: 82000, shop: "동네 바이크샵" },
  { id: "sample_log_mt09_chain", equipmentId: "sample_eq_mt09", type: "chain", title: "체인 세척과 장력 조절", description: "세척 후 루브 도포, 장력 재확인. 저속 울컥임이 줄어듦.", performedAt: baseTime - 6 * day, usageValue: 21220, cost: 0, shop: "자가정비" },
  { id: "sample_log_pc_dust", equipmentId: "sample_eq_pc_7800x3d", type: "cleaning", title: "케이스 필터 청소", description: "전면/하단 필터 세척. GPU 방열판 먼지는 블로워로 약하게 제거.", performedAt: baseTime - 5 * day, usageValue: 850, cost: 0, shop: "자가관리" },
  { id: "sample_log_keyboard_clean", equipmentId: "sample_eq_keychron_q1he", type: "cleaning", title: "키캡 분리 청소", description: "PBT 키캡 세척 후 완전 건조. 하우징 먼지도 함께 제거.", performedAt: baseTime - 4 * day, usageValue: 94, cost: 0, shop: "자가관리" },
  { id: "sample_log_bicycle_index", equipmentId: "sample_eq_domane_al4", type: "drivetrain", title: "뒷변속 장력 조정", description: "5~6단 부근 변속 튐을 배럴 조정으로 해결.", performedAt: baseTime - 3 * day, usageValue: 1810, cost: 0, shop: "자가정비" },
  { id: "sample_log_camera_sensor", equipmentId: "sample_eq_eos_r50", type: "cleaning", title: "센서 먼지 확인", description: "조리개 조이고 하늘 촬영 테스트. 블로워로 1차 청소.", performedAt: baseTime - 2 * day, usageValue: 140, cost: 0, shop: "자가관리" },
  { id: "sample_log_audio_pad", equipmentId: "sample_eq_wh1000xm5", type: "cleaning", title: "이어패드 관리", description: "장시간 사용 후 이어패드 표면 세척. 보관 전 완전 건조.", performedAt: baseTime - day, usageValue: 515, cost: 0, shop: "자가관리" },
];

const parts: SeedPart[] = [
  { id: "sample_part_ninja_pad", equipmentId: "sample_eq_ninja400", category: "brake", brand: "Daytona", name: "골든 패드", price: 48000, memo: "초기 제동감이 순정보다 또렷해졌지만 소음은 약간 있음." },
  { id: "sample_part_mt09_grip", equipmentId: "sample_eq_mt09", category: "control", brand: "Pro Grip", name: "투어링 그립", price: 26000, memo: "진동이 조금 줄고 장거리 피로감이 낮아짐." },
  { id: "sample_part_pc_cooler", equipmentId: "sample_eq_pc_7800x3d", category: "cooler", brand: "Noctua", name: "NH-D15", price: 145000, memo: "온도보다 소음 체감이 큼. RAM 간섭 확인 필수." },
  { id: "sample_part_keyboard_keycap", equipmentId: "sample_eq_keychron_q1he", category: "keycap", brand: "GMK", name: "화이트 베이스 키캡", price: 98000, memo: "타건음이 조금 더 낮아지고 데스크 톤이 정리됨." },
  { id: "sample_part_bicycle_tire", equipmentId: "sample_eq_domane_al4", category: "tire", brand: "Continental", name: "Grand Prix 5000", price: 82000, memo: "구름성과 코너링 신뢰감이 좋아짐." },
  { id: "sample_part_camera_filter", equipmentId: "sample_eq_eos_r50", category: "filter", brand: "Kenko", name: "PRO1D 보호필터", price: 31000, memo: "여행 중 렌즈 보호용. 플레어는 각도에 따라 주의." },
  { id: "sample_part_audio_case", equipmentId: "sample_eq_wh1000xm5", category: "case", brand: "Geekria", name: "하드 케이스", price: 24000, memo: "가방에 넣고 다닐 때 눌림 걱정이 줄어듦." },
];

const posts: SeedPost[] = [
  { id: "sample_post_ninja400_review", boardId: "board_motorcycle_showcase", authorId: "seed_user_editorial", title: "Kawasaki Ninja 400 입문 3개월 후기", body: "<p>Ninja 400은 입문 스포츠 바이크로 부담이 적었습니다. 차체가 가볍고 포지션이 과격하지 않아서 출퇴근과 주말 와인딩을 같이 쓰기 좋았습니다.</p><p>가장 만족한 부분은 유지비와 조작감입니다. 고속 영역보다 중저속 코너에서 재미가 있고, 정비 기록을 남기기에도 관리 포인트가 명확했습니다.</p>" },
  { id: "sample_post_mt09_chain", boardId: "board_motorcycle_maintenance", authorId: "seed_user_mechanic", title: "Yamaha MT-09 체인 관리 후 체감", body: "<p>MT-09는 토크가 강해서 체인 상태가 바로 체감됩니다. 세척과 장력 조절 후 저속에서 울컥이는 느낌이 줄었습니다.</p><ul><li>세척 후 완전 건조</li><li>루브 도포 후 10분 대기</li><li>뒤 스프로킷 마모 확인</li></ul>" },
  { id: "sample_post_z400_qna", boardId: "board_motorcycle_qna", authorId: "seed_user_qna", title: "Z400이 Ninja 400보다 시내 주행에 편한가요?", body: "<p>Ninja 400과 Z400 중 고민 중입니다. 엔진 계열은 비슷해 보이는데, 시내 위주면 네이키드 포지션인 Z400이 확실히 편할까요?</p><p>주말에는 왕복 150km 정도 투어도 생각 중입니다.</p>" },
  { id: "sample_post_7800x3d_4070", boardId: "board_pc_showcase", authorId: "seed_user_editorial", title: "Ryzen 7 7800X3D + RTX 4070 1440p 빌드", body: "<p>게임 위주로 맞춘 AM5 빌드입니다. 1440p 고주사율을 목표로 했고, 소음이 거슬리지 않도록 팬 커브를 완만하게 잡았습니다.</p><p>EXPO만 적용하고 CPU 오버는 하지 않았습니다. 온도보다 체감 소음이 만족스럽습니다.</p>" },
  { id: "sample_post_noctua_d15", boardId: "board_pc_parts", authorId: "seed_user_parts", title: "Noctua NH-D15 장착 후 소음 변화", body: "<p>대형 공랭으로 바꾸니 풀로드 온도보다 소음 체감이 더 크게 달라졌습니다. 케이스 폭과 RAM 높이만 맞으면 만족도가 높은 업그레이드였습니다.</p>" },
  { id: "sample_post_sff_4070_qna", boardId: "board_pc_qna", authorId: "seed_user_qna", title: "RTX 4070을 SFF 케이스에 넣어도 괜찮을까요?", body: "<p>NR200P급 케이스에 2슬롯 RTX 4070을 생각 중입니다. 하단 흡기와 상단 배기로 장시간 게임 온도를 잡을 수 있을까요?</p>" },
  { id: "sample_post_q1he_review", boardId: "board_keyboard_showcase", authorId: "seed_user_editorial", title: "Keychron Q1 HE 자석축 데일리 사용기", body: "<p>Q1 HE는 75% 배열이라 책상 공간을 아끼면서 방향키와 펑션열을 유지할 수 있어 데일리로 쓰기 좋았습니다.</p><p>게임용 입력 깊이와 타이핑용 프로필을 따로 저장해두니 사용성이 꽤 좋아졌습니다.</p>" },
  { id: "sample_post_wooting60he_mod", boardId: "board_keyboard_parts", authorId: "seed_user_parts", title: "Wooting 60HE 키캡과 흡음재 조합", body: "<p>60% 배열은 FPS에서 마우스 공간을 넓게 쓸 수 있다는 장점이 있습니다. 흡음재와 PBT 키캡을 더하니 순정보다 타건음이 낮아졌습니다.</p>" },
  { id: "sample_post_hhkb_clean", boardId: "board_keyboard_maintenance", authorId: "seed_user_mechanic", title: "HHKB Professional 키캡 세척 기록", body: "<p>키캡을 분리해 중성세제로 세척하고 하루 정도 완전 건조했습니다. 토프레 내부 분해는 난이도가 있어 이번에는 외부 관리만 진행했습니다.</p>" },
  { id: "sample_post_domane_al4", boardId: "board_bicycle_showcase", authorId: "seed_user_editorial", title: "Trek Domane AL 4 장거리 입문 세팅", body: "<p>Domane AL 4는 편한 지오메트리와 알루미늄 프레임 조합이라 첫 로드로 부담이 적었습니다. 장거리 위주라면 타이어와 안장 세팅이 만족도를 크게 좌우했습니다.</p>" },
  { id: "sample_post_gp5000", boardId: "board_bicycle_parts", authorId: "seed_user_parts", title: "Continental GP5000 첫 100km 느낌", body: "<p>기존 입문용 타이어에서 GP5000으로 바꾸니 구름성과 코너링 신뢰감이 좋아졌습니다. 공기압을 너무 높이지 않는 쪽이 승차감도 좋았습니다.</p>" },
  { id: "sample_post_sirrusx_qna", boardId: "board_bicycle_qna", authorId: "seed_user_qna", title: "Specialized Sirrus X로 출퇴근과 가벼운 그래블 가능할까요?", body: "<p>평일 왕복 18km 출퇴근, 주말에는 한강과 임도 초입 정도를 생각 중입니다. 플랫바 하이브리드가 로드보다 편할지 궁금합니다.</p>" },
  { id: "sample_post_eosr50", boardId: "board_camera_showcase", authorId: "seed_user_editorial", title: "Canon EOS R50 여행용 입문 세팅", body: "<p>EOS R50은 작고 가벼워서 여행용으로 들고 다니기 좋았습니다. 낮 시간 스냅 위주라면 번들렌즈도 충분했고, 다음은 망원 줌을 추가해볼 생각입니다.</p>" },
  { id: "sample_post_x100vi_filter", boardId: "board_camera_parts", authorId: "seed_user_parts", title: "Fujifilm X100VI 보호필터와 후드 조합", body: "<p>X100VI는 매일 들고 다니는 카메라라 렌즈 보호와 휴대성이 중요했습니다. 슬림 후드와 보호필터 조합은 가방에 넣고 빼기 편했습니다.</p>" },
  { id: "sample_post_a7iv_sensor", boardId: "board_camera_maintenance", authorId: "seed_user_mechanic", title: "Sony A7 IV 센서 먼지 확인과 블로워 청소", body: "<p>조리개를 조이고 하늘을 찍어보니 작은 먼지가 보여 블로워로 1차 청소했습니다. 젖은 클리닝은 센터 방문 전까진 보류했습니다.</p>" },
  { id: "sample_post_helinox", boardId: "board_camping_showcase", authorId: "seed_user_editorial", title: "Helinox Chair One 백패킹 의자 사용기", body: "<p>Chair One은 수납 부피가 작고 조립이 쉬워서 야간 피칭 후에도 부담이 적었습니다. 지면이 무르면 다리 끝이 파고들 수 있어 볼핏을 같이 챙기고 있습니다.</p>" },
  { id: "sample_post_msr_stove", boardId: "board_camping_maintenance", authorId: "seed_user_mechanic", title: "MSR PocketRocket 사용 후 관리", body: "<p>버너 헤드 이물질만 잘 제거해도 점화가 안정적입니다. 수납 전 완전히 식히고, 케이스 안에 습기가 차지 않게 분리 보관했습니다.</p>" },
  { id: "sample_post_snowpeak_mug", boardId: "board_camping_parts", authorId: "seed_user_parts", title: "Snow Peak 티타늄 머그 450 후기", body: "<p>티타늄 머그는 가볍고 녹 걱정이 적어 백패킹에 잘 맞았습니다. 직접 불에 올리면 변색은 생기지만 사용감으로 받아들이면 오히려 매력입니다.</p>" },
  { id: "sample_post_wh1000xm5", boardId: "board_audio_showcase", authorId: "seed_user_editorial", title: "Sony WH-1000XM5 출퇴근 노캔 세팅", body: "<p>지하철 출퇴근용으로 WH-1000XM5를 사용 중입니다. 노이즈캔슬링은 강하게 두고, EQ는 저역을 조금 줄여 장시간 들어도 피곤하지 않게 맞췄습니다.</p>" },
  { id: "sample_post_hd600_pad", boardId: "board_audio_parts", authorId: "seed_user_parts", title: "Sennheiser HD 600 이어패드 교체 체감", body: "<p>오래 쓴 HD 600은 패드가 눌리면서 소리와 착용감이 같이 변했습니다. 새 패드로 교체하니 귀와 드라이버 사이 거리가 돌아와 중역이 정돈된 느낌입니다.</p>" },
  { id: "sample_post_momentum_qna", boardId: "board_audio_qna", authorId: "seed_user_qna", title: "Momentum 4와 Sony XM 시리즈 중 고민입니다", body: "<p>음악은 팝과 재즈를 많이 듣고, 출퇴근 노캔도 중요합니다. 음색은 Sennheiser가 궁금한데 노캔은 Sony가 낫다는 말이 많아 고민입니다.</p>" },
];

const comments: SeedComment[] = [
  { id: "sample_cmt_001", postId: "sample_post_7800x3d_4070", authorId: "seed_user_qna", body: "1440p 기준이면 이 조합 꽤 오래 쓸 수 있어 보이네요." },
  { id: "sample_cmt_002", postId: "sample_post_7800x3d_4070", authorId: "seed_user_parts", body: "팬 커브 세팅 값도 나중에 공유해주세요." },
  { id: "sample_cmt_003", postId: "sample_post_mt09_chain", authorId: "seed_user_editorial", body: "MT-09는 체인 관리만 해도 체감이 크더라고요." },
  { id: "sample_cmt_004", postId: "sample_post_wooting60he_mod", authorId: "seed_user_mechanic", body: "스페이스바 윤활 전후 차이가 제일 크게 느껴졌습니다." },
  { id: "sample_cmt_005", postId: "sample_post_eosr50", authorId: "seed_user_qna", body: "R50은 여행용으로 무게가 진짜 장점 같아요." },
  { id: "sample_cmt_006", postId: "sample_post_wh1000xm5", authorId: "seed_user_parts", body: "이어패드 관리도 같이 기록하면 좋을 것 같습니다." },
  { id: "sample_cmt_007", postId: "sample_post_domane_al4", authorId: "seed_user_mechanic", body: "처음 로드면 편한 지오메트리가 확실히 오래 타기 좋죠." },
  { id: "sample_cmt_008", postId: "sample_post_helinox", authorId: "seed_user_qna", body: "볼핏 유무 차이 궁금했는데 도움 됐습니다." },
  { id: "sample_cmt_009", postId: "sample_post_sff_4070_qna", authorId: "seed_user_editorial", body: "하단 흡기만 잘 잡으면 4070은 SFF에서도 할만합니다." },
  { id: "sample_cmt_010", postId: "sample_post_momentum_qna", authorId: "seed_user_editorial", body: "노캔 우선이면 Sony, 음악 감상 비중이 높으면 Sennheiser도 좋아요." },
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function seed(env: Env) {
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 500);

  const statements: D1PreparedStatement[] = [];

  for (const user of users) {
    statements.push(env.DB.prepare("INSERT OR IGNORE INTO users (id, email, nickname, provider) VALUES (?, ?, ?, 'seed')").bind(user.id, user.email, user.nickname));
  }

  for (const equipment of equipments) {
    statements.push(env.DB.prepare(
      `INSERT OR IGNORE INTO equipments
       (id, user_id, category, brand, model, nickname, slug, year, description, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 'normal', ?, ?)`,
    ).bind(equipment.id, equipment.userId, equipment.category, equipment.brand, equipment.model, equipment.nickname, equipment.slug, equipment.year, equipment.description, equipment.usageType, equipment.usageValue, baseTime, baseTime));
  }

  for (const log of logs) {
    statements.push(env.DB.prepare(
      `INSERT OR IGNORE INTO maintenance_logs
       (id, equipment_id, type, title, description, performed_at, usage_metric_value, cost, shop_name, is_public, visibility, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'public', 'normal', ?, ?)`,
    ).bind(log.id, log.equipmentId, log.type, log.title, log.description, log.performedAt, log.usageValue, log.cost, log.shop, log.performedAt, log.performedAt));
  }

  for (const part of parts) {
    statements.push(env.DB.prepare(
      `INSERT OR IGNORE INTO parts
       (id, equipment_id, category, brand, name, price, installed_at, memo, visibility, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', 'normal', ?, ?)`,
    ).bind(part.id, part.equipmentId, part.category, part.brand, part.name, part.price, baseTime - 2 * day, part.memo, baseTime - 2 * day, baseTime - 2 * day));
  }

  posts.forEach((post, index) => {
    const createdAt = baseTime - index * hour;
    statements.push(env.DB.prepare(
      `INSERT OR IGNORE INTO posts
       (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'published', 'public', 'normal', ?, ?)`,
    ).bind(post.id, post.boardId, post.authorId, post.title, post.body, createdAt, createdAt));
  });

  comments.forEach((comment, index) => {
    const createdAt = baseTime + index * 60_000;
    statements.push(env.DB.prepare(
      `INSERT OR IGNORE INTO comments
       (id, post_id, author_id, body, status, moderation_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'published', 'normal', ?, ?)`,
    ).bind(comment.id, comment.postId, comment.authorId, comment.body, createdAt, createdAt));
  });

  await env.DB.batch(statements);

  return json({
    ok: true,
    message: "Sample content seeded. Refresh the home page.",
    counts: {
      users: users.length,
      equipments: equipments.length,
      maintenanceLogs: logs.length,
      parts: parts.length,
      posts: posts.length,
      comments: comments.length,
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => seed(env);
export const onRequestPost: PagesFunction<Env> = async ({ env }) => seed(env);
