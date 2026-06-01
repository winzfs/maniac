# GEAR DUCK 현재 구현 상태 및 점검 문서

이 문서는 `maniac` 저장소의 현재 `main` 브랜치 기준 실제 구현 상태를 추적한다. 사용자 노출 브랜드는 **GEAR DUCK / 기어덕**이다. 내부 저장소명, DB명, 일부 legacy 문서명에는 `maniac` 또는 `Maniac Garage` 표현이 남아 있을 수 있다.

---

## 1. 현재 한 줄 상태

Cloudflare Pages + Pages Functions + D1 기반으로 장비 기록, 이미지 업로드, 공개 장비 페이지, 커뮤니티 게시판, 외부 뉴스 캐시, 이메일/비밀번호 로그인, 내 정보/내 콘텐츠 관리, 공개 유저 프로필, 홈 콘텐츠 피드, 관리자 화면, SEO 신뢰 페이지, 통합 검색, 카테고리 단위 글쓰기, 동적 sitemap, clean URL redirect까지 1차 MVP가 구현되어 있다.

```txt
브랜드/SEO: GEAR DUCK / 기어덕 / 장비 덕후들의 커뮤니티 ✅
Google Search Console HTML 인증 파일 ✅
robots.txt / sitemap index / 정적·동적 sitemap ✅
SEO 신뢰 페이지: /about /terms /privacy /contact ✅
사이트 전체 Organization / WebSite JSON-LD ✅
게시글 DiscussionForumPosting JSON-LD ✅
공개 유저 ProfilePage JSON-LD ✅
개인/관리/검색 페이지 noindex 정책 ✅
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
공개 장비 clean URL redirect ✅ /gears/[id]/ → /garage/view/?id=...
공개 장비 slug fallback ✅ /garage/view/?slug=...
공개 장비 상세 client-side SEO 메타 갱신 ✅
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
탐색 메뉴명: 기어 둘러보기 ✅
게시판 세부 카테고리: 자랑 / 리뷰 / 자유 / 질문 / 거래 ✅
커뮤니티 정비/부품 세부 카테고리 제거 ✅
카테고리 단위 글쓰기 ✅ /explore/[category]/write/
글쓰기 화면 세부 카테고리 선택 ✅
게시글 작성/상세/수정/삭제 ✅
게시글 clean URL redirect ✅ /posts/[id]/ → /explore/post/?id=...
내부 게시글 링크 clean URL 기준 변경 ✅
게시글 본문 이미지 업로드 ✅ Cloudinary
게시글 sanitizer data:image 차단 ✅
게시글 상세 client-side SEO 메타 갱신 ✅
게시글 상세 breadcrumb 단순화 ✅ 홈 > 카테고리
게시글 상세 하단 돌아가기 버튼 단순화 ✅
댓글 작성/삭제 ✅
댓글 상세 화면 내 댓글 삭제 ✅
댓글 목록 상단 표시 + compact 입력폼 ✅
홈 콘텐츠 피드화 ✅
홈 히어로 내 장비 카드 ✅
홈 히어로 대표 장비 선택 ✅
홈 상단 중앙 로고/오른쪽 사이드 네비게이션 ✅
홈 카테고리 글 상단 배치 ✅
홈 뉴스 hero 카드 제거 ✅
공개 장비/게시글/뉴스 통합 검색 ✅ /search/
검색 결과 링크 clean URL 기준 변경 ✅
검색 매칭 엄격화 ✅ 게시글 제목/본문 중심
런타임 기본 게시판 self-healing ✅
런타임 샘플 커뮤니티 게시글 seed ✅
외부 장비 뉴스 표시 ✅
외부 뉴스 DB 캐시/동기화 ✅
내 정보 페이지 ✅
공개 유저 프로필 페이지 ✅
프로필 설정 페이지 ✅
프로필 이미지 업로드 ✅ Cloudinary
provider 추상화 image_assets ✅ R2 이전 가능 구조
D1 garage schema self-healing ✅
관리자 페이지 레이아웃/뉴스 관리/뉴스 페이지네이션 ✅
개발용 /api/dev/* endpoint 보호 ✅
R2 직접 업로드 ❌ 보류
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
커뮤니티 세부 카테고리: 자랑, 리뷰, 자유, 질문, 거래
```

주의:

```txt
기능명을 과하게 브랜드화하지 않는다.
장비의 정비/부품 기록 기능은 유지한다.
커뮤니티 세부 게시판에서는 정비/부품 탭을 쓰지 않는다.
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
IMAGE_STORAGE_PROVIDER는 명시 필수다.
정적 export 환경 때문에 새 데이터 상세는 query string 기반 정적 shell 방식을 우선 사용한다.
/posts/[id]/, /gears/[id]/는 Pages Function clean URL redirect로 제공한다.
useSearchParams()를 쓰는 클라이언트 컴포넌트는 Suspense로 감싼다.
/garage/[slug] 동적 라우트와 /garage middleware는 사용하지 않는다.
```

---

## 4. 주요 페이지

```txt
/
/search/
/about/
/terms/
/privacy/
/contact/

/explore/
/explore/news/
/explore/[category]/
/explore/[category]/write/
/explore/[category]/[board]/
/explore/[category]/[board]/write/ // 기존 직접 게시판 글쓰기 호환
/posts/[id]/                     // 게시글 clean URL, Pages Function redirect
/explore/post/?id=게시글ID        // 기존 상세 shell/fallback

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
/gears/[id]/                     // 장비 clean URL, Pages Function redirect
/garage/view/?id=장비ID          // 기존 상세 shell/fallback
/garage/view/?slug=장비slug      // 기존 링크 fallback

/admin/
```

공개 상세 공식 노출 URL은 아래 clean URL을 우선 사용한다.

```txt
게시글: /posts/[id]/
장비: /gears/[id]/
```

기존 query string 상세 shell은 호환 및 fallback으로 유지한다.

```txt
게시글: /explore/post/?id=게시글ID
장비: /garage/view/?id=장비ID
```

---

## 5. SEO / Search Console 상태

현재 기준 URL은 Cloudflare Pages 기본 도메인이다.

```txt
https://maniac-c7d.pages.dev
```

관련 파일:

```txt
src/app/layout.tsx
src/shared/components/seo/JsonLd.tsx
src/features/boards/components/PublicPostDetailClient.tsx
src/features/users/components/PublicUserProfileClient.tsx
src/app/about/page.tsx
src/app/terms/page.tsx
src/app/privacy/page.tsx
src/app/contact/page.tsx
public/robots.txt
public/sitemap.xml
public/sitemap-static.xml
functions/sitemap-posts.xml.ts
functions/sitemap-gears.xml.ts
public/googled7e36cbd6c693e0a.html
functions/posts/[id].ts
functions/gears/[id].ts
```

현재 반영 상태:

```txt
metadataBase = https://maniac-c7d.pages.dev
robots.txt Sitemap = https://maniac-c7d.pages.dev/sitemap.xml
sitemap.xml = sitemap index
sitemap-static.xml = 정적 페이지/신뢰 페이지/카테고리
sitemap-posts.xml = 공개 게시글 동적 sitemap, /posts/[id]/ 기준
sitemap-gears.xml = 공개 장비 동적 sitemap, /gears/[id]/ 기준
Google Search Console HTML 인증 파일 추가 완료
Organization / WebSite / SearchAction JSON-LD 적용
DiscussionForumPosting JSON-LD 적용
ProfilePage JSON-LD 적용
공통 푸터에서 /about /terms /privacy /contact 내부 링크 제공
```

색인 제외 정책:

```txt
/search/              noindex, follow
/login/               noindex, follow
/signup/              noindex, follow
/me/*                 noindex, nofollow
/garage/new/          noindex, nofollow
/garage/edit/         noindex, nofollow
```

상세 페이지 SEO 보강 방식:

```txt
/gears/[id]/
→ /garage/view/?id=... 로 Pages Function 302 redirect

/garage/view/?id=...
→ PublicEquipmentDetailClient가 장비 데이터 로딩 후 document.title, description, canonical, og:* 갱신

/garage/view/?slug=...
→ 기존 공유 링크 호환용 fallback

/posts/[id]/
→ /explore/post/?id=... 로 Pages Function 302 redirect

/explore/post/?id=...
→ PublicPostDetailClient가 게시글 데이터 로딩 후 document.title, description, canonical, og:* 갱신
→ DiscussionForumPosting JSON-LD 출력
```

주의:

```txt
현재 /posts/[id]/, /gears/[id]/는 clean URL 진입용 redirect다.
강한 상세 페이지 SEO를 위해서는 추후 301 전환 또는 Pages Function HTML 메타 주입/정적-safe 라우팅을 검토한다.
Next static export + query string 상세 페이지 구조라서 상세 페이지의 완전한 서버 사이드 SEO는 제한적이다.
```

---

## 6. 인증/사용자 상태

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
production 환경에서는 Secure
DB에는 세션 원문이 아니라 verifier_hash 저장
```

보호된 쓰기/관리 API는 쿠키 세션에서 현재 유저를 확인하고 `currentUser.id` 기준으로 조회/저장/수정/삭제한다.

---

## 7. 홈 / 검색 / 뉴스

### 홈

```txt
히어로
- GEAR DUCK 서비스 메시지 + 검색
- 로그인 사용자 내 장비 카드
- 대표 장비 선택값 localStorage(maniac.heroEquipmentId)에 저장

콘텐츠 흐름
- 카테고리 글 // 뉴스 hero 카드 자리로 상단 이동
- 최근 게시글
- 댓글 많은 글
- 인기 공개 장비
- 외부 장비 뉴스 // hero 카드 제거, 일반 리스트 카드만 표시
- 정비 타임라인
- CTA
```

### 통합 검색

```txt
/search/?q=검색어
GET /api/search?q=검색어&type=all|equipment|post|news&limit=...
```

현재 검색 기준:

```txt
게시글: 제목 또는 본문에 입력한 단어가 실제 포함된 경우만 노출
뉴스: 뉴스 제목에 입력한 단어가 실제 포함된 경우만 노출
장비: 장비명, 브랜드, 모델, 설명에 입력한 단어가 실제 포함된 경우만 노출
```

게시판명, 카테고리명, 작성자명, slug 기반 broad matching은 제거했다. 검색 결과의 게시글/장비 내부 링크는 clean URL을 우선 사용한다.

```txt
게시글 결과: /posts/[id]/
장비 결과: /gears/[id]/
```

### 외부 장비 뉴스

```txt
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

---

## 8. 커뮤니티 게시판

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

세부 카테고리:

```txt
showcase → 자랑
review   → 리뷰
free     → 자유
qna      → 질문
trade    → 거래
```

최근 구조 변경:

```txt
/explore/[category]/ 상단에 글쓰기 버튼 표시
/explore/[category]/write/에서 세부 카테고리 선택 후 작성
/explore/[category]/[board]/write/는 기존 직접 게시판 글쓰기 호환용으로 유지
게시글 목록은 모바일 카드형, 데스크톱 커뮤니티 리스트형
게시글 목록 모바일 정보바는 카테고리/작성자/날짜/댓글을 한 줄로 표시
게시글 상세 breadcrumb는 홈 > 카테고리만 표시
게시글 상세 하단은 카테고리 글 목록으로 버튼만 표시
댓글 영역은 달린 댓글 목록을 먼저 보여주고, 입력폼은 아래에 compact 형태로 표시
비로그인 댓글 입력은 textarea 대신 로그인/회원가입 안내 표시
유저 이름 클릭 시 프로필/쪽지 준비 중 메뉴 표시
같은 카테고리 글 추천 영역 표시
```

런타임 self-healing:

```txt
functions/_shared/db-boards.ts
- 기본 게시판이 없으면 /api/public/boards 호출 시 자동 생성
- review/free 누락 보정
- maintenance/parts 게시판은 hidden 처리

functions/_shared/db-posts.ts
- /api/public/posts 호출 시 seed 유저/게시판/샘플 게시글이 없으면 자동 생성
- 모든 카테고리/세부카테고리에 기본 글 추가
- 리뷰 카테고리에는 실제 제품 기반 장문 리뷰 seed 포함
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

## 9. 장비 관리

```txt
/garage/new/ → POST /api/equipments → currentUser.id 기준 D1 equipments insert
/garage/ → GET /api/equipments → currentUser.id 기준 내 장비 목록
/garage/edit/?id=... → GET/PATCH/DELETE /api/equipments/:id → currentUser.id 소유 장비만 가능
/gears/[id]/ → /garage/view/?id=... 로 Pages Function 302 redirect
/garage/view/?id=... → GET /api/public/equipments/:identifier
/garage/view/?slug=... → 기존 공유 링크 fallback
```

공개/상세 장비 JSON API는 id를 먼저 조회하고, id 조회 실패 시 slug fallback 조회한다. 신규 UI/검색/sitemap은 `/gears/[id]/` clean URL을 우선 사용한다.

---

## 10. 이미지 저장 구조

이미지 파일은 현재 Cloudinary에 저장하고, D1에는 provider 중립 메타데이터를 저장한다.

```txt
image_assets
- id
- owner_user_id
- provider       // cloudinary, supabase, later r2
- bucket
- object_key
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

---

## 11. D1 schema / migration 상태

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
0007_add_user_profile_fields.sql
0008_create_image_assets.sql
0009_add_news_items.sql
0014_update_community_board_topics.sql   // review/free 추가, maintenance/parts hidden
0015_seed_rich_community_posts.sql       // 풍부한 seed 콘텐츠
```

주의:

```txt
0014/0015는 운영 DB migration 적용 전이어도 런타임 self-healing으로 일부 보정된다.
단, migration 이력 관리와 대량 seed 운영 정책은 별도 정리가 필요하다.
```

---

## 12. 현재 주요 API

```txt
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/search?q=...

GET    /sitemap-posts.xml
GET    /sitemap-gears.xml

GET    /posts/[id]/   // clean URL redirect
GET    /gears/[id]/   // clean URL redirect

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
GET    /api/public/users/:id
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

## 13. 최근 해결한 주요 이슈

```txt
공개 장비 URL이 slug 단독 기준이라 사용자 간 slug 충돌 가능
→ 신규 clean URL은 /gears/[id]/, 기존 shell은 /garage/view/?id=... 기준으로 변경, slug fallback 유지

게시글 상세가 query string URL만 존재해 공유/SEO URL이 지저분함
→ /posts/[id]/ clean URL redirect 추가, 내부 링크와 sitemap은 /posts/[id]/ 기준으로 변경

게시글 검색이 카테고리/작성자/slug까지 넓게 매칭되어 관련 없는 글 노출
→ 게시글 제목/본문 직접 포함 기준으로 엄격화

뉴스 검색이 published_at_ms 컬럼을 조회해 실패
→ migration 기준 published_at 컬럼으로 수정

검색 전체 탭에서 일부 bucket SQL 실패가 전체 응답을 깨뜨릴 가능성
→ bucket별 safeSearch로 독립 처리

커뮤니티 세부 카테고리 변경 후 자유/리뷰가 DB에 없어 노출 안 됨
→ 기본 게시판 런타임 self-healing 추가

seed migration 파일만 추가되어 운영 DB에 글이 안 보임
→ 공개 posts API 호출 시 런타임 seed 보정 추가

게시글 상세 breadcrumb가 홈 > 기어 둘러보기 > 카테고리 > 세부카테고리 > 게시글로 과함
→ 홈 > 카테고리로 단순화

게시글 상세 하단 게시판 배너/바로가기 박스가 과함
→ 카테고리 글 목록으로 버튼만 유지

댓글 입력폼이 댓글 목록보다 먼저 나오고 비활성처럼 보임
→ 댓글 목록 상단, 입력폼 하단, 흰색 compact textarea로 변경

게시글 sanitizer가 data:image를 허용
→ data:image 차단, http/https 이미지 URL만 허용

/api/news 응답 캐시로 숨김 뉴스가 잠시 계속 보임
→ Cache-Control no-store로 변경

홈 뉴스 hero 카드가 과하게 큼
→ 뉴스 hero 카드 제거, 카테고리 글 영역을 상단으로 이동
```

---

## 14. 아직 미완성인 부분

```txt
R2 직접 업로드 provider
뉴스 자동 동기화 Cron Trigger
관리자/모더레이션 고도화
신고/모더레이션 워크플로우
D1 local migration 흐름 고도화
migration 적용 이력 관리 방식 검토
런타임 seed를 운영 정책에 맞는 관리형 seed/관리자 도구로 전환
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
clean URL 302 → 301 전환 검토
정적-safe 공개 상세 SEO 라우팅 또는 Pages Function HTML 메타 주입
정식 도메인 및 문의 이메일 연결
```

---

## 15. 다음 개발 추천 순서

1. Production 배포 후 회귀 테스트
2. `/sitemap.xml`, `/sitemap-posts.xml`, `/sitemap-gears.xml`, `/posts/[id]/`, `/gears/[id]/` 집중 확인
3. Search Console sitemap 재제출 및 주요 URL 색인 요청
4. clean URL redirect 302 → 301 전환 검토
5. 런타임 seed 정책 정리 및 관리자 seed/콘텐츠 관리 도구화
6. 정식 도메인/문의 이메일 연결
7. 정적-safe 공개 상세 SEO 라우팅 또는 Pages Function HTML 메타 주입 검토
8. 뉴스 자동 동기화 Cron Trigger 추가
9. 신고/모더레이션 워크플로우
10. 관리자/모더레이션 고도화
11. 결제/구독
