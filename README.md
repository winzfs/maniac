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
게시글 상세 client-side SEO 메타 갱신 ✅
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
홈 상단 중앙 로고/사이드 네비게이션 ✅
샘플 콘텐츠 seed endpoint ✅
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
```

주의:

```txt
기능명을 과하게 브랜드화하지 않습니다.
예: 부품 기록을 덕템 기록으로 바꾸지 않습니다.
예: 정비 기록을 관리 기록으로 일괄 치환하지 않습니다.
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
src/shared/components/navigation/SiteFooter.tsx
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
Next static export + query string 상세 페이지 구조라서 상세 페이지의 완전한 서버 사이드 SEO는 제한적입니다.
```
