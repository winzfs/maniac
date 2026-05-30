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
장비 대표 사진 업로드 ✅ Cloudinary
장비 등록/수정 대표 사진 미리보기 ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
공개/상세 장비 페이지 ✅ /garage/view/?slug=...
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
게시글 작성/상세/수정/삭제 ✅
게시글 본문 이미지 업로드 ✅ Cloudinary
게시글 상세 화면 작성자 수정/삭제 ✅
댓글 작성/삭제 ✅
댓글 상세 화면 내 댓글 삭제 ✅
내 정보 페이지 ✅
프로필 설정 페이지 ✅
프로필 이미지 업로드 ✅ Cloudinary
provider 추상화 image_assets ✅ R2 이전 가능 구조
D1 garage schema self-healing ✅
홈 콘텐츠 피드화 ✅
홈 히어로 내 장비 카드 ✅
샘플 콘텐츠 seed endpoint ✅
개발용 /api/dev/* endpoint 보호 ✅
R2 직접 업로드 ❌ 보류
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
docs/cloudinary-image-provider.md
docs/deploy-trigger.md
```

---

## 배포/런타임 구조

현재 프로젝트는 Next.js static export와 Cloudflare Pages Functions를 함께 사용합니다.

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
D1 binding은 wrangler.toml 기준으로 관리합니다.
Cloudflare 대시보드에서 binding을 추가해도 wrangler.toml 설정이 우선될 수 있습니다.
현재 이미지는 IMAGE_STORAGE_PROVIDER=cloudinary 설정 시 Cloudinary에 업로드합니다.
이미지 메타데이터는 D1 image_assets에 provider/bucket/object_key/public_url 형태로 저장합니다.
나중에 R2로 이전할 때 feature table 구조를 바꾸지 않고 provider/object_key/public_url만 갱신할 수 있게 유지합니다.
정적 export 환경 때문에 새 데이터 상세는 query string 기반 정적 shell 방식을 우선 사용합니다.
/garage/[slug] 동적 라우트와 /garage middleware는 사용하지 않습니다.
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

린트:

```bash
npm run lint
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

## 환경변수

Cloudinary를 이미지 provider로 사용할 때 Cloudflare Pages Production 환경변수에 아래 값을 설정합니다.

```txt
IMAGE_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=maniac
```

주의:

```txt
CLOUDINARY_API_SECRET은 브라우저에 노출하지 않습니다.
Cloudflare Pages Function에서 서버 경유 업로드합니다.
Cloudinary API key는 upload/create 권한이 있는 key를 사용해야 합니다.
Supabase Storage를 fallback으로 쓰려면 IMAGE_STORAGE_PROVIDER=supabase와 SUPABASE_* 환경변수를 사용합니다.
```

Supabase fallback 변수:

```txt
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=maniac-images
SUPABASE_PUBLIC_STORAGE_BASE_URL=선택값
```

---

## D1 migration 및 운영 보강

새 D1 데이터베이스에는 아래 순서로 migration을 적용합니다.

```txt
migrations/0001_initial.sql
migrations/0002_add_maintenance_logs_and_parts.sql
migrations/0003_add_boards_posts_comments.sql
migrations/0004_add_board_metadata.sql
migrations/0005_add_auth_tables.sql
migrations/0007_add_user_profile_fields.sql
migrations/0008_create_image_assets.sql
migrations/0009_add_news_items.sql
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

현재 Production에서 migration 누락이 발생해도 핵심 garage 기능이 완전히 죽지 않도록 아래 self-healing helper를 둡니다.

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

프로필/이미지 업로드 API도 필요한 경우 일부 컬럼과 `image_assets`를 자동 보강합니다. 다만 신규 환경에서는 정식 migration 적용을 우선합니다.

---

## 이미지 저장 구조

이미지 파일은 현재 Cloudinary에 저장하고, Maniac D1에는 provider 중립 메타데이터만 저장합니다.

```txt
image_assets
- id
- owner_user_id
- provider       // cloudinary, supabase, later r2
- bucket         // cloudinary cloud name or storage bucket
- object_key     // Cloudinary public_id or storage object key
- public_url
- purpose        // profile_image, equipment_main_image, post_image 등
- mime_type
- size_bytes
- width / height
- deleted_at
```

현재 구현:

```txt
POST /api/uploads/profile-image
→ 로그인 확인
→ active image provider 업로드
→ image_assets insert
→ users.profile_image_url / users.profile_image_asset_id 갱신

POST /api/uploads/equipment-image
→ 로그인 확인
→ active image provider 업로드
→ image_assets insert with equipment_main_image
→ public_url 반환

POST /api/uploads/post-image
→ 로그인 확인
→ active image provider 업로드
→ image_assets insert with post_image
→ public_url 반환
→ 게시글 본문에는 data URL이 아니라 public_url 기반 img 태그 삽입
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

게시글 작성 이미지 흐름:

```txt
/explore/.../write/
→ 에디터에서 사진 선택
→ /api/uploads/post-image 업로드
→ 반환된 public_url을 본문 img src로 삽입
→ POST /api/posts 저장
```

나중에 R2로 옮길 때 유지할 원칙:

```txt
feature table은 image URL만 직접 의존하거나 image_asset_id를 참조합니다.
업로드 provider 변경은 functions/_shared/image-storage.ts에서 처리합니다.
기존 Cloudinary/Supabase object는 migration script로 R2에 복사한 뒤 image_assets.provider/bucket/object_key/public_url을 갱신합니다.
```

---

## 라우팅 원칙

Cloudflare Pages + Next static export 환경에서는 동적 페이지 라우트를 직접 만들지 않습니다.

현재 장비 라우팅:

```txt
/garage/              → 내 차고
/garage/new/          → 장비 등록
/garage/edit/?id=...  → 장비 수정
/garage/view/?slug=...→ 장비 상세/공개 페이지
```

중요:

```txt
/garage/[slug]/ 라우트는 사용하지 않습니다.
functions/garage/_middleware.ts도 사용하지 않습니다.
구형 slug redirect를 위해 /garage middleware를 추가하면 /garage/ 내 차고 라우팅과 충돌할 수 있습니다.
공개 장비 링크는 항상 /garage/view/?slug=... 형태로 생성합니다.
```

메뉴의 주요 대시보드 링크는 Next client routing/RSC 캐시 혼선을 줄이기 위해 hard navigation을 사용합니다.

```txt
메뉴 → 홈 / 장비 둘러보기 / 내 차고 / 내 정보 / 로그인 / 회원가입
button click → window.location.assign(...)
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
/me/settings/
/me/posts/
/me/posts/edit/?id=게시글ID
/me/comments/

/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/view/?slug=장비slug
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

GET    /api/me/profile
PATCH  /api/me/profile
POST   /api/uploads/profile-image
POST   /api/uploads/equipment-image
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
```

개발/샘플 데이터용 endpoint:

```txt
GET/POST /api/dev/seed-lite
GET/POST /api/dev/seed-samples
GET/POST /api/dev/cleanup-dev-maniac
GET/POST /api/dev/sync-news
```

`/api/dev/*` endpoint는 `functions/api/dev/_middleware.ts`에서 기본 차단합니다.

```txt
DEV_TOOLS_ENABLED=true 일 때만 접근 가능
APP_ENV=production 에서는 DEV_TOOLS_SECRET 필수
DEV_TOOLS_SECRET이 설정된 경우 x-dev-tools-secret header 또는 token query string 값이 일치해야 함
```

---

## 최근 해결한 주요 이슈

```txt
Supabase free quota 제한으로 이미지 업로드가 막힘
→ Cloudinary active provider 추가

Cloudinary restricted API key로 upload create 권한 오류 발생
→ upload/create 권한 있는 root/API key 사용 필요 문서화

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

게시글 본문 이미지가 data URL로 DB에 저장됨
→ /api/uploads/post-image 추가, Cloudinary 업로드 후 public_url만 본문에 삽입
```

---

## 아직 미완성인 부분

```txt
부품 이미지 업로드
R2 직접 업로드 provider
공개 사용자 프로필 페이지
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

## 다음 개발 추천 순서

1. Production 배포 후 회귀 테스트
2. 장비 등록/수정/목록/상세 이미지 흐름 안정화 확인
3. 부품 이미지 업로드
4. 신고/모더레이션 워크플로우
5. 관리자 UI
6. 결제/구독
