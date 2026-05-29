# Maniac Garage 현재 구현 상태 및 점검 문서

## 1. 문서 목적

이 문서는 `maniac` 저장소의 현재 실제 구현 상태를 기준으로 배포 구조, 동작 페이지, API, D1 연동, 최근 수정 사항, 남은 과제, 다음 개발 순서를 정리한다.

기획 문서는 서비스 방향과 장기 구조를 설명하고, 이 문서는 **현재 코드와 배포에서 실제로 동작하는 기능**을 추적한다.

---

## 2. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 CRUD, 정비 기록 CRUD, 부품 기록 CRUD, 공개 장비 페이지, 커뮤니티 게시판/게시글 조회, 게시글 작성 저장까지 동작하는 1차 MVP 상태다.

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
기존 게시글 상세 URL redirect ✅
홈 게시글 스크롤러 DB API 기반 전환 ✅
게시글 목록 HTML 태그 노출 수정 ✅
D1 저장 ✅
D1 migration 정리 진행 중 ✅
API 공통 HTTP 유틸 1차 적용 ✅
R2 업로드 ❌ 보류
실제 로그인 ❌ mock user 사용
```

---

## 3. 배포/런타임 구조

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

- D1 binding은 `wrangler.toml` 기준으로 관리한다.
- Cloudflare 대시보드에서 binding을 추가해도 `wrangler.toml`이 있으면 toml 설정이 우선될 수 있다.
- R2는 카드 등록 요구로 현재 보류 중이다.
- R2 대신 장비 대표 이미지 URL, 부품 이미지 URL, 게시글 본문 data URL 방식으로 임시 대응한다.
- 정적 export 환경 때문에 새 데이터 상세는 동적 라우트보다 query string 기반 정적 shell 방식을 우선 사용한다.

---

## 4. 인증/사용자 상태

아직 실제 로그인/세션은 연결하지 않았다.

현재 장비/정비/부품/게시글 데이터는 개발용 mock user에 귀속된다.

```txt
MOCK_USER_ID = dev_user_maniac
```

공통 상수 파일:

```txt
functions/_shared/dev-user.ts
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

## 5. 현재 확인 가능한 주요 페이지

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

## 6. 장비 기능 구현 상태

### 6.1 장비 등록 `/garage/new/`

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

### 6.2 내 차고 `/garage/`

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

`보기` 버튼은 실사용 React 공개 페이지로 이동한다.

```txt
/garage/view/?slug=장비slug
```

### 6.3 장비 수정/삭제 `/garage/edit/?id=...`

장비 id를 query string으로 받아 클라이언트 컴포넌트에서 조회한다.

```txt
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
```

삭제는 hard delete가 아니라 `deleted_at`을 채우는 soft delete 방식이다.

### 6.4 React 공개 장비 페이지 `/garage/view/?slug=...`

현재 실사용 공개 장비 페이지다.

```txt
/garage/view/?slug=장비slug
→ GET /api/public/equipments/:slug
→ PublicEquipmentDetail 렌더링
```

현재 공개 페이지 표시 내용:

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

### 6.5 기존 slug 공개 링크 `/garage/[slug]/`

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

## 7. 정비 기록 기능 구현 상태

장비 수정 화면에서 정비 기록을 추가, 조회, 수정, 삭제할 수 있다.

API:

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

공개 장비 페이지에는 아래 조건의 정비 기록만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

---

## 8. 부품 기록 기능 구현 상태

장비 수정 화면에서 부품 기록을 추가, 조회, 수정, 삭제할 수 있다.

API:

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

R2 업로드가 아직 없으므로 이미지는 외부 URL을 직접 입력한다.

공개 장비 페이지에는 아래 조건의 부품만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

---

## 9. 커뮤니티 / Explore 구현 상태

`/explore`는 기존 mock 중심 구조에서 D1 API 기반 구조로 전환했다.

### 9.1 게시판 데이터

게시판은 `boards` 테이블에서 관리한다.

주요 컬럼:

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

### 9.2 게시글 데이터

게시글은 `posts` 테이블에 저장한다.

주요 컬럼:

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

목록 카드에서는 HTML 태그를 제거한 plain text excerpt를 표시하고, 상세에서는 sanitize 후 HTML 본문으로 렌더링한다.

관련 파일:

```txt
src/features/boards/utils/html.ts
src/features/boards/components/ExploreBoardClient.tsx
src/features/boards/components/ExploreCategoryClient.tsx
src/features/boards/components/PublicPostDetailClient.tsx
```

### 9.3 댓글 데이터

댓글은 `comments` 테이블에 저장할 수 있는 구조가 있다.

현재 공개 상세 API는 댓글 조회를 지원한다.

댓글 작성 UI/API는 아직 본격 연결 전이다.

### 9.4 Explore 페이지 구조

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

### 9.5 홈 게시글 스크롤러

홈의 `CategoryPostScroller`도 DB API 기반으로 전환했다.

```txt
GET /api/public/posts?category=카테고리&limit=8
```

기존 mock 링크 문제를 해결해 홈에서 들어가도 새 상세 페이지로 이동한다.

```txt
/explore/post/?id=게시글ID
```

관련 파일:

```txt
src/features/home/CategoryPostScroller.tsx
```

---

## 10. 글쓰기/WYSIWYG 상태

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
→ D1 posts insert
→ /explore/post/?id=새글ID
```

게시글 작성 API:

```txt
functions/api/posts.ts
```

현재는 개발용 mock user로 저장한다.

---

## 11. D1/Drizzle schema 상태

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

- 앞으로 테이블 생성/변경은 migration에서 관리한다.
- Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
- D1 local/remote migration 흐름은 아직 더 정교하게 정리할 수 있다.

---

## 12. 현재 API 목록

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
GET    /explore/:category/:board/:post → redirect to /explore/post/?id=...
```

---

## 13. API 공통 유틸 상태

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

아직 공통화하지 못한 부분:

```txt
장비 소유 확인 DB 헬퍼
공개 장비 조회 DB 헬퍼
게시판/게시글 DB 헬퍼
권한 검증 레이어
```

---

## 14. 주요 코드 위치

```txt
functions/_shared/http.ts
functions/_shared/dev-user.ts

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

src/server/db/schema/index.ts
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
package.json
```

---

## 15. 최근 해결한 이슈

### 15.1 D1 binding 문제

Cloudflare Pages가 대시보드 바인딩보다 `wrangler.toml` 설정을 기준으로 동작하는 상태였다.

해결:

```txt
wrangler.toml에 D1 database_id 직접 추가
binding = DB
```

### 15.2 한글 slug 조회 문제

한글 slug가 URL에서 `%EB...` 형태로 인코딩되어 D1 조회가 실패했다.

해결:

```txt
functions/garage/[slug].ts 및 public JSON API에서 decodeURIComponent 처리
React 이동 경로는 encodeURIComponent 처리
```

### 15.3 정적 export 동적 페이지 문제

`/garage/[slug]/`가 빌드 시점에 생성되지 않아 새 장비 공개 페이지가 404였다.

해결:

```txt
/garage/[slug]/는 /garage/view/?slug=... 로 redirect
/garage/view/?slug=... 정적 React 페이지 + /api/public/equipments/:slug JSON API 사용
```

### 15.4 부품/정비 추가 후 reset 에러

부품/정비 저장은 성공하지만 `event.currentTarget.reset()`이 비동기 처리 후 null처럼 동작해 에러가 발생했다.

해결:

```txt
const form = event.currentTarget
const payload = makePayload(new FormData(form))
await fetch(...)
form.reset()
```

### 15.5 `/garage/view/`가 slug Function에 잡히는 문제

`functions/garage/[slug].ts` 때문에 `/garage/view/`가 `slug = view`로 처리됐다.

해결:

```txt
functions/garage/view.ts 추가
next()로 정적 React 페이지에 요청 전달
```

### 15.6 `/explore` mock 정적 상세 제거

기존 `/explore/[category]/[board]/[post]` mock 상세 페이지가 빌드 부담과 새 DB 글 상세 접근 문제를 만들었다.

해결:

```txt
구형 mock 상세 page.tsx 삭제
/explore/post/?id=... 정적 shell 추가
구형 URL은 functions/explore/[category]/[board]/[post].ts에서 redirect
```

### 15.7 Cloudflare Error 1101 redirect 문제

Pages Function에서 `Response.redirect()`에 상대 경로를 넣어 런타임 예외가 발생했다.

해결:

```txt
new URL(request.url) 기준으로 절대 URL 생성 후 redirect
```

### 15.8 게시글 HTML 태그 노출 문제

목록 카드에서 HTML 문자열이 그대로 잘려 `<p>...</p>`가 노출됐다.

해결:

```txt
목록: excerptFromHtml()로 plain text 표시
상세: sanitizePostHtml() 후 HTML 렌더링
```

### 15.9 홈에서 게시글 진입 시 불러오기 실패

홈의 `CategoryPostScroller`가 아직 `mockBoardPosts`와 구형 상세 링크를 사용했다.

해결:

```txt
홈 스크롤러를 /api/public/posts?category=... 기반으로 전환
링크를 /explore/post/?id=... 로 통일
```

---

## 16. 현재 전체 점검 결과

### 완료 확인

```txt
mockBoardPosts 참조 제거 확인 ✅
mock-comments 참조 제거 확인 ✅
구형 /explore/{category}/{board}/{post} 목록 링크 제거 확인 ✅
홈 게시글 스크롤러 DB API 전환 확인 ✅
Drizzle schema의 board metadata 반영 확인 ✅
게시글 목록 plain text excerpt 적용 확인 ✅
게시글 상세 HTML 렌더링 적용 확인 ✅
기존 게시글 URL redirect Function 절대 URL 사용 확인 ✅
```

### 주의할 점

```txt
output: export 유지 중이므로 /explore/[category], /explore/[category]/[board], /explore/[category]/[board]/write는 generateStaticParams shell을 계속 필요로 한다.
DB의 새 게시글 상세는 /explore/post/?id=... 로 접근해야 한다.
게시글 HTML sanitize는 현재 최소 수준이므로 실제 서비스 전 서버단 sanitize 보강이 필요하다.
댓글 작성은 아직 연결 전이다.
실제 로그인 전까지 모든 작성 데이터는 dev_user_maniac에 귀속된다.
```

---

## 17. 아직 mock/stub 또는 미완성인 부분

```txt
실제 로그인/세션 연동
사용자별 권한 분리
댓글 작성 API/UI
R2 이미지 업로드
게시글 HTML 서버 sanitize 강화
어드민 UI
결제/구독
신고/모더레이션 워크플로우
OpenNext 또는 Workers 런타임 전환 검토
API DB 헬퍼 공통화
D1 local/remote migration 흐름 고도화
```

---

## 18. 다음 개발 추천 순서

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
목록에서 HTML 태그 미노출
상세에서 HTML 본문 정상 표시
기존 게시글 URL redirect 정상 동작
장비 등록/수정/공개 조회 정상 동작
```

### 2순위: 댓글 작성 연결

```txt
POST /api/posts/:id/comments
댓글 작성 폼
댓글 목록 새로고침
mock user 기반 임시 저장
```

### 3순위: 로그인/세션 연결

mock user를 제거하고 실제 사용자별 데이터로 분리한다.

### 4순위: 게시글 sanitize 강화

현재 클라이언트/표시 단계 최소 sanitize만 있으므로 서버 저장 전 sanitize 정책이 필요하다.

### 5순위: R2 업로드

R2 사용이 가능해지면 아래 기능을 붙인다.

```txt
장비 대표 이미지 업로드
부품 이미지 업로드
정비 기록 사진 첨부
게시글 이미지 업로드
```

### 6순위: API DB 헬퍼 공통화

현재 HTTP 유틸은 공통화했지만 DB 접근 함수는 아직 각 API에 남아있다.

### 7순위: OpenNext 또는 Workers 런타임 전환 검토

정적 export를 유지할지, 더 동적인 런타임으로 전환할지 실험 브랜치에서 검토한다.
