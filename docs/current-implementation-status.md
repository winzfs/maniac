# Maniac Garage 현재 구현 상태 및 점검 문서

이 문서는 `maniac` 저장소의 현재 `main` 브랜치 기준 실제 구현 상태를 추적한다. 기획 문서는 장기 방향을 설명하고, 이 문서는 배포 구조, 동작 페이지, API, D1 연동, 최근 해결 이슈, 남은 작업을 기준으로 관리한다.

---

## 1. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 기록, 공개 장비 페이지, 커뮤니티 게시판, 이메일/비밀번호 로그인, 내 정보/내 콘텐츠 관리까지 1차 MVP가 구현되어 있다.

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
관리 페이지 레이아웃 1차 정리 ✅
D1 migration 정리 ✅
R2 업로드 ❌ 보류
결제/구독 ❌ 미구현
관리자/모더레이션 UI ❌ 미구현
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
useSearchParams()를 쓰는 클라이언트 컴포넌트는 static export 빌드 안정성을 위해 Suspense로 감싼다.
```

---

## 3. 인증/사용자 상태

외부 인증 서비스 없이 이메일/비밀번호 기반 직접 로그인을 구현했다.

```txt
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

세션 방식:

```txt
쿠키 이름: maniac_session
HttpOnly
SameSite=Lax
Path=/
Max-Age=30일
Expires 포함
production 환경에서는 Secure
DB에는 세션 원문이 아니라 verifier_hash 저장
```

비밀번호 저장 방식:

```txt
PBKDF2-SHA256
iterations = 100000
salt = random 16 bytes
credential_hash만 users 테이블에 저장
비밀번호 원문 저장 안 함
```

Cloudflare Workers Web Crypto는 PBKDF2 100,000회 초과 iteration을 지원하지 않으므로 100,000으로 고정한다.

현재 권한 처리:

```txt
functions/_shared/auth.ts
- requireCurrentUser(request, env)

functions/_shared/auth-session.ts
- getCurrentUser(request, env)
- createAuthSession(db, userId)
- revokeAuthSession(db, token)
- getSessionToken(request)
- setSessionCookieHeader(token, env)
- clearSessionCookieHeader(env)
```

보호된 쓰기/관리 API는 쿠키 세션에서 현재 유저를 확인하고 `currentUser.id` 기준으로 조회/저장/수정/삭제한다.

---

## 4. 현재 확인 가능한 주요 페이지

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

구형 게시글 상세 URL은 redirect한다.

```txt
/explore/:category/:board/:post
→ /explore/post/?id=:post
```

---

## 5. 기능 구현 상태

### 인증

```txt
/signup/ → POST /api/auth/signup → users insert + auth_sessions insert + cookie set
/login/  → POST /api/auth/login  → password verify + auth_sessions insert + cookie set
/logout  → POST /api/auth/logout → current session revoke + cookie clear
/me/     → GET /api/auth/me + GET /api/me/summary
```

회원가입/로그인 화면은 `credentials: same-origin`을 명시하고, 메뉴는 `/api/auth/me`를 호출해 로그인 상태에 따라 `로그인/회원가입` 또는 `내 정보/로그아웃`을 표시한다.

### 장비 관리

```txt
/garage/new/ → POST /api/equipments → currentUser.id 기준 D1 equipments insert
/garage/ → GET /api/equipments → currentUser.id 기준 내 장비 목록
/garage/edit/?id=... → GET/PATCH/DELETE /api/equipments/:id → currentUser.id 소유 장비만 가능
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

정비 기록 API는 먼저 현재 로그인 유저를 확인하고, 해당 장비가 `currentUser.id` 소유인지 확인한다.

PATCH는 동적 SET 절을 사용해 요청 body에 포함된 필드만 수정한다. 누락된 `description`, `usageMetricValue`, `cost`, `shopName` 등이 `null`로 덮이는 문제를 수정했다.

공개 장비 페이지에는 `visibility = public`이고 `deleted_at IS NULL`인 정비 기록만 표시한다.

### 부품 기록

```txt
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...
```

부품 API는 먼저 현재 로그인 유저를 확인하고, 해당 장비가 `currentUser.id` 소유인지 확인한다.

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
→ requireCurrentUser()
→ sanitizePostHtml()
→ D1 posts insert with currentUser.id
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
댓글 작성자 닉네임 users join 표시 ✅
댓글 삭제는 본인 댓글만 가능 ✅
```

### 내 콘텐츠 관리

```txt
/me/ → 프로필 + 활동 요약 + 최근 작성글
/me/posts/ → 내 작성글 목록
/me/posts/edit/?id=... → 내 게시글 수정/삭제
/me/comments/ → 내 댓글 목록/삭제
```

관련 API:

```txt
GET    /api/me/summary
GET    /api/me/posts
GET    /api/me/posts/:id
PATCH  /api/me/posts/:id
DELETE /api/me/posts/:id
GET    /api/me/comments
DELETE /api/me/comments/:id
```

---

## 6. D1/Drizzle schema 상태

현재 사용 중인 주요 테이블:

```txt
users
auth_sessions
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
migrations/0005_add_auth_tables.sql
```

추가된 package scripts:

```txt
npm run d1:migrate:initial:local
npm run d1:migrate:local
npm run d1:migrate:community:local
npm run d1:migrate:board-meta:local
npm run d1:migrate:auth:local
npm run d1:migrate:all:local
npm run d1:tables:local

npm run d1:migrate:initial:remote
npm run d1:migrate:remote
npm run d1:migrate:community:remote
npm run d1:migrate:board-meta:remote
npm run d1:migrate:auth:remote
npm run d1:migrate:all:remote
npm run d1:tables:remote
```

주의:

```txt
새 D1 DB는 0001 → 0002 → 0003 → 0004 → 0005 순서로 적용한다.
0005는 users.credential_hash 컬럼과 auth_sessions 테이블을 추가한다.
ALTER TABLE users ADD COLUMN credential_hash TEXT; 는 같은 DB에 두 번 실행하면 중복 컬럼 오류가 난다.
앞으로 테이블 생성/변경은 migration에서 관리한다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
D1 local/remote migration 흐름은 아직 더 정교하게 정리할 수 있다.
```

---

## 7. 현재 API 목록

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
functions/_shared/auth.ts
functions/_shared/auth-crypto.ts
functions/_shared/auth-session.ts
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

`auth.ts` 주요 함수:

```txt
requireCurrentUser
```

`auth-crypto.ts` 주요 함수:

```txt
hashPassword
verifyPassword
sha256Base64
randomToken
```

`auth-session.ts` 주요 함수:

```txt
createAuthSession
revokeAuthSession
getCurrentUser
getSessionToken
setSessionCookieHeader
clearSessionCookieHeader
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

현재 공통화 상태:

```txt
세션 기반 current user 조회 ✅
장비/정비/부품 소유권 검증 ✅
게시글/댓글 author_id currentUser.id 저장 ✅
내 콘텐츠 관리 API currentUser.id 스코프 적용 ✅
공개 게시글 상세 API 상세 조회 ✅
공개 게시글 상세 API 댓글 목록 조회 ✅
공개 게시글 목록 API 목록 조회 ✅
공개 게시판 목록 API 목록 조회 ✅
공개 장비 API 장비 조회 ✅
공개 장비 API 정비 기록 조회 ✅
공개 장비 API 부품 조회 ✅
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
초기 D1 schema migration 추가 ✅
전체 remote/local migration script 추가 ✅
이메일/비밀번호 직접 로그인 추가 ✅
Cloudflare PBKDF2 iteration 100000 초과 오류 해결 ✅
D1 credential_hash 누락 대응 문서화 ✅
세션 쿠키 유지 문제 보강 ✅
메뉴 로그인 상태 반영 ✅
게시글/댓글 작성자 닉네임 users join 표시 ✅
내 작성글 목록 API 누락 수정 ✅
/me/posts/edit useSearchParams Suspense 빌드 오류 해결 ✅
내 정보/내 작성글/내 댓글 관리 레이아웃 정리 ✅
```

---

## 10. 아직 mock/stub 또는 미완성인 부분

```txt
R2 이미지 업로드
프로필 설정
프로필 이미지
공개 사용자 프로필 페이지
어드민 UI
결제/구독
신고/모더레이션 워크플로우
OpenNext 또는 Workers 런타임 전환 검토
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
```

---

## 11. 다음 개발 추천 순서

### 1순위: 배포 후 회귀 테스트

확인 경로:

```txt
/
/login/
/signup/
/me/
/me/posts/
/me/posts/edit/?id=...
/me/comments/
/explore/
/explore/motorcycle/
/explore/motorcycle/motorcycle-showcase/
/explore/motorcycle/motorcycle-showcase/write/
/explore/post/?id=...
/garage/
/garage/new/
/garage/edit/?id=...
/garage/view/?slug=...
```

확인 항목:

```txt
회원가입 → /me 이동 정상
로그아웃 → 로그인 요구 표시 정상
로그인 → 홈 이동 후 메뉴에 내 정보/로그아웃 표시
/me 활동 요약 숫자 표시
/me/posts 내 작성글 표시
/me/posts/edit 게시글 수정/삭제
/me/comments 내 댓글 표시/삭제
비로그인 /garage 접근 시 로그인 안내
장비 등록/수정/삭제 정상 동작
장비 계정별 분리 확인
공개 장비 조회 정상 동작
private 장비 공개 API 404 확인
글쓰기 저장 → 새 상세로 이동
댓글 작성 → 댓글 목록 반영
댓글 삭제 → 본인 댓글만 삭제 가능
목록에서 HTML 태그 미노출
상세에서 HTML 본문 정상 표시
기존 게시글 URL redirect 정상 동작
정비/부품 PATCH 시 누락 필드 보존 확인
새 D1 DB에 npm run d1:migrate:all:remote 적용 확인
```

### 2순위: 프로필 설정

```txt
users.bio 또는 profile 관련 컬럼 추가
PATCH /api/me/profile
/me/settings/ 페이지
닉네임 변경
소개글 변경
프로필 이미지 준비
```

### 3순위: 이미지 업로드

```txt
Cloudflare R2 연결
게시글 이미지 data URL 제거
장비 대표 이미지 업로드
부품 이미지 업로드
프로필 이미지 업로드
```
