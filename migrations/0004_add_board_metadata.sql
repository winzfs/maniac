-- Maniac Garage D1 migration
-- Adds board metadata used by the real explore/category structure.

ALTER TABLE boards ADD COLUMN category TEXT;
ALTER TABLE boards ADD COLUMN type TEXT;
ALTER TABLE boards ADD COLUMN description TEXT;
ALTER TABLE boards ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS boards_category_sort_idx
  ON boards (category, sort_order);

UPDATE boards
SET category = substr(slug, 1, instr(slug || '-', '-') - 1);

UPDATE boards
SET type = CASE
  WHEN slug LIKE '%-showcase' THEN 'showcase'
  WHEN slug LIKE '%-maintenance' THEN 'maintenance'
  WHEN slug LIKE '%-parts' THEN 'parts'
  WHEN slug LIKE '%-qna' THEN 'qna'
  WHEN slug LIKE '%-trade' THEN 'trade'
  ELSE 'showcase'
END;

UPDATE boards
SET description = CASE type
  WHEN 'showcase' THEN '내 장비 사진과 세팅을 공유하는 공간'
  WHEN 'maintenance' THEN '정비 이력, 관리 팁, 소모품 교체 경험'
  WHEN 'parts' THEN '사용한 부품, 튜닝 파츠, 만족도 리뷰'
  WHEN 'qna' THEN '구매, 세팅, 관리에 대한 질문 게시판'
  WHEN 'trade' THEN '부품 거래와 양도 정보를 나누는 공간'
  ELSE '장비 마니아를 위한 게시판'
END;

UPDATE boards
SET sort_order = CASE type
  WHEN 'showcase' THEN 10
  WHEN 'maintenance' THEN 20
  WHEN 'parts' THEN 30
  WHEN 'qna' THEN 40
  WHEN 'trade' THEN 50
  ELSE 90
END;
