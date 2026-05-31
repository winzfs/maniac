# GEAR DUCK 현재 구현 상태 및 점검 문서

이 문서는 `maniac` 저장소의 현재 `main` 브랜치 기준 실제 구현 상태를 추적한다. 기획 문서는 장기 방향을 설명하고, 이 문서는 배포 구조, 동작 페이지, API, D1 연동, SEO, 최근 해결 이슈, 남은 작업을 기준으로 관리한다.

사용자 노출 브랜드는 **GEAR DUCK / 기어덕**이다. 내부 저장소명, DB명, 일부 legacy 문서명에는 `maniac` 또는 `Maniac Garage` 표현이 남아 있을 수 있다.

---

## 1. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 기록, 이미지 업로드, 공개 장비 페이지, 커뮤니티 게시판, 외부 뉴스 캐시, 이메일/비밀번호 로그인, 내 정보/내 콘텐츠 관리, 홈 콘텐츠 피드, 관리자 화면, SEO 신뢰 페이지까지 1차 MVP가 구현되어 있다.

```txt
브랜드/SEO: GEAR DUCK / 기어덕 / 장비 덕후들의 커뮤니티 ✅
Google Search Console HTML 인증 파일 ✅
robots.txt / sitemap.xml ✅
SEO 신뢰 페이지: /about /terms /privacy /contact ✅
공통 푸터 ✅
기준 URL: https://maniac-c7d.pages.dev ✅
이메일 회원가입/로그인/로그아웃 ✅
HttpOnly 쿠키 기반 세션 ✅
사용자별 장비/게시글/댓글 데이터 분리 ✅
장비 CRUD ✅
장비 대표 사진 업로드 ✅ Cloudinary
장비 등록/수정 대표 사진 미리보기 ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
부품 사진 업로드 ✅ Cloudinary
공개/상세 장비 페이지 ✅ /garage/view/?id=...
공개 장비 slug fallback ✅ /garage/view/?slug=...
공개 장비 상세 client-side SEO 메타 갱신 ✅
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
탐색 메뉴명: 기어 둘러보기 ✅
게시글 작성/상세/수정/삭제 ✅
게시글 본문 이미지 업로드 ✅ Cloudinary
게시글 sanitizer data:image 차단 ✅
게시글 상세 client-side SEO 메타 갱신 ✅
댓글 작성/삭제 ✅
내 정보 페이지 ✅
프로필 설정 페이지 ✅
프로필 이미지 업로드 ✅ Cloudinary
provider 추상화 image_assets ✅ R2 이전 가능 구조
D1 garage schema self-healing ✅
관리자 페이지 레이아웃/뉴스 관리/뉴스 페이지네이션 ✅
홈 콘텐츠 피드화 ✅
홈 히어로 내 장비 카드 ✅
홈 히어로 대표 장비 선택 ✅
외부 장비 뉴스 표시 ✅
외부 뉴스 DB 캐시/동기화 ✅
샘플 콘텐츠 seed endpoint ✅
개발용 /api/dev/* endpoint 보호 ✅
R2 업로드 ❌ 보류
결제/구독 ❌ 미구현
관리자/모더레이션 고도화 ❌ 진행 중
```

---

## 2. 브랜드/용어 기준

```txt
서비스명: GEAR DUCK
한글명: 기어덕
슬로건: 장비 덕후들의 커뮤니티
마스코트 방향: 오리
```

사용자 노출 문구 기준:

```txt
브랜드/상단 카피/SEO: GEAR DUCK, 기어덕, 장비 덕후들의 커뮤니티
기능 용어: 장비, 내 차고, 정비 기록, 부품 기록, 게시글, 댓글, 공개 페이지
탐색 메뉴: 기어 둘러보기
```

주의:

```txt
기능명을 과하게 브랜드화하지 않는다.
예: 부품 기록을 덕템 기록으로 바꾸지 않는다.
예: 정비 기록을 관리 기록으로 일괄 치환하지 않는다.
```

---

## 3. 배포/런타임 구조

현재 프로젝트는 Next.js static export와 Cloudflare Pages Functions를 함께 사용한다.

```txt
Next.js static export
Cloudflare Pages
Cloudflare Pages Functions
Cloudflare D1
Cloudinary // active image provider
Supabase Storage // optional provider
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
이미지는 IMAGE_STORAGE_PROVIDER=cloudinary 설정 시 Cloudinary에 업로드한다.
IMAGE_STORAGE_PROVIDER는 명시 필수다.
정적 export 환경 때문에 새 데이터 상세는 query string 기반 정적 shell 방식을 우선 사용한다.
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
- 응답 Cache-Control no-store

외부 Google News RSS fetch
- Cloudflare fetch cacheTtl 900초
```

---

## 4. SEO / Search Console 상태

현재 기준 URL은 Cloudflare Pages 기본 도메인이다.

```txt
https://maniac-c7d.pages.dev
```

관련 파일:

```txt
src/app/layout.tsx
src/shared/components/navigation/SiteFooter.tsx
src/app/about/page.tsx
src/app/terms/page.tsx
src/app/privacy/page.tsx
src/app/contact/page.tsx
public/robots.txt
public/sitemap.xml
public/googled7e36cbd6c693e0a.html
```

현재 반영 상태:

```txt
metadataBase = https://maniac-c7d.pages.dev
robots.txt Sitemap = https://maniac-c7d.pages.dev/sitemap.xml
sitemap.xml 주요 정적 페이지 및 신뢰 페이지 포함
Google Search Console HTML 인증 파일 추가 완료
공통 푸터에서 /about /terms /privacy /contact 내부 링크 제공
```

상세 페이지 SEO 보강 방식:

```txt
/garage/view/?id=...
→ PublicEquipmentDetailClient가 장비 데이터 로딩 후 document.title, description, canonical, og:* 갱신

/garage/view/?slug=...
→ 기존 공유 링크 호환용 fallback

/explore/post/?id=...
→ PublicPostDetailClient가 게시글 데이터 로딩 후 document.title, description, canonical, og:* 갱신
```

주의:

```txt
Next static export + query string 상세 페이지 구조라서 상세 페이지의 완전한 서버 사이드 SEO는 제한적이다.
Google이 JS 렌더링을 처리하면 일부 메타 갱신을 반영할 수 있지만, 강한 SEO를 원하면 정적-safe 라우팅 또는 Pages Function HTML 메타 주입 전략이 필요하다.
무료 mooo.com 도메인은 CNAME 제한으로 Cloudflare Pages custom domain 연결이 불가했다.
따라서 현재 SEO 기준 도메인은 https://maniac-c7d.pages.dev 로 복구했다.
```

---

## 5. 인증/사용자 상태

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

보호된 쓰기/관리 API는 쿠키 세션에서 현재 유저를 확인하고 `currentUser.id` 기준으로 조회/저장/수정/삭제한다.

---

## 6. 현재 확인 가능한 주요 페이지

```txt
/
/about/
/terms/
/privacy/
/contact/

/explore/
/explore/news/
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
/garage/view/?id=장비ID
/garage/view/?slug=장비slug // 기존 링크 fallback

/admin/
```

장비 상세/공개 페이지 공식 URL은 반드시 아래 형식을 사용한다.

```txt
/garage/view/?id=장비ID
```

중요:

```txt
/garage/[slug]/ 라우트는 사용하지 않는다.
functions/garage/_middleware.ts도 사용하지 않는다.
구형 /garage/:slug/ redirect를 위해 /garage middleware를 추가하면 /garage/ 내 차고 라우팅과 충돌할 수 있다.
slug 기반 /garage/view/?slug=...는 기존 공유 링크 호환용 fallback이다.
```

---

## 7. 기능 구현 상태

### 홈

홈은 단순 소개형 페이지에서 실제 콘텐츠 피드형 페이지로 전환했다.

```txt
히어로
- 왼쪽: GEAR DUCK 서비스 메시지 + 검색
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
공개 장비: /garage/view/?id=...로 이동
비공개 장비: /garage/edit/?id=...로 이동
```

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
- page / limit 기반 페이지네이션 지원
- hidden_at IS NULL 항목만 표시
- 응답 Cache-Control no-store

GET/POST /api/dev/sync-news
- 외부 RSS에서 최신 뉴스 수집
- news_items 테이블에 INSERT OR IGNORE
- link unique index로 중복 방지

GET/POST /api/dev/hide-news
- 뉴스 id 또는 link 기준 hidden_at 설정
- 물리 삭제가 아니라 숨김 처리
```

관리자 뉴스 탭:

```txt
/api/admin/overview?newsLimit=12&newsPage=1
- newsPagination 메타 반환
- 관리자 UI에서 이전/다음/페이지 번호 표시
- 뉴스 삭제 버튼은 hidden_at 숨김 처리
```

### 장비 관리

```txt
/garage/new/ → POST /api/equipments → currentUser.id 기준 D1 equipments insert
/garage/ → GET /api/equipments → currentUser.id 기준 내 장비 목록
/garage/edit/?id=... → GET/PATCH/DELETE /api/equipments/:id → currentUser.id 소유 장비만 가능
/garage/view/?id=... → GET /api/public/equipments/:identifier
/garage/view/?slug=... → 기존 공유 링크 fallback
```

공개/상세 장비 JSON API는 아래처럼 동작한다.

```txt
identifier를 id로 먼저 조회
id 조회 실패 시 slug fallback 조회
visibility = public AND moderation_status = normal → 누구나 보기 가능
private/unlisted 장비 → 로그인한 소유자면 보기 가능
다른 사람의 private/unlisted 장비 → Equipment not found
```

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

게시글 본문 이미지 흐름:

```txt
POST /api/uploads/post-image
→ 로그인 확인
→ active image provider 업로드
→ image_assets insert with purpose=post_image
→ public_url 반환
→ 게시글 본문 img src로 삽입
```

게시글 sanitizer는 data URL 기반 이미지 삽입을 차단하고, http/https 이미지 URL만 허용한다.

---

## 8. 이미지 저장 구조

이미지 파일은 현재 Cloudinary에 저장하고, D1에는 provider 중립 메타데이터를 저장한다.

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
IMAGE_STORAGE_PROVIDER는 명시 필수다.
CLOUDINARY_API_SECRET은 서버 환경변수로만 보관한다.
Cloudinary API key는 upload/create 권한이 있어야 한다.
제한된 key를 쓰면 Request forbidden due to missing permissions actions=[create] 오류가 난다.
```

---

## 9. D1 schema / migration 상태

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
0007_add_user_profile_fields.sql         // 프로필 bio
0008_create_image_assets.sql             // 이미지 메타데이터
0009_add_news_items.sql                  // 뉴스 캐시
```

주의:

```txt
0006은 필수 schema migration이 아니라 선택 seed다.
0007은 users.bio 컬럼을 추가한다.
0008은 image_assets 테이블과 users.profile_image_asset_id 컬럼을 추가한다.
0009는 news_items 테이블을 생성하는 schema migration이다.
Drizzle schema와 SQL migration이 어긋나지 않게 변경 시 둘 다 확인해야 한다.
```

---

## 10. 현재 주요 API

```txt
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/me/profile
PATCH  /api/me/profile
POST   /api/uploads/profile-image
POST   /api/uploads/equipment-image
POST   /api/uploads/part-image
POST   /api/uploads/post-image
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
GET    /api/public/equipments/:identifier
GET    /api/public/boards
GET    /api/public/posts?category=...
GET    /api/public/posts?board=...
GET    /api/public/posts?sort=latest
GET    /api/public/posts?sort=popular
GET    /api/public/posts/:id
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...

GET    /api/news?limit=18&page=1
GET    /api/admin/overview?newsLimit=12&newsPage=1
GET    /api/dev/sync-news
POST   /api/dev/sync-news
GET    /api/dev/hide-news
POST   /api/dev/hide-news
```

---

## 11. 최근 해결한 주요 이슈

```txt
공개 장비 URL이 slug 단독 기준이라 사용자 간 slug 충돌 가능
→ 신규 canonical/공유 URL을 /garage/view/?id=... 기준으로 변경, slug fallback 유지

Drizzle schema와 migration 컬럼 불일치
→ users credential_hash/bio/profile_image_asset_id, auth_sessions, image_assets, news_items 반영

Pages Function 파일에 method handler와 catch-all onRequest 혼재
→ OPTIONS 전용 handler로 정리

이미지 provider fallback이 운영 설정 오류를 숨김
→ IMAGE_STORAGE_PROVIDER 명시 필수화

게시글 sanitizer가 data:image를 허용
→ data:image 차단, http/https 이미지 URL만 허용

/api/news 응답 캐시로 숨김 뉴스가 잠시 계속 보임
→ Cache-Control no-store로 변경

뉴스를 물리 삭제하면 RSS sync에서 다시 들어올 수 있음
→ hidden_at 숨김 처리로 변경

뉴스 게시판/관리자 뉴스 탭 목록이 고정 개수만 보여짐
→ page/limit 기반 페이지네이션 추가

useSearchParams()를 쓰는 뉴스 게시판이 Suspense 없이 static export 빌드 실패
→ /explore/news page에서 Suspense fallback으로 감쌈

SEO 신뢰 페이지와 푸터 부재
→ /about /terms /privacy /contact 및 공통 푸터 추가

브랜드 문구가 GearDuck / 기록 차고로 혼재
→ GEAR DUCK / 장비 덕후들의 커뮤니티 기준으로 정리
```

---

## 12. 아직 미완성인 부분

```txt
R2 직접 업로드 provider
공개 사용자 프로필 페이지
뉴스 자동 동기화 Cron Trigger
관리자/모더레이션 고도화
신고/모더레이션 워크플로우
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
정적-safe 공개 상세 SEO 라우팅
개인 페이지 noindex 정책 검토
정식 도메인 및 문의 이메일 연결
```

---

## 13. 다음 개발 추천 순서

1. Production 배포 후 회귀 테스트
2. Search Console sitemap 상태 확인 및 주요 URL 색인 요청
3. 정식 도메인/문의 이메일 연결
4. 개인 페이지 noindex 정책 검토
5. 공개 장비/게시글 상세 SEO 라우팅 전략 검토
6. 뉴스 자동 동기화 Cron Trigger 추가
7. 신고/모더레이션 워크플로우
8. 관리자/모더레이션 고도화
9. 결제/구독
