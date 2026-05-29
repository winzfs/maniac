-- Maniac Garage D1 migration
-- Adds community board/post/comment tables and seed boards for the explore MVP.

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  permission TEXT NOT NULL DEFAULT 'public',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE UNIQUE INDEX IF NOT EXISTS boards_slug_unique
  ON boards (slug);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  visibility TEXT NOT NULL DEFAULT 'public',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS posts_board_created_idx
  ON posts (board_id, created_at);

CREATE INDEX IF NOT EXISTS posts_visibility_idx
  ON posts (visibility, moderation_status);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS comments_post_created_idx
  ON comments (post_id, created_at);

INSERT OR IGNORE INTO boards (id, slug, title, status, permission)
VALUES
  ('board_motorcycle_showcase', 'motorcycle-showcase', '장비 자랑', 'active', 'public'),
  ('board_motorcycle_maintenance', 'motorcycle-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_motorcycle_parts', 'motorcycle-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_motorcycle_qna', 'motorcycle-qna', '질문/상담', 'active', 'public'),
  ('board_motorcycle_trade', 'motorcycle-trade', '중고 부품', 'active', 'public'),
  ('board_pc_showcase', 'pc-showcase', '장비 자랑', 'active', 'public'),
  ('board_pc_maintenance', 'pc-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_pc_parts', 'pc-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_pc_qna', 'pc-qna', '질문/상담', 'active', 'public'),
  ('board_keyboard_showcase', 'keyboard-showcase', '장비 자랑', 'active', 'public'),
  ('board_keyboard_maintenance', 'keyboard-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_keyboard_parts', 'keyboard-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_keyboard_qna', 'keyboard-qna', '질문/상담', 'active', 'public'),
  ('board_bicycle_showcase', 'bicycle-showcase', '장비 자랑', 'active', 'public'),
  ('board_bicycle_maintenance', 'bicycle-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_bicycle_parts', 'bicycle-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_bicycle_qna', 'bicycle-qna', '질문/상담', 'active', 'public'),
  ('board_camera_showcase', 'camera-showcase', '장비 자랑', 'active', 'public'),
  ('board_camera_maintenance', 'camera-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_camera_parts', 'camera-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_camera_qna', 'camera-qna', '질문/상담', 'active', 'public'),
  ('board_camping_showcase', 'camping-showcase', '장비 자랑', 'active', 'public'),
  ('board_camping_maintenance', 'camping-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_camping_parts', 'camping-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_camping_qna', 'camping-qna', '질문/상담', 'active', 'public'),
  ('board_audio_showcase', 'audio-showcase', '장비 자랑', 'active', 'public'),
  ('board_audio_maintenance', 'audio-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_audio_parts', 'audio-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_audio_qna', 'audio-qna', '질문/상담', 'active', 'public'),
  ('board_custom_showcase', 'custom-showcase', '장비 자랑', 'active', 'public'),
  ('board_custom_maintenance', 'custom-maintenance', '정비/관리 기록', 'active', 'public'),
  ('board_custom_parts', 'custom-parts', '부품/튜닝 리뷰', 'active', 'public'),
  ('board_custom_qna', 'custom-qna', '질문/상담', 'active', 'public');

INSERT OR IGNORE INTO posts (id, board_id, author_id, title, body, status, visibility, moderation_status)
VALUES
  ('post_motorcycle_showcase_1', 'board_motorcycle_showcase', 'dev_user_maniac', '바이크 장비 자랑 첫 번째 기록', 'DB 기반 게시글 목록 전환을 확인하기 위한 초기 seed 게시글입니다.', 'published', 'public', 'normal'),
  ('post_motorcycle_maintenance_1', 'board_motorcycle_maintenance', 'dev_user_maniac', '엔진오일 교환 체크리스트', '정비 기록 게시판의 초기 seed 게시글입니다.', 'published', 'public', 'normal'),
  ('post_motorcycle_parts_1', 'board_motorcycle_parts', 'dev_user_maniac', '튜닝 파츠 장착 후기', '부품 리뷰 게시판의 초기 seed 게시글입니다.', 'published', 'public', 'normal');
