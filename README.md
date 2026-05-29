# Maniac Garage

장비 마니아를 위한 **장비/정비/부품 기록 갤러리** 웹서비스입니다.

오토바이, 커스텀 PC, 기계식 키보드, 자전거, 카메라, 캠핑 장비처럼 애착이 큰 장비를 등록하고, 정비 이력과 부품 정보를 기록한 뒤 공개 페이지로 공유하는 것을 목표로 합니다.

---

## 현재 상태 요약

현재 저장소는 **Cloudflare Pages + Pages Functions + D1 기반 1차 MVP** 상태입니다.

```txt
이메일 회원가입/로그인/로그아웃 ✅
HttpOnly 쿠키 기반 세션 ✅
사용자별 장비/게시글/댓글 데이터 분리 ✅
장비 CRUD ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
공개 장비 페이지 ✅
기존 장비 slug 공개 링크 redirect ✅
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
게시글 작성/상세/수정/삭제 ✅
댓글 작성/삭제 ✅
내 정보 페이지 ✅
내 활동 요약 ✅
내 작성글 관리 ✅
내 댓글 관리 ✅
홈 콘텐츠 피드화 ✅
홈 히어로 내 장비 카드 ✅
샘플 콘텐츠 seed endpoint ✅
D1 migration 정리 ✅
R2 업로드 ❌ 보류
결제/구독 ❌ 미구현
관리자/모더레이션 UI ❌ 미구현
```

가장 최신 개발 현황은 아래 문서를 기준으로 확인합니다.

```txt
docs/current-implementation-status.md
```

배포 후 회귀 테스트는 아래 문서를 기준으로 진행합니다.

```txt
docs/regression-test-checklist.md
```

---

## 문서 위치

```txt
docs/maniac-garage-service-plan.md
docs/admin-management-plan.md
docs/site-content-board-management-plan.md
docs/design-direction-guide.md
docs/current-implementation-status.md
docs/d1-migration-guide.md
docs/regression-test-checklist.md
```

---

## 배포/런타임 구조

현재 프로젝트는 Next.js static export와 Cloudflare Pages Functions를 함께 사용합니다.

```txt
Next.js static export
Cloudflare Pages
Cloudflare Pages Functions
Cloudflare D1
```

주요 설정:

```txt
next.config.ts
- output: export
- trailingSlash: true
- images.unoptimized: true

wrangler.toml
- pages_build_output_dir = "out"
- D1 binding = DB
- database_name = maniac-garage-dev
```

주의:

```txt
D1 binding은 wrangler.toml 기준으로 관리합니다.
Cloudflare 대시보드에서 binding을 추가해도 wrangler.toml 설정이 우선될 수 있습니다.
R2는 카드 등록 요구로 현재 보류 중입니다.
R2 대신 장비 대표 이미지 URL, 부품 이미지 URL, 게시글 본문 data URL 방식으로 임시 대응합니다.
정적 export 환경 때문에 새 데이터 상세는 query string 기반 정적 shell 방식을 우선 사용합니다.
```

---

## 로컬 실행

```bash
npm install
npm run dev
```

타입 체크:

```bash
npm run typecheck
```

빌드:

```bash
npm run build
```

Cloudflare Pages preview:

```bash
npm run pages:preview
```

Cloudflare Pages deploy:

```bash
npm run pages:deploy
```

---

## D1 migration

새 D1 데이터베이스에는 아래 순서로 migration을 적용합니다.

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
migrations/0005_add_auth_tables.sql
```

`0006_seed_real_equipment_posts.sql`는 필수 schema migration이 아니라 선택 seed입니다.

remote D1에 순서대로 적용하려면 다음 명령을 사용합니다.

```bash
npm run d1:migrate:all:remote
```

local D1에 순서대로 적용하려면 다음 명령을 사용합니다.

```bash
npm run d1:migrate:all:local
```

샘플 콘텐츠가 필요하면 seed를 별도로 실행합니다.

```bash
npm run d1:seed:samples:remote
# 또는
npm run d1:seed:samples:local
```

테이블 확인:

```bash
npm run d1:tables:remote
# 또는
npm run d1:tables:local
```

---

## 현재 확인 가능한 주요 페이지

```txt
/
/explore/
/explore/[category]/
/explore/[category]/[board]/
/explore/[category]/[board]/write/
/explore/post/?id=게시글ID

/login/
/signup/
/me/
/me/posts/
/me/posts/edit/?id=게시글ID
/me/comments/

/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/view/?slug=장비slug
/garage/[slug]/ → /garage/view/?slug=장비slug redirect
```

구형 게시글 상세 URL은 redirect합니다.

```txt
/explore/:category/:board/:post
→ /explore/post/?id=:post
```

---

## 현재 주요 API

```txt
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/me/summary
GET    /api/me/posts
GET    /api/me/posts/:id
PATCH  /api/me/posts/:id
DELETE /api/me/posts/:id
GET    /api/me/comments
DELETE /api/me/comments/:id

GET    /api/equipments
POST   /api/equipments
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id

GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=...
DELETE /api/equipments/:id/logs?logId=...

GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...

GET    /api/public/equipments
GET    /api/public/equipments/:slug
GET    /api/public/boards
GET    /api/public/posts?category=...
GET    /api/public/posts?board=...
GET    /api/public/posts?sort=latest
GET    /api/public/posts?sort=popular
GET    /api/public/posts/:id
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
```

개발/샘플 데이터용 endpoint:

```txt
GET/POST /api/dev/seed-lite
GET/POST /api/dev/seed-samples
GET/POST /api/dev/cleanup-dev-maniac
```

운영 공개 전에는 개발용 endpoint를 관리자 인증으로 보호하거나 제거해야 합니다.

---

## 아직 미완성인 부분

```txt
R2 이미지 업로드
프로필 설정
프로필 이미지
공개 사용자 프로필 페이지
어드민 UI
결제/구독
신고/모더레이션 워크플로우
개발용 seed/cleanup endpoint 보호 또는 제거
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
```

---

## 다음 개발 추천 순서

1. 배포 후 회귀 테스트
2. 개발용 seed/cleanup endpoint 보호 또는 제거
3. 프로필 설정 페이지
4. 이미지 업로드 구조 정리
5. 신고/모더레이션 워크플로우
6. 관리자 UI
7. 결제/구독
