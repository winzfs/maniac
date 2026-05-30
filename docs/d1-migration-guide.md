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
auth_sessions
equipments
maintenance_logs
parts
boards
posts
comments
image_assets
news_items
```

현재 Drizzle schema에도 핵심 도메인 테이블이 반영되어 있다.

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

현재 repository에서 사용하는 migration 파일:

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
migrations/0005_add_auth_tables.sql
migrations/0006_seed_real_equipment_posts.sql       // 선택 seed
migrations/0007_add_user_profile_fields.sql
migrations/0008_create_image_assets.sql
migrations/0009_add_news_items.sql
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

주의: `maintenance_logs`, `parts`, `boards`, `posts`, `comments`, `auth_sessions`, `image_assets`, `news_items`는 later migration과 충돌하지 않도록 `0001_initial.sql`에서 생성하지 않는다.

### 0002_add_maintenance_logs_and_parts.sql

포함 내용:

```txt
maintenance_logs table
maintenance_logs indexes
parts table
parts indexes
```

정비 기록과 부품 기록 API가 사용하는 테이블을 생성한다.

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

### 0005_add_auth_tables.sql

포함 내용:

```txt
users.credential_hash
users.password_salt
auth_sessions table
auth_sessions indexes
```

이 migration 이후 이메일/비밀번호 회원가입, 로그인, HttpOnly 쿠키 기반 세션 인증을 사용할 수 있다.

### 0006_seed_real_equipment_posts.sql

선택 seed 파일이다. schema migration이 아니므로 새 DB 구성 시 필수 적용 대상은 아니다.

포함 내용:

```txt
샘플 장비/게시글/댓글 콘텐츠
```

운영 DB에는 필요한 경우에만 적용한다.

### 0007_add_user_profile_fields.sql

포함 내용:

```txt
users.bio
```

내 정보/프로필 설정 화면에서 사용하는 사용자 소개 필드를 추가한다.

### 0008_create_image_assets.sql

포함 내용:

```txt
image_assets table
image_assets indexes
users.profile_image_asset_id
equipments.main_image_asset_id
```

Cloudinary, Supabase Storage, 향후 R2 이전을 위한 provider 중립 이미지 메타데이터를 저장한다.

### 0009_add_news_items.sql

포함 내용:

```txt
news_items table
news_items_link_unique
news_items_published_idx
news_items_category_published_idx
```

외부 장비 뉴스 RSS를 D1에 캐시하기 위한 테이블이다. `GET /api/news`는 이 테이블에 데이터가 있으면 DB 캐시를 우선 사용하고, 테이블이 없거나 비어 있으면 RSS fallback으로 동작한다.

---

## 적용 순서

새 D1 데이터베이스에는 local/remote 모두 아래 순서로 적용한다.

```txt
0001_initial.sql
0002_add_maintenance_logs_and_parts.sql
0003_add_boards_posts_comments.sql
0004_add_board_metadata.sql
0005_add_auth_tables.sql
0007_add_user_profile_fields.sql
0008_create_image_assets.sql
0009_add_news_items.sql
```

`0006_seed_real_equipment_posts.sql`는 선택 seed이므로, schema migration 체인에는 포함하지 않는다. 샘플 콘텐츠가 필요할 때만 별도로 적용한다.

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
npm run d1:migrate:auth:local
npm run d1:migrate:profile:local
npm run d1:migrate:images:local
npm run d1:migrate:news:local
```

선택 seed:

```bash
npm run d1:seed:samples:local
```

직접 Wrangler 명령으로 실행하려면 아래와 같다.

```bash
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0001_initial.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0002_add_maintenance_logs_and_parts.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0003_add_boards_posts_comments.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0004_add_board_metadata.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0005_add_auth_tables.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0007_add_user_profile_fields.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0008_create_image_assets.sql
npx wrangler d1 execute maniac-garage-dev --local --file migrations/0009_add_news_items.sql
```

로컬 테이블 확인:

```bash
npx wrangler d1 execute maniac-garage-dev --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

주의:

```txt
1. wrangler d1 --local 데이터는 로컬 개발 환경에 저장된다.
2. 로컬 DB를 완전히 초기화하려면 Wrangler local D1 저장 위치를 삭제해야 할 수 있다.
3. 0002~0009 중 일부 ALTER migration은 같은 DB에 반복 적용하면 중복 컬럼 오류가 날 수 있다.
4. 새 로컬 DB 또는 초기화한 로컬 DB에 0001 → 0002 → 0003 → 0004 → 0005 → 0007 → 0008 → 0009 순서로 적용하는 흐름을 권장한다.
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
npm run d1:migrate:auth:remote
npm run d1:migrate:profile:remote
npm run d1:migrate:images:remote
npm run d1:migrate:news:remote
```

선택 seed:

```bash
npm run d1:seed:samples:remote
```

직접 Wrangler 명령으로 실행하려면 아래와 같다.

```bash
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0001_initial.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0002_add_maintenance_logs_and_parts.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0003_add_boards_posts_comments.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0004_add_board_metadata.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0005_add_auth_tables.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0007_add_user_profile_fields.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0008_create_image_assets.sql
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0009_add_news_items.sql
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
  AND name IN (
    'users',
    'auth_sessions',
    'equipments',
    'maintenance_logs',
    'parts',
    'boards',
    'posts',
    'comments',
    'image_assets',
    'news_items'
  )
ORDER BY name;
```

기대 결과:

```txt
auth_sessions
boards
comments
equipments
image_assets
maintenance_logs
news_items
parts
posts
users
```

seed 확인 SQL:

```sql
SELECT id, email, nickname, provider
FROM users
WHERE id = 'dev_user_maniac';
```

뉴스 캐시 테이블 확인 SQL:

```sql
SELECT COUNT(*) AS count
FROM news_items;
```

---

## Schema drift 대응

운영 D1에 migration이 일부 빠진 상태에서 최신 코드가 배포되면 `no such column`, `no such table` 오류가 발생할 수 있다.

정식 해결은 migration 적용이다.

```bash
npm run d1:migrate:all:remote
```

다만 모바일 환경 등에서 즉시 migration을 실행하기 어려운 상황을 대비해 일부 API에는 self-healing helper가 있다.

```txt
functions/_shared/ensure-garage-schema.ts
```

자동 보강 대상:

```txt
equipments
maintenance_logs
parts
관련 index
main_image_url
main_image_asset_id
```

프로필/이미지 업로드 관련 API도 필요한 경우 아래를 자동 보강한다.

```txt
users.bio
users.profile_image_asset_id
image_assets
```

주의:

```txt
self-healing은 운영 장애 완화용이다.
새 D1 환경이나 장기 운영 환경에서는 migrations 디렉터리의 SQL을 순서대로 적용하는 것이 원칙이다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인한다.
```
