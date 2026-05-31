-- GearDuck community board topic update
-- Adds review/free boards and retires maintenance/parts boards from public navigation.

INSERT OR IGNORE INTO boards (id, slug, title, status, permission, category, type, description, sort_order)
VALUES
  ('board_motorcycle_review', 'motorcycle-review', '리뷰', 'active', 'public', 'motorcycle', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_motorcycle_free', 'motorcycle-free', '자유', 'active', 'public', 'motorcycle', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_pc_review', 'pc-review', '리뷰', 'active', 'public', 'pc', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_pc_free', 'pc-free', '자유', 'active', 'public', 'pc', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_keyboard_review', 'keyboard-review', '리뷰', 'active', 'public', 'keyboard', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_keyboard_free', 'keyboard-free', '자유', 'active', 'public', 'keyboard', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_bicycle_review', 'bicycle-review', '리뷰', 'active', 'public', 'bicycle', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_bicycle_free', 'bicycle-free', '자유', 'active', 'public', 'bicycle', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_camera_review', 'camera-review', '리뷰', 'active', 'public', 'camera', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_camera_free', 'camera-free', '자유', 'active', 'public', 'camera', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_camping_review', 'camping-review', '리뷰', 'active', 'public', 'camping', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_camping_free', 'camping-free', '자유', 'active', 'public', 'camping', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_audio_review', 'audio-review', '리뷰', 'active', 'public', 'audio', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_audio_free', 'audio-free', '자유', 'active', 'public', 'audio', 'free', '장비 이야기를 자유롭게 나누는 공간', 30),
  ('board_custom_review', 'custom-review', '리뷰', 'active', 'public', 'custom', 'review', '장비, 부품, 세팅, 사용 경험 리뷰', 20),
  ('board_custom_free', 'custom-free', '자유', 'active', 'public', 'custom', 'free', '장비 이야기를 자유롭게 나누는 공간', 30);

UPDATE boards
SET title = CASE type
    WHEN 'showcase' THEN '장비 자랑'
    WHEN 'review' THEN '리뷰'
    WHEN 'free' THEN '자유'
    WHEN 'qna' THEN '질문/상담'
    WHEN 'trade' THEN '중고/나눔'
    ELSE title
  END,
  description = CASE type
    WHEN 'showcase' THEN '내 장비 사진과 세팅을 공유하는 공간'
    WHEN 'review' THEN '장비, 부품, 세팅, 사용 경험 리뷰'
    WHEN 'free' THEN '장비 이야기를 자유롭게 나누는 공간'
    WHEN 'qna' THEN '구매, 세팅, 관리에 대한 질문 게시판'
    WHEN 'trade' THEN '장비와 부품 거래, 나눔 정보'
    ELSE description
  END,
  sort_order = CASE type
    WHEN 'showcase' THEN 10
    WHEN 'review' THEN 20
    WHEN 'free' THEN 30
    WHEN 'qna' THEN 40
    WHEN 'trade' THEN 50
    ELSE sort_order
  END,
  updated_at = unixepoch() * 1000
WHERE type IN ('showcase', 'review', 'free', 'qna', 'trade');

UPDATE boards
SET status = 'hidden', updated_at = unixepoch() * 1000
WHERE type IN ('maintenance', 'parts')
   OR slug LIKE '%-maintenance'
   OR slug LIKE '%-parts';
