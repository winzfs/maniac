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
D1 migration 정리 진행 중 ✅
API 공통 HTTP 유틸 1차 적용 ✅
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

공통 파일:

```txt
functions/_shared/dev-user.ts
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

관련 파일:

```txt
functions/explore/[category]/[board]/[post].ts
```

---

## 5. 장비 기능 구현 상태

### 5.1 장비 등록 `/garage/new/`

장비 등록 폼에서 입력한 정보를 D1 `equipments` 테이블에 저장한다.

```txt
/garage/new/
→ POST /api/equipments
→ D1 equipments insert
→ nextPath: /garage/view/?slug=장비slug
```

관련 파일:

```txt
src/app/garage/new/page.tsx
src/features/equipment/components/EquipmentCreateForm.tsx
functions/api/equipments.ts
src/features/equipment/actions/mutations.ts
src/features/equipment/schemas/index.ts
```

한글 slug를 허용한다.

```txt
예: 닌자-400-3
```

React 공개 페이지 이동 시 slug는 `encodeURIComponent`로 인코딩한다.

### 5.2 내 차고 `/garage/`

D1에 저장된 장비 목록을 불러온다.

```txt
GET /api/equipments
```

장비 카드에는 기본 정보와 정비 요약을 표시한다.

```txt
장비명
브랜드/모델/연식
사용량
공개 상태
정비 기록 개수
최근 정비일
총 정비 비용
보기 버튼
수정 버튼
```

### 5.3 장비 수정/삭제 `/garage/edit/?id=...`

장비 id를 query string으로 받아 클라이언트 컴포넌트에서 조회한다.

```txt
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
```

삭제는 hard delete가 아니라 `deleted_at`을 채우는 soft delete 방식이다.

### 5.4 React 공개 장비 페이지 `/garage/view/?slug=...`

현재 실사용 공개 장비 페이지다.

```txt
/garage/view/?slug=장비slug
→ GET /api/public/equipments/:slug
→ PublicEquipmentDetail 렌더링
```

공개 장비 JSON API는 아래 조건을 만족하는 장비만 반환한다.

```txt
deleted_at IS NULL
visibility = public
moderation_status = normal
```

공개 페이지 표시 내용:

```txt
장비 기본 정보
장비 소개
대표 사진 또는 GARAGE 플레이스홀더
스펙
사용량
공개 상태
slug
정비 타임라인
장착 부품
```

### 5.5 기존 slug 공개 링크 `/garage/[slug]/`

기존 공유 링크 호환용 경로다.

```txt
/garage/장비slug/
→ 302 redirect
→ /garage/view/?slug=장비slug
```

관련 파일:

```txt
functions/garage/[slug].ts
functions/garage/view.ts
```

`functions/garage/view.ts`는 `/garage/view/` 요청이 기존 `/garage/[slug]/` Function에 잡히지 않고 정적 React 페이지로 넘어가도록 하기 위한 bypass Function이다.

---

## 6. 정비 기록 기능 구현 상태

장비 수정 화면에서 정비 기록을 추가, 조회, 수정, 삭제할 수 있다.

```txt
GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=정비기록ID
DELETE /api/equipments/:id/logs?logId=정비기록ID
```

관련 파일:

```txt
functions/api/equipments/[id]/logs.ts
src/features/equipment/components/MaintenanceLogPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
```

최근 수정:

```txt
PATCH는 동적 SET 절을 사용한다.
요청 body에 포함된 필드만 수정한다.
누락된 description, usageMetricValue, cost, shopName 등이 null로 덮이는 문제를 수정했다.
```

공개 장비 페이지에는 아래 조건의 정비 기록만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

---

## 7. 부품 기록 기능 구현 상태

장비 수정 화면에서 부품 기록을 추가, 조회, 수정, 삭제할 수 있다.

```txt
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=부품ID
DELETE /api/equipments/:id/parts?partId=부품ID
```

관련 파일:

```txt
functions/api/equipments/[id]/parts.ts
src/features/equipment/components/PartsPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
```

최근 수정:

```txt
PATCH는 동적 SET 절을 사용한다.
요청 body에 포함된 필드만 수정한다.
누락된 brand, price, installedAt, purchaseUrl, imageUrl, memo 등이 null로 덮이는 문제를 수정했다.
```

R2 업로드가 아직 없으므로 이미지는 외부 URL을 직접 입력한다.

공개 장비 페이지에는 아래 조건의 부품만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

---

## 8. 커뮤니티 / Explore 구현 상태

`/explore`는 기존 mock 중심 구조에서 D1 API 기반 구조로 전환했다.

### 8.1 게시판 데이터

게시판은 `boards` 테이블에서 관리한다.

```txt
id
slug
title
category
type
description
status
permission
sort_order
created_at
updated_at
```

category/type/description/sort_order는 `migrations/0004_add_board_metadata.sql`로 추가했다.

### 8.2 게시글 데이터

게시글은 `posts` 테이블에 저장한다.

```txt
id
board_id
author_id
title
body
status
visibility
moderation_status
created_at
updated_at
deleted_at
```

현재 게시글 본문은 `SimpleHtmlEditor`에서 생성한 HTML 문자열을 저장한다.

목록 카드에서는 HTML 태그를 제거한 plain text excerpt를 표시하고, 상세에서는 sanitize 후 HTML 본문으로 렌더링한다. 게시글 저장 API에서도 서버 저장 전 `sanitizePostHtml()`을 적용하고, 제목/본문 길이 제한을 검사한다.

```txt
제목 최대 길이: 120자
본문 최대 길이: 200KB
```

관련 파일:

```txt
src/features/boards/utils/html.ts
src/features/boards/components/ExploreBoardClient.tsx
src/features/boards/components/ExploreCategoryClient.tsx
src/features/boards/components/PublicPostDetailClient.tsx
functions/api/posts.ts
```

### 8.3 댓글 데이터

댓글은 `comments` 테이블에 저장한다.

현재 상태:

```txt
공개 상세 API에서 댓글 조회 지원 ✅
댓글 작성 UI 연결 ✅
댓글 작성 API 연결 ✅
댓글 삭제 API 연결 ✅
실제 로그인 전까지 mock user 기반 저장 ✅
```

관련 파일:

```txt
src/features/boards/components/PublicPostDetailClient.tsx
functions/api/public/posts/[id].ts
functions/api/public/posts/[id]/comments.ts
```

### 8.4 Explore 페이지 구조

```txt
/explore/
→ GET /api/public/boards
→ 카테고리/게시판 목록 표시

/explore/[category]/
→ 정적 shell
→ GET /api/public/boards
→ GET /api/public/posts?category=...

/explore/[category]/[board]/
→ 정적 shell
→ GET /api/public/boards
→ GET /api/public/posts?board=...

/explore/post/?id=게시글ID
→ 정적 shell
→ GET /api/public/posts/:id
```

### 8.5 홈 게시글 스크롤러

홈의 `CategoryPostScroller`도 DB API 기반으로 전환했다.

```txt
GET /api/public/posts?category=카테고리&limit=8
```

기존 mock 링크 문제를 해결해 홈에서 들어가도 새 상세 페이지로 이동한다.

```txt
/explore/post/?id=게시글ID
```

---

## 9. 글쓰기/WYSIWYG 상태

글쓰기 화면에는 자체 구현한 가벼운 WYSIWYG 에디터를 사용한다.

```txt
src/features/editor/SimpleHtmlEditor.tsx
src/app/explore/[category]/[board]/write/page.tsx
src/features/boards/components/BoardWriteForm.tsx
```

현재 지원 기능:

```txt
굵게
기울임
링크 생성/해제
H2 적용/해제
인용 적용/해제
목록
실행취소
다시실행
사진 삽입
```

저장 흐름:

```txt
/explore/[category]/[board]/write/
→ POST /api/posts
→ sanitizePostHtml()
→ D1 posts insert
→ /explore/post/?id=새글ID
```

현재는 개발용 mock user로 저장한다. `APP_ENV=production`일 때는 mock user 기반 쓰기 요청을 401로 차단한다.

---

## 10. D1/Drizzle schema 상태

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
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
```

Drizzle schema에도 `maintenanceLogs`, `parts`, `boards`, `posts`, `comments`, board metadata 필드가 반영되어 있다.

```txt
src/server/db/schema/index.ts
```

추가된 package scripts:

```txt
npm run d1:migrate:remote
npm run d1:migrate:community:remote
npm run d1:migrate:board-meta:remote
npm run d1:tables:remote
```

주의:

```txt
앞으로 테이블 생성/변경은 migration에서 관리한다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
D1 local/remote migration 흐름은 아직 더 정교하게 정리할 수 있다.
repository에 0001_initial.sql이 아직 없으므로 새 DB 완전 재현성은 부족하다.
```

---

## 11. 현재 API 목록

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

## 12. API 공통 유틸 상태

공통 파일:

```txt
functions/_shared/http.ts
functions/_shared/dev-user.ts
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

아직 공통화하지 못한 부분:

```txt
장비 소유 확인 DB 헬퍼
공개 장비 조회 DB 헬퍼
게시판/게시글 DB 헬퍼
권한 검증 레이어
```

---

## 13. 최근 해결한 이슈

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
```

---

## 14. 현재 전체 점검 결과

### 완료 확인

```txt
mockBoardPosts 참조 제거 확인 ✅
mock-comments 참조 제거 확인 ✅
구형 /explore/{category}/{board}/{post} 목록 링크 제거 확인 ✅
홈 게시글 스크롤러 DB API 전환 확인 ✅
Drizzle schema의 board metadata 반영 확인 ✅
게시글 목록 plain text excerpt 적용 확인 ✅
게시글 상세 HTML 렌더링 적용 확인 ✅
게시글 저장 전 서버 sanitize 적용 확인 ✅
기존 게시글 URL redirect Function 절대 URL 사용 확인 ✅
댓글 작성/삭제 mock user 기반 연결 확인 ✅
```

### 주의할 점

```txt
output: export 유지 중이므로 /explore/[category], /explore/[category]/[board], /explore/[category]/[board]/write는 generateStaticParams shell을 계속 필요로 한다.
DB의 새 게시글 상세는 /explore/post/?id=... 로 접근해야 한다.
게시글 HTML sanitize는 강화했지만 장기적으로는 검증된 sanitizer 라이브러리 또는 더 엄격한 서버 정책을 검토한다.
실제 로그인 전까지 개발 환경의 작성 데이터는 dev_user_maniac에 귀속된다.
운영 환경에서는 APP_ENV=production 설정 여부를 반드시 확인해야 한다.
```

---

## 15. 아직 mock/stub 또는 미완성인 부분

```txt
실제 로그인/세션 연동
사용자별 권한 분리
R2 이미지 업로드
어드민 UI
결제/구독
신고/모더레이션 워크플로우
OpenNext 또는 Workers 런타임 전환 검토
API DB 헬퍼 공통화
D1 local/remote migration 흐름 고도화
migrations/0001_initial.sql 추가
```

---

## 16. 다음 개발 추천 순서

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
```

### 2순위: 실제 로그인/세션 연결

mock user를 제거하고 실제 사용자별 데이터로 분리한다.

### 3순위: R2 업로드

R2 사용이 가능해지면 아래 기능을 붙인다.

```txt
장비 대표 이미지 업로드
부품 이미지 업로드
정비 기록 사진 첨부
게시글 이미지 업로드
```

### 4순위: API DB 헬퍼 공통화

현재 HTTP 유틸과 mock user 가드는 공통화했지만 DB 접근 함수는 아직 각 API에 남아있다.

### 5순위: migrations/0001_initial.sql 추가

새 D1 데이터베이스를 처음부터 재현할 수 있도록 초기 schema migration을 정리한다.

### 6순위: OpenNext 또는 Workers 런타임 전환 검토

정적 export를 유지할지, 더 동적인 런타임으로 전환할지 실험 브랜치에서 검토한다.
