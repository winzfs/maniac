-- Maniac Garage optional seed
-- Adds realistic sample posts based on real-world equipment names across categories.
-- This is content seed data, not a required schema migration.
-- Safe to run multiple times because every row uses INSERT OR IGNORE.

INSERT OR IGNORE INTO users (id, email, nickname, provider)
VALUES
  ('seed_user_editorial', 'seed-editorial@maniac-garage.local', 'Gear Editor', 'seed'),
  ('seed_user_mechanic', 'seed-mechanic@maniac-garage.local', '정비노트', 'seed'),
  ('seed_user_parts', 'seed-parts@maniac-garage.local', '부품리뷰어', 'seed'),
  ('seed_user_qna', 'seed-qna@maniac-garage.local', '궁금한마니아', 'seed');

INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status, created_at, updated_at)
VALUES
  ('sample_motorcycle_showcase_ninja400', 'board_motorcycle_showcase', 'seed_user_editorial', 'Kawasaki Ninja 400 입문 스포츠 세팅 기록', '<p>Ninja 400은 399cc 병렬 트윈 스포츠 바이크라 입문용이지만 차체가 가볍고 자세가 과하지 않아서 주말 와인딩과 출퇴근을 같이 쓰기 좋았습니다.</p><p>현재 세팅은 순정 위주로 유지하고, 타이어 공기압과 체인 장력만 주기적으로 체크하는 방향입니다. 다음 기록은 브레이크 패드와 엔진오일 교환 주기로 남겨볼 예정입니다.</p>', 'published', 'public', 'normal', 1764240000000, 1764240000000),
  ('sample_motorcycle_maintenance_mt09', 'board_motorcycle_maintenance', 'seed_user_mechanic', 'Yamaha MT-09 체인 청소와 장력 조절 메모', '<p>MT-09는 토크가 강해서 체인 상태가 체감에 꽤 크게 느껴집니다. 오늘은 세척 후 루브 도포, 장력 확인, 뒤 스프로킷 마모 상태까지 같이 봤습니다.</p><ul><li>체인 세척 후 완전 건조</li><li>주행 전후 장력 차이 확인</li><li>뒤 타이어 중심 정렬 눈금 재확인</li></ul>', 'published', 'public', 'normal', 1764236400000, 1764236400000),
  ('sample_motorcycle_parts_street_triple', 'board_motorcycle_parts', 'seed_user_parts', 'Triumph Street Triple 핸들바 그립 교체 후기', '<p>Street Triple에 조금 더 두꺼운 그립을 장착했습니다. 손바닥 피로감은 줄었고, 진동은 약간 둔해졌습니다.</p><p>스포츠 주행보다 시내/장거리 비중이 높다면 만족도가 높은 교체였습니다. 다만 스로틀 감각이 예민한 분은 장착 직후 적응이 필요합니다.</p>', 'published', 'public', 'normal', 1764232800000, 1764232800000),
  ('sample_motorcycle_qna_z400', 'board_motorcycle_qna', 'seed_user_qna', 'Kawasaki Z400이 Ninja 400보다 출퇴근에 편한가요?', '<p>Ninja 400과 Z400 중 고민 중입니다. 같은 계열 엔진이라 유지비는 비슷해 보이는데, 시내 위주면 네이키드 포지션인 Z400이 확실히 편할까요?</p><p>주말에는 왕복 150km 정도 투어도 생각하고 있습니다.</p>', 'published', 'public', 'normal', 1764229200000, 1764229200000),

  ('sample_pc_showcase_7800x3d_4070', 'board_pc_showcase', 'seed_user_editorial', 'Ryzen 7 7800X3D + RTX 4070 1440p 게이밍 빌드', '<p>게임 위주로 맞춘 AM5 빌드입니다. Ryzen 7 7800X3D와 RTX 4070 조합으로 1440p 고주사율을 목표로 했고, 케이스는 공기 흐름 좋은 미들타워를 사용했습니다.</p><p>온도보다 소음이 더 중요해서 팬 커브를 완만하게 잡았고, CPU는 별도 오버 없이 EXPO 메모리만 적용했습니다.</p>', 'published', 'public', 'normal', 1764225600000, 1764225600000),
  ('sample_pc_maintenance_fractal_north', 'board_pc_maintenance', 'seed_user_mechanic', 'Fractal North 케이스 먼지 청소 루틴', '<p>전면 메쉬와 하단 필터에 먼지가 빨리 쌓여서 3주마다 청소하는 루틴을 만들었습니다.</p><ul><li>전원 분리 후 10분 대기</li><li>전면 필터 분리 세척</li><li>상단 배기팬 먼지 제거</li><li>GPU 방열판은 블로워로 약하게 청소</li></ul>', 'published', 'public', 'normal', 1764222000000, 1764222000000),
  ('sample_pc_parts_noctua_d15', 'board_pc_parts', 'seed_user_parts', 'Noctua NH-D15 장착 후 소음 변화', '<p>대형 공랭 쿨러로 바꾸니 풀로드 온도보다 체감 소음이 크게 줄었습니다. 케이스 폭과 RAM 간섭은 꼭 확인해야 합니다.</p><p>장착 난이도는 낮은 편이지만, 보드에 올리기 전에 팬 클립 방향을 미리 잡아두는 게 좋았습니다.</p>', 'published', 'public', 'normal', 1764218400000, 1764218400000),
  ('sample_pc_qna_sff_4070', 'board_pc_qna', 'seed_user_qna', 'RTX 4070 SFF 케이스 발열 괜찮을까요?', '<p>작은 케이스에 RTX 4070을 넣고 싶은데, 2슬롯 모델이면 장시간 게임에서 온도가 너무 높아질까요?</p><p>현재 후보는 NR200P급 케이스이고, 하단 흡기/상단 배기 구성으로 생각 중입니다.</p>', 'published', 'public', 'normal', 1764214800000, 1764214800000),

  ('sample_keyboard_showcase_q1he', 'board_keyboard_showcase', 'seed_user_editorial', 'Keychron Q1 HE 75% 자석축 데스크 셋업', '<p>Q1 HE는 75% 배열이라 책상 공간을 많이 차지하지 않으면서 방향키와 펑션열을 유지할 수 있어서 데일리로 쓰기 좋았습니다.</p><p>마그네틱 스위치 특유의 입력 깊이 조절이 가능해서 게임용 프로필과 타이핑용 프로필을 따로 저장해두고 사용 중입니다.</p>', 'published', 'public', 'normal', 1764211200000, 1764211200000),
  ('sample_keyboard_parts_wooting60he', 'board_keyboard_parts', 'seed_user_parts', 'Wooting 60HE 키캡 교체와 흡음재 조합', '<p>60% 배열에 익숙해지면 마우스 공간이 넓어져서 FPS 게임에서는 확실히 편합니다. 순정 상태도 빠르지만 소리는 취향을 탈 수 있어 흡음재를 추가했습니다.</p><p>PBT 키캡으로 바꾸니 타건음이 조금 더 낮아지고, 스페이스바는 윤활 후 안정감이 좋아졌습니다.</p>', 'published', 'public', 'normal', 1764207600000, 1764207600000),
  ('sample_keyboard_maintenance_hhkb', 'board_keyboard_maintenance', 'seed_user_mechanic', 'HHKB Professional 키캡 세척 기록', '<p>장기간 사용한 HHKB 키캡을 분리해서 미지근한 물과 중성세제로 세척했습니다. 완전 건조 전 장착하면 스테빌라이저 쪽에 습기가 남을 수 있어 하루 정도 말렸습니다.</p><p>토프레 러버돔은 분해 난이도가 있어서 이번에는 키캡과 하우징 외부만 관리했습니다.</p>', 'published', 'public', 'normal', 1764204000000, 1764204000000),
  ('sample_keyboard_qna_qmk_via', 'board_keyboard_qna', 'seed_user_qna', 'QMK/VIA 지원 키보드가 처음이면 뭘 보면 될까요?', '<p>키매핑을 자주 바꿀 예정이라 QMK/VIA 지원 모델을 보고 있습니다. Keychron Q 시리즈나 Neo 계열처럼 핫스왑 가능한 모델부터 시작하면 괜찮을까요?</p><p>주 용도는 코딩 70%, 게임 30%입니다.</p>', 'published', 'public', 'normal', 1764200400000, 1764200400000),

  ('sample_bicycle_showcase_domane_al4', 'board_bicycle_showcase', 'seed_user_editorial', 'Trek Domane AL 4 장거리 입문 로드 세팅', '<p>Domane AL 4는 편한 지오메트리와 알루미늄 프레임 조합이라 첫 로드 자전거로 부담이 적었습니다.</p><p>기본 타이어는 안정적이지만, 장거리 위주라면 펑크 방지와 승차감 사이에서 타이어 선택이 중요합니다.</p>', 'published', 'public', 'normal', 1764196800000, 1764196800000),
  ('sample_bicycle_maintenance_allez', 'board_bicycle_maintenance', 'seed_user_mechanic', 'Specialized Allez Sport 변속 트러블 잡은 기록', '<p>뒷 변속이 5~6단 부근에서 튀어서 행어 정렬과 케이블 장력을 확인했습니다. 큰 문제는 아니었고 배럴 조정으로 대부분 해결됐습니다.</p><p>체인 오염이 심하면 변속 세팅을 맞춰도 소음이 남기 때문에 세척을 먼저 하는 게 좋았습니다.</p>', 'published', 'public', 'normal', 1764193200000, 1764193200000),
  ('sample_bicycle_parts_gp5000', 'board_bicycle_parts', 'seed_user_parts', 'Continental GP5000 교체 후 첫 100km 느낌', '<p>기존 입문용 타이어에서 GP5000으로 바꾸니 구름성과 코너링 신뢰감이 좋아졌습니다. 승차감도 공기압만 잘 맞추면 꽤 편합니다.</p><p>장착 난이도는 림에 따라 다르지만, 타이어 레버를 과하게 쓰지 않도록 조심했습니다.</p>', 'published', 'public', 'normal', 1764189600000, 1764189600000),
  ('sample_bicycle_qna_sirrusx', 'board_bicycle_qna', 'seed_user_qna', 'Specialized Sirrus X로 출퇴근+가벼운 그래블 가능할까요?', '<p>평일엔 왕복 18km 출퇴근, 주말엔 한강/임도 초입 정도를 생각 중입니다. Sirrus X 같은 플랫바 하이브리드가 로드보다 편할지 궁금합니다.</p>', 'published', 'public', 'normal', 1764186000000, 1764186000000),

  ('sample_camera_showcase_eosr50', 'board_camera_showcase', 'seed_user_editorial', 'Canon EOS R50 입문 미러리스 여행 세팅', '<p>EOS R50은 작고 가벼운 APS-C 미러리스라 여행용으로 들고 다니기 좋았습니다. RF-S 18-45mm 번들렌즈는 가볍고, 낮 시간 스냅 위주라면 충분했습니다.</p><p>다음에는 RF-S 55-210mm를 추가해서 망원 구간까지 커버해볼 생각입니다.</p>', 'published', 'public', 'normal', 1764182400000, 1764182400000),
  ('sample_camera_parts_x100vi_filter', 'board_camera_parts', 'seed_user_parts', 'Fujifilm X100VI 보호필터와 후드 조합', '<p>X100VI는 매일 들고 다니는 카메라라 렌즈 보호와 휴대성이 중요했습니다. 슬림 후드와 보호필터 조합으로 가방 넣고 빼기가 편해졌습니다.</p><p>필터 링 높이에 따라 렌즈캡 호환이 달라질 수 있어서 구매 전 확인이 필요합니다.</p>', 'published', 'public', 'normal', 1764178800000, 1764178800000),
  ('sample_camera_maintenance_a7iv_sensor', 'board_camera_maintenance', 'seed_user_mechanic', 'Sony A7 IV 센서 먼지 확인과 블로워 청소', '<p>조리개를 조이고 하늘을 찍어보니 작은 먼지가 보여서 블로워로 1차 청소했습니다. 젖은 클리닝은 아직 자신이 없어서 센터 방문 전까진 렌즈 교체를 조심하려고 합니다.</p>', 'published', 'public', 'normal', 1764175200000, 1764175200000),
  ('sample_camera_qna_r50_lens', 'board_camera_qna', 'seed_user_qna', 'Canon EOS R50 다음 렌즈는 단렌즈가 좋을까요?', '<p>번들렌즈로 시작했는데 실내에서 아쉬움이 있습니다. 인물과 카페 스냅 위주면 밝은 단렌즈를 먼저 가는 게 좋을까요, 아니면 망원 줌을 추가하는 게 좋을까요?</p>', 'published', 'public', 'normal', 1764171600000, 1764171600000),

  ('sample_camping_showcase_helinox', 'board_camping_showcase', 'seed_user_editorial', 'Helinox Chair One 백패킹 의자 세팅', '<p>가볍게 들고 다닐 의자로 Chair One을 사용 중입니다. 수납 부피가 작고 조립이 쉬워서 야간 피칭 후에도 부담이 적었습니다.</p><p>지면이 무르면 다리 끝이 파고들 수 있어 볼핏이나 작은 받침을 같이 챙기는 편입니다.</p>', 'published', 'public', 'normal', 1764168000000, 1764168000000),
  ('sample_camping_maintenance_msr_stove', 'board_camping_maintenance', 'seed_user_mechanic', 'MSR PocketRocket 스토브 사용 후 관리', '<p>가스 스토브는 사용 후 버너 헤드 이물질만 잘 제거해도 점화가 안정적입니다. 수납 전 완전히 식히고, 케이스 안에 습기가 차지 않게 분리 보관했습니다.</p>', 'published', 'public', 'normal', 1764164400000, 1764164400000),
  ('sample_camping_parts_snowpeak_mug', 'board_camping_parts', 'seed_user_parts', 'Snow Peak 티타늄 머그 450 사용 후기', '<p>티타늄 머그는 가볍고 녹 걱정이 적어서 백패킹에 잘 맞았습니다. 직접 불에 올리면 변색은 생기지만 사용감으로 받아들이면 오히려 매력입니다.</p><p>단점은 얇아서 뜨거운 음료를 오래 들고 있으면 손이 뜨겁습니다.</p>', 'published', 'public', 'normal', 1764160800000, 1764160800000),
  ('sample_camping_qna_hubba', 'board_camping_qna', 'seed_user_qna', 'MSR Hubba Hubba를 2인 백패킹용으로 쓰기 괜찮나요?', '<p>2명이 가끔 백패킹을 가는데 Hubba Hubba급 텐트가 무게와 공간 균형이 괜찮을지 궁금합니다. 주로 봄/가을 산 아래 캠핑장과 임도 근처를 생각 중입니다.</p>', 'published', 'public', 'normal', 1764157200000, 1764157200000),

  ('sample_audio_showcase_wh1000xm5', 'board_audio_showcase', 'seed_user_editorial', 'Sony WH-1000XM5 출퇴근 노이즈캔슬링 세팅', '<p>지하철 출퇴근용으로 WH-1000XM5를 사용 중입니다. 노이즈캔슬링은 강하게 두고, EQ는 저역을 조금 줄여 장시간 들어도 피곤하지 않게 맞췄습니다.</p><p>여름에는 이어패드 열감이 있어서 장거리 이동용으로 더 만족도가 높았습니다.</p>', 'published', 'public', 'normal', 1764153600000, 1764153600000),
  ('sample_audio_parts_hd600_pad', 'board_audio_parts', 'seed_user_parts', 'Sennheiser HD 600 이어패드 교체 체감', '<p>오래 쓴 HD 600은 패드가 눌리면서 소리와 착용감이 같이 변했습니다. 새 패드로 교체하니 귀와 드라이버 사이 거리가 돌아와서 중역이 조금 더 정돈된 느낌입니다.</p>', 'published', 'public', 'normal', 1764150000000, 1764150000000),
  ('sample_audio_maintenance_turntable', 'board_audio_maintenance', 'seed_user_mechanic', 'Audio-Technica AT-LP120X 바늘 청소 루틴', '<p>턴테이블은 바늘 먼지가 쌓이면 치찰음과 노이즈가 바로 느껴집니다. 전용 브러시로 뒤에서 앞으로 가볍게 쓸어주고, 레코드도 재생 전 먼지를 제거했습니다.</p>', 'published', 'public', 'normal', 1764146400000, 1764146400000),
  ('sample_audio_qna_momentum', 'board_audio_qna', 'seed_user_qna', 'Sennheiser Momentum 4와 Sony XM 시리즈 중 고민입니다', '<p>음악은 팝/재즈를 많이 듣고, 출퇴근 노캔도 중요합니다. 음색은 Momentum 쪽이 궁금한데 노캔은 Sony가 낫다는 이야기가 많아서 고민입니다.</p>', 'published', 'public', 'normal', 1764142800000, 1764142800000);

INSERT OR IGNORE INTO comments (id, post_id, author_id, body, status, moderation_status, created_at, updated_at)
VALUES
  ('sample_comment_001', 'sample_pc_showcase_7800x3d_4070', 'seed_user_qna', '1440p 기준이면 이 조합 꽤 오래 쓸 수 있어 보이네요.', 'published', 'normal', 1764240300000, 1764240300000),
  ('sample_comment_002', 'sample_pc_showcase_7800x3d_4070', 'seed_user_parts', '팬 커브 세팅 값도 나중에 공유해주세요.', 'published', 'normal', 1764240600000, 1764240600000),
  ('sample_comment_003', 'sample_motorcycle_maintenance_mt09', 'seed_user_editorial', 'MT-09는 체인 관리만 해도 체감이 크더라고요.', 'published', 'normal', 1764240900000, 1764240900000),
  ('sample_comment_004', 'sample_keyboard_parts_wooting60he', 'seed_user_mechanic', '스페이스바 윤활 전후 차이가 제일 크게 느껴졌습니다.', 'published', 'normal', 1764241200000, 1764241200000),
  ('sample_comment_005', 'sample_camera_showcase_eosr50', 'seed_user_qna', 'R50은 여행용으로 무게가 진짜 장점 같아요.', 'published', 'normal', 1764241500000, 1764241500000),
  ('sample_comment_006', 'sample_audio_showcase_wh1000xm5', 'seed_user_parts', '이어패드 관리도 같이 기록하면 좋을 것 같습니다.', 'published', 'normal', 1764241800000, 1764241800000),
  ('sample_comment_007', 'sample_bicycle_showcase_domane_al4', 'seed_user_mechanic', '처음 로드면 편한 지오메트리가 확실히 오래 타기 좋죠.', 'published', 'normal', 1764242100000, 1764242100000),
  ('sample_comment_008', 'sample_camping_showcase_helinox', 'seed_user_qna', '볼핏 유무 차이 궁금했는데 도움 됐습니다.', 'published', 'normal', 1764242400000, 1764242400000),
  ('sample_comment_009', 'sample_pc_qna_sff_4070', 'seed_user_editorial', '하단 흡기만 잘 잡으면 4070은 SFF에서도 할만합니다.', 'published', 'normal', 1764242700000, 1764242700000),
  ('sample_comment_010', 'sample_audio_qna_momentum', 'seed_user_editorial', '노캔 우선이면 Sony, 음악 감상 비중이 높으면 Sennheiser도 좋아요.', 'published', 'normal', 1764243000000, 1764243000000);
