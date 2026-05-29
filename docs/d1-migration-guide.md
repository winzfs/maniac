# D1 Migration Guide

Maniac Garage는 Cloudflare D1을 사용한다.

이 문서는 현재 `main` 브랜치의 실제 코드와 migration 흐름을 기준으로 D1 테이블, 적용 순서, local/remote 적용 방법, 주의사항을 정리한다.

---

## 현재 D1 설정

`wrangler.toml` 기준:

```toml
[[d1_databases]]
binding = "DB"
database_name = "maniac-garage-dev"
database_id = "3eb4039d-f12f-4d9b-be5a-047b2a714012"
```

Cloudflare Pages는 `wrangler.toml`의 binding 설정을 우선할 수 있으므로, D1 binding을 바꿀 때는 대시보드뿐 아니라 `wrangler.toml`도 함께 확인한다.

---

## 현재 MVP에서 사용하는 주요 테이블

```txt
users
equipments
maintenance_logs
parts
boards
posts
comments
```

현재 Drizzle schema에도 위 주요 테이블이 반영되어 있다.

```txt
src/server/db/schema/index.ts
```

추가로 장기 확장을 위한 아래 테이블 정의도 Drizzle schema와 `migrations/0001_initial.sql`에 존재한다.

```txt
user_roles
equipment_photos
reminders
themes
site_pages
site_sections
banners
notices
faq_items
reports
moderation_actions
admin_audit_logs
```

---

## Migration 파일

현재 repository에서 확인 가능한 migration 파일:

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
```

### 0001_initial.sql

포함 내용:

```txt
users
user_roles
equipments
equipment_photos
reminders
themes
site_pages
site_sections
banners
notices
faq_items
reports
moderation_actions
admin_audit_logs
dev_user_maniac seed
```

주의: `maintenance_logs`, `parts`, `boards`, `posts`, `comments`는 later migration과 충돌하지 않도록 `0001_initial.sql`에서 생성하지 않는다.

### 0002_add_maintenance_logs_and_parts.sql

포함 내용:

```txt
maintenance_logs table
maintenance_logs indexes
parts table
parts indexes
```

초기 개발 중 `functions/api/equipments/[id]/logs.ts`, `functions/api/equipments/[id]/parts.ts` 내부에 있던 런타임 `CREATE TABLE IF NOT EXISTS` 안전장치는 제거했다. 따라서 테이블 생성/변경은 migration 또는 D1 Console SQL을 기준으로 관리한다.

### 0003_add_boards_posts_comments.sql

포함 내용:

```txt
boards table
posts table
comments table
board seed data
initial post seed data
```

주의: seed post는 `author_id = dev_user_maniac`를 사용하므로, 적용 전 `0001_initial.sql`로 개발용 mock user가 생성되어 있어야 한다.

### 0004_add_board_metadata.sql

포함 내용:

```txt
boards.category
boards.type
boards.description
boards.sort_order
boards_category_sort_idx
기존 board metadata backfill
```

---

## 적용 순서

새 D1 데이터베이스에는 local/remote 모두 아래 순서로 적용한다.

```txt
0001_initial.sql
0002_add_maintenance_logs_and_parts.sql
0003_add_boards_posts_comments.sql
0004_add_board_metadata.sql
```

---

## Local D1 적용

로컬 개발 DB에는 `--local` 스크립트를 사용한다.

```bash
npm run d1:migrate:all:local
npm run d1:tables:local
```

개별 실행:

```bash
npm run d1:migrate:initial:local
npm run d1:migrate:local
npm run d1:migrate:community:local
npm run d1:migrate:board-meta:local
```

직접 Wrangler 명령으로 실행하려면 아래와 같다.

```bash
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0001_initial.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0002_add_maintenance_logs_and_parts.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0003_add_boards_posts_comments.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0004_add_board_metadata.sql
```

로컬 테이블 확인:

```bash
npx wrangler d1 execute maniac-garage-dev --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

주의:

```txt
1. wrangler d1 --local 데이터는 로컬 개발 환경에 저장된다.
2. 로컬 DB를 완전히 초기화하려면 Wrangler local D1 저장 위치를 삭제해야 할 수 있다.
3. 0002~0004는 완전한 idempotent migration이 아니므로 같은 DB에 반복 적용하면 ALTER/CREATE 중복 오류가 날 수 있다.
4. 새 로컬 DB 또는 초기화한 로컬 DB에 0001 → 0002 → 0003 → 0004 순서로 적용하는 흐름을 권장한다.
```

---

## Remote D1 적용

원격 Cloudflare D1에는 `--remote` 스크립트를 사용한다.

```bash
npm run d1:migrate:all:remote
npm run d1:tables:remote
```

개별 실행:

```bash
npm run d1:migrate:initial:remote
npm run d1:migrate:remote
npm run d1:migrate:community:remote
npm run d1:migrate:board-meta:remote
```

직접 Wrangler 명령으로 실행하려면 아래와 같다.

```bash
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0001_initial.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0002_add_maintenance_logs_and_parts.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0003_add_boards_posts_comments.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0004_add_board_metadata.sql
```

원격 테이블 확인:

```bash
npx wrangler d1 execute maniac-garage-dev --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

모바일 또는 Cloudflare 대시보드 중심으로 작업한다면 D1 Console에서 migration SQL 내용을 순서대로 붙여넣고 실행해도 된다.

---

## 적용 확인

핵심 MVP 테이블 확인 SQL:

```sql
SELECT name
FROM sqlite_master
WHERE type = 'table'
  AND name IN ('users', 'equipments', 'maintenance_logs', 'parts', 'boards', 'posts', 'comments')
ORDER BY name;
```

기대 결과:

```txt
boards
comments
equipments
maintenance_logs
parts
posts
users
```

seed 확인 SQL:

```sql
SELECT id, email, nickname, provider
FROM users
WHERE id = 'dev_user_maniac';

SELECT id, slug, title, status, permission
FROM boards
ORDER BY slug;
```

---

## 현재 상태

```txt
initial schema migration 추가 ✅
maintenance_logs / parts migration 분리 ✅
boards / posts / comments migration 추가 ✅
board metadata migration 추가 ✅
local D1 적용용 package scripts 추가 ✅
remote D1 적용용 package scripts 추가 ✅
local/remote 전체 migration 실행 script 추가 ✅
API 내부 runtime ensureTable 제거 ✅
Drizzle schema에 핵심 MVP 테이블 반영 ✅
```

---

## 주의사항

```txt
1. Drizzle schema와 SQL migration을 변경할 때는 둘 다 함께 수정해야 한다.
2. 운영 환경에서 mock user 기반 쓰기는 APP_ENV=production일 때 차단된다.
3. 실제 로그인 연결 후에는 MOCK_USER_ID 대신 세션 userId 기준으로 권한 검증을 통일해야 한다.
4. 게시글 HTML은 서버 저장 전 sanitize를 적용하지만, 장기적으로는 검증된 sanitizer 라이브러리나 더 엄격한 allowlist 정책을 검토한다.
5. 기존 DB에 0001을 나중에 재적용해도 CREATE TABLE IF NOT EXISTS / INSERT OR IGNORE 중심이라 비교적 안전하다.
6. 0002~0004는 같은 DB에 반복 적용하면 중복 오류가 날 수 있으므로 migration 적용 이력 관리 방식이 필요하다.
```

---

## 다음 정리 작업

```txt
1. migration 적용 이력 관리 방식 검토
2. 실제 로그인 연결 후 user_id 기준 권한 검증 정리
3. R2 업로드 도입 후 data URL 저장 방식 제거
4. OpenNext 또는 Workers 런타임 전환 검토
```
