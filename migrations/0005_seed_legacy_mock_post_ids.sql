-- Maniac Garage D1 migration
-- Keeps old mock post URLs usable after moving post detail pages to DB/API.

INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status)
VALUES
  (
    'motorcycle-showcase-post-1',
    'board_motorcycle_showcase',
    'dev_user_maniac',
    '바이크 장비 자랑 첫 번째 기록',
    '기존 mock 게시글 상세 URL과 호환하기 위한 DB seed 게시글입니다. 실제 서비스에서는 유저가 작성한 게시글이 이 위치에 표시됩니다.',
    'published',
    'public',
    'normal'
  ),
  (
    'motorcycle-showcase-post-2',
    'board_motorcycle_showcase',
    'dev_user_maniac',
    '장비 자랑 체크리스트 공유',
    '기존 mock 게시글 두 번째 예시와 호환하기 위한 DB seed 게시글입니다.',
    'published',
    'public',
    'normal'
  ),
  (
    'motorcycle-maintenance-post-1',
    'board_motorcycle_maintenance',
    'dev_user_maniac',
    '정비/관리 기록 첫 번째 기록',
    '정비 게시판의 기존 mock URL과 호환하기 위한 seed 게시글입니다.',
    'published',
    'public',
    'normal'
  ),
  (
    'motorcycle-parts-post-1',
    'board_motorcycle_parts',
    'dev_user_maniac',
    '부품/튜닝 리뷰 첫 번째 기록',
    '부품 게시판의 기존 mock URL과 호환하기 위한 seed 게시글입니다.',
    'published',
    'public',
    'normal'
  );
