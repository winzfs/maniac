-- Maniac Garage D1 migration
-- Ensures the public explore demo posts exist for smoke testing.

INSERT OR IGNORE INTO users (id, email, nickname, provider)
VALUES ('dev_user_maniac', 'dev@maniac.local', 'maniac', 'mock');

INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status)
VALUES
  (
    'post_motorcycle_showcase_1',
    'board_motorcycle_showcase',
    'dev_user_maniac',
    '바이크 장비 자랑 첫 번째 기록',
    'DB 기반 게시글 상세 전환을 확인하기 위한 초기 공개 게시글입니다.\n\n이 글은 /explore/post/?id=post_motorcycle_showcase_1 경로에서 D1 posts 테이블을 통해 렌더링됩니다.',
    'published',
    'public',
    'normal'
  ),
  (
    'post_motorcycle_maintenance_1',
    'board_motorcycle_maintenance',
    'dev_user_maniac',
    '엔진오일 교환 체크리스트',
    '정비 기록 게시판의 초기 공개 게시글입니다.\n\n실제 서비스에서는 유저가 작성한 정비 기록형 게시글이 이 테이블에 저장됩니다.',
    'published',
    'public',
    'normal'
  ),
  (
    'post_motorcycle_parts_1',
    'board_motorcycle_parts',
    'dev_user_maniac',
    '튜닝 파츠 장착 후기',
    '부품 리뷰 게시판의 초기 공개 게시글입니다.\n\n실제 서비스에서는 장착 부품 후기와 구매 링크, 이미지 등이 연결될 예정입니다.',
    'published',
    'public',
    'normal'
  );

INSERT OR IGNORE INTO comments (id, post_id, author_id, body, status, moderation_status)
VALUES
  (
    'comment_motorcycle_showcase_1',
    'post_motorcycle_showcase_1',
    'dev_user_maniac',
    'DB 기반 댓글 렌더링 확인용 댓글입니다.',
    'published',
    'normal'
  );
