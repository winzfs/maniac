# Maniac Garage 현재 구현 상태 및 점검 문서

이 문서는 `maniac` 저장소의 현재 `main` 브랜치 기준 실제 구현 상태를 추적한다. 기획 문서는 장기 방향을 설명하고, 이 문서는 배포 구조, 동작 페이지, API, D1 연동, 최근 해결 이슈, 남은 작업을 기준으로 관리한다.

---

## 1. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 기록, 장비 대표 이미지 업로드, 공개/상세 장비 페이지, 커뮤니티 게시판, 외부 뉴스 캐시, 이메일/비밀번호 로그인, 내 정보/내 콘텐츠 관리, 홈 콘텐츠 피드까지 1차 MVP가 구현되어 있다.

```txt
이메일 회원가입/로그인/로그아웃 ✅
HttpOnly 쿠키 기반 세션 ✅
사용자별 장비/게시글/댓글 데이터 분리 ✅
장비 CRUD ✅
장비 대표 사진 업로드 ✅ Cloudinary
장비 등록/수정 대표 사진 미리보기 ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
공개/상세 장비 페이지 ✅ /garage/view/?slug=...
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
게시글 작성/상세/수정/삭제 ✅
게시글 상세 화면 작성자 수정/삭제 ✅
댓글 작성/삭제 ✅
댓글 상세 화면 내 댓글 삭제 ✅
내 정보 페이지 ✅
프로필 설정 페이지 ✅
프로필 이미지 업로드 ✅ Cloudinary
provider 추상화 image_assets ✅ R2 이전 가능 구조
D1 garage schema self-healing ✅
관리 페이지 레이아웃 1차 정리 ✅
홈 콘텐츠 피드화 ✅
홈 히어로 내 장비 카드 ✅
홈 히어로 대표 장비 선택 ✅
외부 장비 뉴스 표시 ✅
외부 뉴스 DB 캐시/동기화 ✅
샘플 콘텐츠 seed endpoint ✅
Dev Maniac 초기 콘텐츠 cleanup endpoint ✅
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
Cloudinary // active image provider
Supabase Storage // optional fallback provider
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
현재 이미지는 IMAGE_STORAGE_PROVIDER=cloudinary 설정 시 Cloudinary에 업로드한다.
정적 export 환경 때문에 새 데이터 상세는 동적 라우트보다 query string 기반 정적 shell 방식을 우선 사용한다.
useSearchParams()를 쓰는 클라이언트 컴포넌트는 static export 빌드 안정성을 위해 Suspense로 감싼다.
/garage/[slug] 동적 라우트와 /garage middleware는 사용하지 않는다.
```

캐시/헤더:

```txt
public/_headers
- 일반 페이지: Cache-Control no-store
- /_next/static/*: public, max-age=31536000, immutable

/api/news
- DB 캐시 뉴스 우선
- 응답 Cache-Control public, max-age=300

외부 Google News RSS fetch
- Cloudflare fetch cacheTtl 900초
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

권한 처리:

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
/me/settings/
/me/posts/
/me/posts/edit/?id=게시글ID
/me/comments/

/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/view/?slug=장비slug
```

구형 게시글 상세 URL은 redirect한다.

```txt
/explore/:category/:board/:post
→ /explore/post/?id=:post
```

장비 상세/공개 페이지는 반드시 아래 형식을 사용한다.

```txt
/garage/view/?slug=장비slug
```

중요:

```txt
/garage/[slug]/ 라우트는 사용하지 않는다.
functions/garage/_middleware.ts도 사용하지 않는다.
구형 slug redirect를 위해 /garage middleware를 추가하면 /garage/ 내 차고 라우팅과 충돌할 수 있다.
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

메뉴의 주요 대시보드 링크는 Next client routing/RSC 캐시 혼선을 줄이기 위해 hard navigation을 사용한다.

```txt
메뉴 → 홈 / 장비 둘러보기 / 내 차고 / 내 정보 / 로그인 / 회원가입
button click → window.location.assign(...)
```

### 홈

홈은 단순 소개형 페이지에서 실제 콘텐츠 피드형 페이지로 전환했다.

```txt
히어로
- 왼쪽: 서비스 메시지 + 검색
- 오른쪽: 로그인 사용자 내 장비 카드

콘텐츠 피드
- 외부 장비 뉴스
- 최근 게시글
- 댓글 많은 글
- 인기 공개 장비
- 정비 타임라인 + 카테고리 게시판
- CTA
```

히어로 내 장비 카드 동작:

```txt
로그인 전: 로그인/회원가입 CTA 표시
로그인 후 + 장비 없음: 장비 등록 CTA 표시
로그인 후 + 장비 있음: 내 장비 1개 표시
내 장비 2개 이상: 대표 장비 선택 드롭다운 표시
대표 장비 선택값: localStorage(maniac.heroEquipmentId)에 저장
공개 장비: /garage/view/?slug=...로 이동
비공개 장비: /garage/edit/?id=...로 이동
```

홈 콘텐츠 API:

```txt
GET /api/news?limit=10
GET /api/public/posts?limit=6&sort=latest
GET /api/public/posts?limit=6&sort=popular
GET /api/public/equipments?limit=6
GET /api/public/boards
GET /api/equipments  // 히어로 내 장비 카드용, 로그인 필요
```

`sort=popular`는 댓글 수 많은 순으로 공개 게시글을 정렬한다.

### 외부 장비 뉴스

뉴스는 외부 RSS를 즉시 표시하는 구조에서 D1 캐시 기반 구조로 확장했다.

```txt
functions/_shared/news.ts
- Google News RSS 검색어 관리
- RSS fetch
- XML item parse
- publishedAtMs 정렬

GET /api/news
- news_items DB에 저장된 뉴스 우선 조회
- DB가 비어 있거나 news_items migration 미적용이면 RSS fallback
- 응답은 홈 장비 뉴스 섹션에서 표시

GET/POST /api/dev/sync-news
- 외부 RSS에서 최신 뉴스 수집
- news_items 테이블에 INSERT OR IGNORE
- link unique index로 중복 방지
```

뉴스 수집 카테고리:

```txt
motorcycle / 바이크
pc / PC
keyboard / 키보드
bicycle / 자전거
camera / 카메라
camping / 캠핑
audio / 오디오
```

운영 흐름:

```txt
1. npm run d1:migrate:news:remote 로 news_items 테이블 생성
2. 배포 후 /api/dev/sync-news 실행
3. /api/news는 DB에 저장된 뉴스를 반환
4. DB가 비어 있으면 RSS fallback으로 표시
```

주의:

```txt
/api/dev/sync-news는 개발용 endpoint다.
현재 /api/dev/*는 dev middleware 보호 대상이다.
운영 자동화를 하려면 Cloudflare Cron Trigger 또는 별도 admin action으로 옮긴다.
```

### 장비 관리

```txt
/garage/new/ → POST /api/equipments → currentUser.id 기준 D1 equipments insert
/garage/ → GET /api/equipments → currentUser.id 기준 내 장비 목록
/garage/edit/?id=... → GET/PATCH/DELETE /api/equipments/:id → currentUser.id 소유 장비만 가능
/garage/view/?slug=... → GET /api/public/equipments/:slug
```

장비 대표 이미지:

```txt
POST /api/uploads/equipment-image
→ 로그인 확인
→ active image provider 업로드
→ image_assets insert with purpose=equipment_main_image
→ public_url 반환
```

장비 등록/수정 흐름:

```txt
/garage/new/
→ 대표 사진 선택
→ /api/uploads/equipment-image 업로드
→ 반환된 public_url을 mainImageUrl로 저장
→ POST /api/equipments

/garage/edit/?id=...
→ 대표 사진 교체 업로드
→ 미리보기 변경
→ 수정 저장 시 PATCH /api/equipments/:id 로 mainImageUrl 반영
```

공개/상세 장비 JSON API는 아래처럼 동작한다.

```txt
visibility = public AND moderation_status = normal → 누구나 보기 가능
private/unlisted 장비 → 로그인한 소유자면 보기 가능
다른 사람의 private/unlisted 장비 → Equipment not found
```

### 정비 기록

```txt
GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=...
DELETE /api/equipments/:id/logs?logId=...
```

정비 기록 API는 먼저 현재 로그인 유저를 확인하고, 해당 장비가 `currentUser.id` 소유인지 확인한다.

PATCH는 동적 SET 절을 사용해 요청 body에 포함된 필드만 수정한다. 누락된 `description`, `usageMetricValue`, `cost`, `shopName` 등이 `null`로 덮이는 문제를 수정했다.

공개 장비 페이지에는 공개 기록만 표시한다. 단, 로그인한 소유자가 자기 장비를 보는 경우 비공개 기록도 볼 수 있다.

### 부품 기록

```txt
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...
```

부품 기록 API도 currentUser 소유 장비 기준으로만 동작한다.

공개 장비 페이지에는 공개 부품만 표시한다. 단, 로그인한 소유자가 자기 장비를 보는 경우 비공개 부품도 볼 수 있다.

### 커뮤니티 게시판

```txt
GET  /api/public/boards
GET  /api/public/posts?category=...
GET  /api/public/posts?board=...
GET  /api/public/posts?sort=latest
GET  /api/public/posts?sort=popular
GET  /api/public/posts/:id
POST /api/posts
POST /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
```

게시글 상세 화면에서 작성자면 수정/삭제 버튼이 표시된다.

```txt
수정 → /me/posts/edit/?id=게시글ID
삭제 → DELETE /api/me/posts/:id
```

댓글은 상세 화면에서 내가 쓴 댓글이면 바로 삭제할 수 있다.

```txt
DELETE /api/public/posts/:id/comments?commentId=...
```

---

## 6. 이미지 저장 구조

이미지 파일은 현재 Cloudinary에 저장하고, Maniac D1에는 provider 중립 메타데이터만 저장한다.

```txt
image_assets
- id
- owner_user_id
- provider       // cloudinary, supabase, later r2
- bucket         // cloudinary cloud name or storage bucket
- object_key     // Cloudinary public_id or storage object key
- public_url
- purpose        // profile_image, equipment_main_image, part_image, post_image 등
- mime_type
- size_bytes
- width / height
- deleted_at
```

현재 active provider:

```txt
IMAGE_STORAGE_PROVIDER=cloudinary
```

Cloudinary 환경변수:

```txt
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=maniac
```

주의:

```txt
CLOUDINARY_API_SECRET은 서버 환경변수로만 보관한다.
Cloudinary API key는 upload/create 권한이 있어야 한다.
제한된 key를 쓰면 Request forbidden due to missing permissions actions=[create] 오류가 난다.
```

구현 파일:

```txt
functions/_shared/image-storage.ts
- CloudinaryImageStorageProvider
- SupabaseImageStorageProvider
- createImageStorageProvider(env)
- createImageObjectKey(...)
```

---

## 7. D1 schema / migration 상태

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
image_assets
news_items
```

주요 migration:

```txt
0001_initial.sql
0002_add_maintenance_logs_and_parts.sql
0003_add_boards_posts_comments.sql
0004_add_board_metadata.sql
0005_add_auth_tables.sql
0006_seed_real_equipment_posts.sql       // 선택 seed
0007_add_news_items.sql                  // 뉴스 캐시
```

현재 package script:

```txt
npm run d1:migrate:news:local
npm run d1:migrate:news:remote
npm run d1:migrate:all:local
npm run d1:migrate:all:remote
npm run d1:seed:samples:local
npm run d1:seed:samples:remote
```

뉴스 기능 배포 후 필요한 순서:

```bash
npm run d1:migrate:news:remote
# 또는 새 DB라면
npm run d1:migrate:all:remote
```

주의:

```txt
0006은 필수 schema migration이 아니라 선택 seed다.
0007은 news_items 테이블을 생성하는 schema migration이다.
기존 운영 DB에 news_items가 없어도 /api/news는 RSS fallback으로 동작한다.
/api/dev/sync-news로 DB 저장을 하려면 0007 적용이 필요하다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
```

---

## 8. D1 schema drift 대응

운영 D1에 migration이 일부 빠진 상태에서 최신 코드가 배포되면 `no such column`, `no such table` 오류가 발생할 수 있다.

정식 해결은 migration 적용이다.

```bash
npm run d1:migrate:all:remote
```

다만 모바일 환경 등에서 즉시 migration을 실행하기 어려운 상황을 대비해 핵심 garage 기능에는 self-healing helper를 둔다.

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

사용 위치:

```txt
GET  /api/equipments
POST /api/equipments
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
```

---

## 9. 현재 주요 API

```txt
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/me/profile
PATCH  /api/me/profile
POST   /api/uploads/profile-image
POST   /api/uploads/equipment-image
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

GET    /api/news
GET    /api/dev/sync-news
POST   /api/dev/sync-news
```

개발/샘플 데이터용 endpoint:

```txt
GET/POST /api/dev/seed-lite
GET/POST /api/dev/seed-samples
GET/POST /api/dev/cleanup-dev-maniac
GET/POST /api/dev/sync-news
```

`/api/dev/*` endpoint는 `functions/api/dev/_middleware.ts`에서 기본 차단한다.

```txt
DEV_TOOLS_ENABLED=true 일 때만 접근 가능
APP_ENV=production 에서는 DEV_TOOLS_SECRET 필수
DEV_TOOLS_SECRET이 설정된 경우 x-dev-tools-secret header 또는 token query string 값이 일치해야 함
```

---

## 10. 최근 해결한 주요 이슈

```txt
Supabase free quota 제한으로 이미지 업로드가 막힘
→ Cloudinary active provider 추가

Cloudinary restricted API key로 upload create 권한 오류 발생
→ upload/create 권한 있는 key 사용 필요 문서화

Production D1 schema drift로 no such column/table 오류 연쇄 발생
→ ensure-garage-schema helper 추가

/garage/[slug] 동적 라우트가 static export 빌드를 깨뜨림
→ 동적 slug 라우트 제거, /garage/view/?slug=... 통일

functions/garage/_middleware.ts가 /garage 라우팅과 충돌
→ middleware 제거

Next Link client routing/RSC 캐시 혼선으로 메뉴 이동 시 잘못된 화면 노출
→ 메뉴 주요 링크 hard navigation 처리

/me 페이지에 RSC payload 원문이 보이는 캐시/헤더 문제
→ public/_headers로 일반 페이지 no-store, static chunk immutable 설정

외부 뉴스가 홈 접속 때마다 RSS만 직접 조회하던 구조
→ news_items D1 캐시 + /api/dev/sync-news 동기화 구조 추가
```

---

## 11. 아직 미완성인 부분

```txt
부품 이미지 업로드
게시글 본문 이미지 업로드
R2 직접 업로드 provider
공개 사용자 프로필 페이지
뉴스 자동 동기화 Cron Trigger
뉴스 숨김/고정 관리자 UI
어드민 UI
결제/구독
신고/모더레이션 워크플로우
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
```

---

## 12. 다음 개발 추천 순서

1. Production 배포 후 회귀 테스트
2. `npm run d1:migrate:news:remote` 적용
3. `/api/dev/sync-news` 실행 후 홈 뉴스 DB source 확인
4. 뉴스 자동 동기화 Cron Trigger 추가
5. 장비 등록/수정/목록/상세 이미지 흐름 안정화 확인
6. 부품 이미지 업로드
7. 게시글 본문 이미지 data URL 제거 및 업로드 전환
8. 신고/모더레이션 워크플로우
9. 관리자 UI
10. 결제/구독
