# Maniac Garage 현재 구현 상태 및 점검 문서

이 문서는 `maniac` 저장소의 현재 `main` 브랜치 기준 실제 구현 상태를 추적한다. 기획 문서는 장기 방향을 설명하고, 이 문서는 배포 구조, 동작 페이지, API, D1 연동, 최근 해결 이슈, 남은 작업을 기준으로 관리한다.

---

## 1. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 CRUD, 정비 기록 CRUD, 부품 기록 CRUD, 공개 장비 페이지, 커뮤니티 게시판/게시글 조회, 게시글 작성, 댓글 작성까지 1차 MVP가 구현되어 있다.

```txt
장비 CRUD ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
React 공개 장비 페이지 ✅
기존 장비 slug 공개 링크 redirect ✅
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
게시글 작성 저장 ✅
게시글 상세 /explore/post/?id=... ✅
댓글 작성/삭제 API/UI mock user 기반 연결 ✅
기존 게시글 상세 URL redirect ✅
홈 게시글 스크롤러 DB API 기반 전환 ✅
게시글 목록 plain text excerpt 처리 ✅
게시글 상세 HTML sanitize 렌더링 ✅
게시글 저장 전 서버 sanitize/길이 제한 ✅
D1 저장 ✅
D1 migration 정리 ✅
초기 D1 schema migration ✅
API 공통 HTTP 유틸 1차 적용 ✅
API DB 헬퍼 공통화 5차 적용 ✅
mock user 보장 로직 공통화 ✅
운영 환경 mock user 쓰기 차단 가드 ✅
R2 업로드 ❌ 보류
실제 로그인 ❌ mock user 사용
```

---

## 2. 배포/런타임 구조

현재 프로젝트는 Next.js static export와 Cloudflare Pages Functions를 함께 사용한다.

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
D1 binding은 wrangler.toml 기준으로 관리한다.
Cloudflare 대시보드에서 binding을 추가해도 wrangler.toml 설정이 우선될 수 있다.
R2는 카드 등록 요구로 현재 보류 중이다.
R2 대신 장비 대표 이미지 URL, 부품 이미지 URL, 게시글 본문 data URL 방식으로 임시 대응한다.
정적 export 환경 때문에 새 데이터 상세는 동적 라우트보다 query string 기반 정적 shell 방식을 우선 사용한다.
```

---

## 3. 인증/사용자 상태

아직 실제 로그인/세션은 연결하지 않았다.

현재 장비/정비/부품/게시글/댓글 데이터는 개발용 mock user에 귀속된다.

```txt
MOCK_USER_ID = dev_user_maniac
```

현재 운영 보호:

```txt
APP_ENV=production 일 때 mock user 기반 쓰기 API는 401로 차단한다.
읽기 API는 기존 개발/공개 조회 흐름을 유지한다.
```

보호 대상:

```txt
POST   /api/equipments
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=...
DELETE /api/equipments/:id/logs?logId=...
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
```

향후 작업:

```txt
실제 로그인 연결
세션에서 userId 추출
mock user 제거
사용자별 데이터 격리
권한 검증 공통화
```

---

## 4. 현재 확인 가능한 주요 페이지

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

구형 게시글 상세 URL은 redirect한다.

```txt
/explore/:category/:board/:post
→ /explore/post/?id=:post
```

---

## 5. 기능 구현 상태

### 장비 관리

```txt
/garage/new/ → POST /api/equipments → D1 equipments insert
/garage/ → GET /api/equipments
/garage/edit/?id=... → GET/PATCH/DELETE /api/equipments/:id
/garage/view/?slug=... → GET /api/public/equipments/:slug
```

공개 장비 JSON API는 아래 조건을 만족하는 장비만 반환한다.

```txt
deleted_at IS NULL
visibility = public
moderation_status = normal
```

기존 `/garage/[slug]/` 공유 링크는 `/garage/view/?slug=...`로 redirect한다.

### 정비 기록

```txt
GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=...
DELETE /api/equipments/:id/logs?logId=...
```

PATCH는 동적 SET 절을 사용해 요청 body에 포함된 필드만 수정한다. 누락된 `description`, `usageMetricValue`, `cost`, `shopName` 등이 `null`로 덮이는 문제를 수정했다.

공개 장비 페이지에는 `visibility = public`이고 `deleted_at IS NULL`인 정비 기록만 표시한다.

### 부품 기록

```txt
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...
```

PATCH는 동적 SET 절을 사용해 요청 body에 포함된 필드만 수정한다. 누락된 `brand`, `price`, `installedAt`, `purchaseUrl`, `imageUrl`, `memo` 등이 `null`로 덮이는 문제를 수정했다.

공개 장비 페이지에는 `visibility = public`이고 `deleted_at IS NULL`인 부품만 표시한다.

### 커뮤니티 / Explore

`/explore`는 D1 API 기반 게시판/게시글 구조로 동작한다.

```txt
/explore/ → GET /api/public/boards
/explore/[category]/ → GET /api/public/posts?category=...
/explore/[category]/[board]/ → GET /api/public/posts?board=...
/explore/post/?id=게시글ID → GET /api/public/posts/:id
```

게시글 저장 흐름:

```txt
/explore/[category]/[board]/write/
→ POST /api/posts
→ sanitizePostHtml()
→ D1 posts insert
→ /explore/post/?id=새글ID
```

게시글 저장 API는 서버 저장 전 `sanitizePostHtml()`을 적용하고, 제목/본문 길이 제한을 검사한다.

```txt
제목 최대 길이: 120자
본문 최대 길이: 200KB
```

댓글 상태:

```txt
공개 상세 API에서 댓글 조회 지원 ✅
댓글 작성 UI 연결 ✅
댓글 작성 API 연결 ✅
댓글 삭제 API 연결 ✅
실제 로그인 전까지 mock user 기반 저장 ✅
```

---

## 6. D1/Drizzle schema 상태

현재 사용 중인 주요 테이블:

```txt
users
equipments
maintenance_logs
parts
boards
posts
comments
```

주요 migration:

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
```

Drizzle schema에도 핵심 MVP 테이블과 board metadata 필드가 반영되어 있다.

```txt
src/server/db/schema/index.ts
```

추가된 package scripts:

```txt
npm run d1:migrate:initial:remote
npm run d1:migrate:remote
npm run d1:migrate:community:remote
npm run d1:migrate:board-meta:remote
npm run d1:migrate:all:remote
npm run d1:tables:remote
```

주의:

```txt
앞으로 테이블 생성/변경은 migration에서 관리한다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
D1 local/remote migration 흐름은 아직 더 정교하게 정리할 수 있다.
새 D1 DB는 0001 → 0002 → 0003 → 0004 순서로 적용한다.
```

---

## 7. 현재 API 목록

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

---

## 8. API 공통 유틸 상태

공통 파일:

```txt
functions/_shared/http.ts
functions/_shared/dev-user.ts
functions/_shared/db-users.ts
functions/_shared/db-equipment.ts
functions/_shared/db-posts.ts
functions/_shared/db-public-equipment.ts
functions/_shared/db-boards.ts
```

`http.ts` 주요 함수:

```txt
jsonResponse
errorResponse
getErrorMessage
zodDetails
statusFromError
isRecord
readJsonObject
paramValue
allowMethods
```

`dev-user.ts` 주요 값/함수:

```txt
MOCK_USER_ID
MOCK_USER_PRODUCTION_ERROR
isMockUserWriteBlocked
```

`db-users.ts` 주요 함수:

```txt
ensureDevUser
```

`db-equipment.ts` 주요 함수:

```txt
hasEquipment
hasMaintenanceLog
hasPart
```

`db-posts.ts` 주요 함수:

```txt
getPublicPost
getPublicPostDetail
listPublicPosts
listPublicComments
```

`db-public-equipment.ts` 주요 함수:

```txt
findPublicEquipment
listPublicEquipmentLogs
listPublicEquipmentParts
```

`db-boards.ts` 주요 함수:

```txt
listPublicBoards
```

공통화 적용 완료:

```txt
정비 기록 API 장비/정비 기록 존재 확인
부품 API 장비/부품 존재 확인
장비 생성 API dev user 보장
게시글 작성 API dev user 보장
댓글 API dev user 보장
댓글 API 공개 게시글 존재 확인
공개 게시글 상세 API 상세 조회
공개 게시글 상세 API 댓글 목록 조회
공개 게시글 목록 API 목록 조회
공개 게시판 목록 API 목록 조회
공개 장비 API 장비 조회
공개 장비 API 정비 기록 조회
공개 장비 API 부품 조회
```

아직 공통화하지 못한 부분:

```txt
권한 검증 레이어
```

---

## 9. 최근 해결한 이슈

```txt
D1 binding 문제 해결 ✅
한글 slug 조회 문제 해결 ✅
정적 export 동적 페이지 문제 해결 ✅
부품/정비 추가 후 form reset 에러 해결 ✅
/garage/view/가 slug Function에 잡히는 문제 해결 ✅
/explore mock 정적 상세 제거 ✅
Cloudflare Error 1101 redirect 문제 해결 ✅
게시글 HTML 태그 노출 문제 해결 ✅
홈에서 게시글 진입 시 불러오기 실패 해결 ✅
공개 장비 API가 private 장비를 반환할 수 있는 문제 해결 ✅
정비 기록 PATCH 누락 필드 null 덮어쓰기 문제 해결 ✅
부품 PATCH 누락 필드 null 덮어쓰기 문제 해결 ✅
게시글 HTML sanitize allowlist 강화 ✅
게시글 저장 전 서버 sanitize 및 길이 제한 추가 ✅
APP_ENV=production에서 mock user 쓰기 차단 추가 ✅
초기 D1 schema migration 추가 ✅
전체 remote migration script 추가 ✅
API DB 헬퍼 공통화 1차 적용 ✅
게시글/댓글 DB 헬퍼 공통화 적용 ✅
공개 장비 DB 헬퍼 공통화 적용 ✅
게시판/게시글 목록 DB 헬퍼 공통화 적용 ✅
mock user 보장 로직 공통화 적용 ✅
```

---

## 10. 아직 mock/stub 또는 미완성인 부분

```txt
실제 로그인/세션 연동
사용자별 권한 분리
R2 이미지 업로드
어드민 UI
결제/구독
신고/모더레이션 워크플로우
OpenNext 또는 Workers 런타임 전환 검토
권한 검증 레이어 공통화
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
```

---

## 11. 다음 개발 추천 순서

### 1순위: 배포 후 회귀 테스트

확인 경로:

```txt
/
/explore/
/explore/motorcycle/
/explore/motorcycle/motorcycle-showcase/
/explore/motorcycle/motorcycle-showcase/write/
/explore/post/?id=post_motorcycle_showcase_1
/garage/
/garage/new/
/garage/edit/?id=...
/garage/view/?slug=...
```

확인 항목:

```txt
홈 게시글 클릭 → 상세 정상 표시
메뉴 게시판 진입 → 게시글 목록 정상 표시
글쓰기 저장 → 새 상세로 이동
댓글 작성 → 댓글 목록 반영
목록에서 HTML 태그 미노출
상세에서 HTML 본문 정상 표시
기존 게시글 URL redirect 정상 동작
장비 등록/수정/공개 조회 정상 동작
private 장비 공개 API 404 확인
정비/부품 PATCH 시 누락 필드 보존 확인
APP_ENV=production에서 mock 쓰기 API 401 확인
새 D1 DB에 npm run d1:migrate:all:remote 적용 확인
정비/부품/댓글 API 회귀 확인
공개 게시글 상세/댓글 목록 API 회귀 확인
공개 장비 상세/정비/부품 API 회귀 확인
공개 게시판/게시글 목록 API 회귀 확인
장비 생성/게시글 작성 mock user 보장 확인
```

### 2순위: 실제 로그인/세션 연결

mock user를 제거하고 실제 사용자별 데이터로 분리한다.

### 3순위: R2 업로드

R2 사용이 가능해지면 장비 대표 이미지, 부품 이미지, 정비 기록 사진, 게시글 이미지를 업로드 방식으로 전환한다.

### 4순위: 권한 검증 레이어 공통화

현재는 `APP_ENV=production` mock write guard를 각 쓰기 API에서 직접 호출한다. 다음 단계에서는 공통 `requireWritableMockUser` 같은 헬퍼로 통일한다.

### 5순위: local D1 migration 흐름 정리

remote 중심 script 외에 local 개발 DB 적용 흐름을 정리한다.

### 6순위: OpenNext 또는 Workers 런타임 전환 검토

정적 export를 유지할지, 더 동적인 런타임으로 전환할지 실험 브랜치에서 검토한다.
