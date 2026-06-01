# GEAR DUCK

장비 덕후들의 커뮤니티 **GEAR DUCK**입니다.

오토바이, 커스텀 PC, 기계식 키보드, 자전거, 카메라, 캠핑 장비처럼 애착이 큰 장비를 등록하고, 세팅/정비/부품 기록을 남긴 뒤 공개 페이지와 커뮤니티에서 공유하는 것을 목표로 합니다.

> 내부 저장소/DB 이름에는 아직 `maniac` 표현이 남아 있을 수 있습니다. 사용자 노출 브랜드는 **GEAR DUCK / 기어덕** 기준으로 정리합니다.

---

## 현재 상태 요약

현재 저장소는 **Cloudflare Pages + Pages Functions + D1 기반 1차 MVP** 상태입니다.

```txt
브랜드/SEO: GEAR DUCK / 기어덕 / 장비 덕후들의 커뮤니티 ✅
Google Search Console HTML 인증 파일 ✅
robots.txt / sitemap index / 정적·동적 sitemap ✅
SEO 신뢰 페이지: /about /terms /privacy /contact ✅
사이트 전체 Organization / WebSite JSON-LD ✅
게시글 DiscussionForumPosting JSON-LD ✅
공개 유저 ProfilePage JSON-LD ✅
개인/관리/검색 페이지 noindex 정책 ✅
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
공개 장비 clean URL redirect ✅ /gears/[id]/ → /garage/view/?id=...
공개 장비 slug fallback ✅ /garage/view/?slug=...
공개 장비 상세 client-side SEO 메타 갱신 ✅
커뮤니티 boards/posts/comments D1 테이블 ✅
/explore DB API 기반 전환 ✅
탐색 메뉴명: 기어 둘러보기 ✅
게시판 세부 카테고리: 자랑 / 리뷰 / 자유 / 질문 / 거래 ✅
정비/부품 게시판 세부 카테고리 제거 ✅
카테고리 단위 글쓰기 ✅ /explore/[category]/write/
글쓰기 화면 세부 카테고리 선택 ✅
게시글 작성/상세/수정/삭제 ✅
게시글 clean URL redirect ✅ /posts/[id]/ → /explore/post/?id=...
내부 게시글 링크 clean URL 기준 변경 ✅
게시글 본문 이미지 업로드 ✅ Cloudinary
게시글 상세 client-side SEO 메타 갱신 ✅
게시글 상세 breadcrumb 단순화 ✅ 홈 > 카테고리
게시글 상세 하단 돌아가기 버튼 단순화 ✅
댓글 작성/삭제 ✅
댓글 상세 화면 내 댓글 삭제 ✅
댓글 목록 상단 표시 + compact 입력폼 ✅
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
개발용 /api/dev/* endpoint 보호 ✅
R2 직접 업로드 ❌ 보류
결제/구독 ❌ 미구현
관리자/모더레이션 고도화 ❌ 진행 중
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
docs/public-equipment-url-policy.md
docs/ui-navigation-status.md
docs/seo-url-and-search-console.md
```

---

## 주요 페이지

```txt
/
/search/
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

---

## 브랜드/용어 기준

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
게시판 세부 카테고리: 자랑, 리뷰, 자유, 질문, 거래
```

주의:

```txt
기능명을 과하게 브랜드화하지 않습니다.
예: 부품 기록을 덕템 기록으로 바꾸지 않습니다.
예: 정비 기록을 관리 기록으로 일괄 치환하지 않습니다.
장비의 정비/부품 기록 기능은 유지하지만, 커뮤니티 세부 게시판에서는 정비/부품 탭을 쓰지 않습니다.
```

---

## SEO / Search Console 상태

현재 기준 URL은 Cloudflare Pages 기본 도메인입니다.

```txt
https://maniac-c7d.pages.dev
```

관련 파일:

```txt
src/app/layout.tsx
src/shared/components/seo/JsonLd.tsx
src/features/boards/components/PublicPostDetailClient.tsx
src/features/users/components/PublicUserProfileClient.tsx
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
현재 /posts/[id]/, /gears/[id]/는 clean URL 진입용 redirect입니다.
강한 상세 페이지 SEO를 위해서는 추후 301 전환 또는 Pages Function HTML 메타 주입/정적-safe 라우팅을 검토합니다.
Next static export + query string 상세 shell 구조라서 상세 페이지의 완전한 서버 사이드 SEO는 아직 제한적입니다.
```
