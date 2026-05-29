# Maniac Garage

장비 마니아를 위한 **장비/정비/부품 기록 갤러리** 웹서비스입니다.

오토바이, 커스텀 PC, 기계식 키보드, 자전거, 카메라, 캠핑 장비처럼 애착이 큰 장비를 등록하고, 정비 이력과 부품 정보를 기록한 뒤 공개 페이지로 공유하는 것을 목표로 합니다.

## 현재 상태 요약

현재 저장소는 Cloudflare Pages + Pages Functions + D1 기반 1차 MVP 상태입니다.

```txt
장비 등록 ✅
D1 저장 ✅
내 차고 목록 표시 ✅
장비 수정/삭제 ✅
정비 기록 CRUD ✅
정비 기록 공개 타임라인 ✅
부품 기록 CRUD ✅
부품 공개 목록 ✅
React 기반 공개 장비 페이지 ✅
공개 조회 JSON API ✅
커뮤니티 게시판/게시글 조회 ✅
게시글 작성 저장 ✅
댓글 작성/삭제 ✅
게시글 저장 전 서버 sanitize ✅
운영 환경 mock user 쓰기 차단 ✅
초기 D1 schema migration ✅
```

아직 로그인은 실제 인증이 아니라 개발용 mock user를 사용합니다.

```txt
MOCK_USER_ID = dev_user_maniac
```

`APP_ENV=production`일 때 mock user 기반 쓰기 API는 401로 차단합니다. 실제 운영 작성 기능은 로그인/세션 연결 후 열어야 합니다.

R2 이미지 업로드는 카드 등록 이슈로 보류 중입니다. 현재는 장비 대표 이미지 URL, 부품 이미지 URL 같은 외부 URL 입력 방식과 게시글 본문 data URL 방식으로 임시 대응합니다.

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

가장 최신 개발 현황은 아래 문서를 기준으로 확인합니다.

```txt
docs/current-implementation-status.md
```

배포 후 회귀 테스트는 아래 문서를 기준으로 진행합니다.

```txt
docs/regression-test-checklist.md
```

## 배포/런타임 구조

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

D1 binding은 `wrangler.toml`에서 관리합니다. Cloudflare 대시보드에서 바인딩을 직접 수정해도 `wrangler.toml`이 우선 적용될 수 있습니다.

## D1 migration

새 D1 데이터베이스에는 아래 순서로 migration을 적용합니다.

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
```

remote D1에 순서대로 적용하려면 다음 명령을 사용합니다.

```bash
npm run d1:migrate:all:remote
```

개별 실행 스크립트:

```bash
npm run d1:migrate:initial:remote
npm run d1:migrate:remote
npm run d1:migrate:community:remote
npm run d1:migrate:board-meta:remote
npm run d1:tables:remote
```

## 현재 확인 가능한 주요 페이지

```txt
/
/explore/
/explore/motorcycle/
/explore/motorcycle/motorcycle-showcase/
/explore/motorcycle/motorcycle-showcase/write/
/explore/post/?id=게시글ID
/me/
/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/view/?slug=장비slug
/garage/[slug]/ → /garage/view/?slug=장비slug redirect
```

현재 실사용 공개 장비 페이지는 아래 경로입니다.

```txt
/garage/view/?slug=장비slug
```

기존 slug 공개 링크는 redirect 호환 경로로 유지합니다.

```txt
/garage/[slug]/
→ /garage/view/?slug=장비slug
```

## 현재 주요 기능

### 장비 관리

```txt
/garage/new/
```

장비를 등록하고 D1 `equipments` 테이블에 저장합니다. 등록 후 이동 경로는 React 공개 페이지입니다.

```txt
/garage/view/?slug=장비slug
```

```txt
/garage/
```

D1에서 저장된 장비 목록을 불러옵니다. 장비 카드에는 정비 요약이 표시됩니다.

```txt
정비 기록 개수
최근 정비일
총 정비 비용
```

카드의 `보기` 버튼은 React 공개 페이지로 이동합니다.

```txt
/garage/view/?slug=장비slug
```

```txt
/garage/edit/?id=장비ID
```

장비 기본 정보 수정/삭제, 정비 기록 관리, 부품 기록 관리를 제공합니다. 수정 저장 후에도 React 공개 페이지로 이동합니다.

### 공개 장비 페이지

실사용 공개 페이지는 정적 React 페이지가 query string의 slug를 읽고 JSON API를 호출하는 구조입니다.

```txt
/garage/view/?slug=장비slug
→ GET /api/public/equipments/:slug
→ PublicEquipmentDetail 렌더링
```

공개 조회 API는 아래 조건의 장비만 반환합니다.

```txt
deleted_at IS NULL
visibility = public
moderation_status = normal
```

표시 내용:

```txt
장비 기본 정보
대표 사진 또는 GARAGE 플레이스홀더
스펙
사용량
공개 상태
slug
정비 타임라인
장착 부품
```

### 정비 기록 관리

장비 수정 화면에서 정비 기록을 추가, 수정, 삭제할 수 있습니다.

지원 필드:

```txt
type
title
description
performedAt
usageMetricValue
cost
shopName
visibility
```

공개 페이지에는 `visibility = public`인 정비 기록만 표시됩니다.

PATCH는 요청 body에 포함된 필드만 수정합니다. 누락된 선택 필드가 `null`로 덮이는 문제를 수정했습니다.

### 부품 기록 관리

장비 수정 화면에서 부품 기록을 추가, 수정, 삭제할 수 있습니다.

지원 필드:

```txt
category
brand
name
price
installedAt
purchaseUrl
imageUrl
memo
visibility
```

공개 페이지에는 `visibility = public`인 부품만 표시됩니다.

PATCH는 요청 body에 포함된 필드만 수정합니다. 누락된 선택 필드가 `null`로 덮이는 문제를 수정했습니다.

### 커뮤니티 / Explore

`/explore`는 D1 API 기반 게시판/게시글 구조로 동작합니다.

```txt
/explore/
→ GET /api/public/boards

/explore/[category]/
→ GET /api/public/posts?category=...

/explore/[category]/[board]/
→ GET /api/public/posts?board=...

/explore/post/?id=게시글ID
→ GET /api/public/posts/:id
```

글쓰기 흐름:

```txt
/explore/[category]/[board]/write/
→ POST /api/posts
→ sanitizePostHtml()
→ D1 posts insert
→ /explore/post/?id=새글ID
```

댓글 흐름:

```txt
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
```

## API / Pages Functions

현재 Cloudflare Pages Functions에서 아래 API를 제공합니다.

```txt
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

GET    /api/public/equipments/:slug
GET    /garage/:slug → redirect to /garage/view/?slug=...

GET    /api/public/boards
GET    /api/public/posts?category=...
GET    /api/public/posts?board=...
GET    /api/public/posts/:id
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
GET    /explore/:category/:board/:post → redirect to /explore/post/?id=...
```

현재 API 내부의 런타임 `CREATE TABLE IF NOT EXISTS` 안전장치는 제거되어 있습니다.

## 주요 코드 위치

```txt
functions/_shared/http.ts
functions/_shared/auth.ts
functions/_shared/dev-user.ts
functions/_shared/db-users.ts
functions/_shared/db-equipment.ts
functions/_shared/db-posts.ts
functions/_shared/db-public-equipment.ts
functions/_shared/db-boards.ts

functions/api/equipments.ts
functions/api/equipments/[id].ts
functions/api/equipments/[id]/logs.ts
functions/api/equipments/[id]/parts.ts
functions/api/public/equipments/[slug].ts
functions/garage/[slug].ts
functions/garage/view.ts

functions/api/public/boards.ts
functions/api/public/posts.ts
functions/api/public/posts/[id].ts
functions/api/public/posts/[id]/comments.ts
functions/api/posts.ts
functions/explore/[category]/[board]/[post].ts

src/app/garage/page.tsx
src/app/garage/new/page.tsx
src/app/garage/edit/page.tsx
src/app/garage/view/page.tsx

src/app/explore/page.tsx
src/app/explore/[category]/page.tsx
src/app/explore/[category]/[board]/page.tsx
src/app/explore/[category]/[board]/write/page.tsx
src/app/explore/post/page.tsx

src/features/equipment/components/GarageEquipmentList.tsx
src/features/equipment/components/EquipmentCreateForm.tsx
src/features/equipment/components/EquipmentEditPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
src/features/equipment/components/MaintenanceLogPanel.tsx
src/features/equipment/components/PartsPanel.tsx
src/features/equipment/components/PublicEquipmentDetail.tsx
src/features/equipment/components/PublicEquipmentDetailClient.tsx
src/features/equipment/components/PublicEquipmentViewSection.tsx

src/features/boards/components/ExploreBoardsClient.tsx
src/features/boards/components/ExploreCategoryClient.tsx
src/features/boards/components/ExploreBoardClient.tsx
src/features/boards/components/BoardWriteForm.tsx
src/features/boards/components/PublicPostViewSection.tsx
src/features/boards/components/PublicPostDetailClient.tsx
src/features/boards/utils/html.ts
src/features/home/CategoryPostScroller.tsx
src/features/editor/SimpleHtmlEditor.tsx
```

## 아직 mock/stub 또는 미완성인 부분

```txt
실제 로그인/세션 연동
사용자별 권한 분리
R2 이미지 업로드
어드민 UI
결제/구독
신고/모더레이션 워크플로우
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
기존 HTML 공개 페이지 fallback 정리
OpenNext 또는 Workers 런타임 전환 검토
```

## 다음 추천 작업

1. 배포 후 회귀 테스트
2. 로그인/세션 연결
3. R2 사용 가능 시 이미지 업로드 추가
4. local D1 migration 흐름 정리
5. 기존 `/garage/[slug]/` fallback 정리
6. OpenNext 또는 Workers 런타임 전환 검토
