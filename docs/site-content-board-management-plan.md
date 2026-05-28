# Maniac Garage 홈페이지 디자인/콘텐츠/게시판 관리 기획 및 개발 가이드

## 1. 문서 목적

이 문서는 `maniac` 프로젝트에서 홈페이지 디자인, 랜딩 콘텐츠, 공지, 게시판, 커뮤니티 영역을 운영자가 쉽게 관리할 수 있도록 하기 위한 설계 기준을 정리한다.

Maniac Garage는 장비 공개 페이지, 정비 기록, 튜닝 부품, 갤러리, 향후 게시판/커뮤니티/거래 기능을 포함할 수 있다. 따라서 개발자가 매번 코드를 수정하지 않아도 운영자가 주요 문구, 배너, 섹션 노출, 게시판 카테고리, 공지, 신고 정책 등을 관리할 수 있는 구조가 필요하다.

다만 모든 디자인과 레이아웃을 DB로 관리하는 CMS처럼 만들면 코드 복잡도가 커지고 유지보수가 어려워질 수 있다. 따라서 이 문서는 **컴포넌트와 레이아웃의 핵심 구조는 코드로 관리하고, 운영자가 바꿔야 하는 콘텐츠/노출/순서/설정은 어드민에서 관리한다**는 원칙을 따른다.

---

## 2. 핵심 원칙

### 2.1 컴포넌트는 코드, 콘텐츠는 데이터

나쁜 방향:

- 어드민에서 모든 HTML/CSS를 직접 수정하게 한다.
- 운영자가 자유롭게 레이아웃을 깨뜨릴 수 있게 한다.
- 랜딩 페이지 전체를 WYSIWYG 에디터 하나로 만든다.

좋은 방향:

- Hero, Feature, CTA, Showcase, FAQ 같은 섹션 컴포넌트는 코드로 만든다.
- 각 섹션의 제목, 설명, 이미지, 버튼 문구, 링크, 노출 여부, 정렬 순서는 어드민에서 관리한다.
- 게시판의 정책, 카테고리, 공지, 금칙어, 권한은 어드민에서 관리한다.
- 시각적 일관성을 해치지 않는 범위에서 테마/색상/배너를 관리한다.

### 2.2 운영자가 자주 바꾸는 것만 어드민화한다

어드민에서 관리할 대상:

- 랜딩 페이지 문구
- 메인 배너
- 프로모션 배너
- CTA 버튼 문구/링크
- 공지사항
- FAQ
- 게시판 카테고리
- 게시판 공지글
- 게시판 신고 사유
- 게시판 금칙어
- 추천 장비/추천 게시글 노출
- 점검 모드 문구

코드로 유지할 대상:

- 전체 레이아웃 구조
- 디자인 시스템 토큰
- 핵심 UI 컴포넌트
- 결제/권한/보안 로직
- 복잡한 페이지 렌더링 조건
- SEO 메타 생성 로직의 기본 구조

### 2.3 미리보기와 게시 단계를 분리한다

홈페이지 콘텐츠나 게시판 설정 변경은 바로 운영 반영하지 않고 가능하면 아래 흐름을 따른다.

1. 초안 작성
2. 미리보기
3. 예약 또는 즉시 게시
4. 게시 이력 저장
5. 필요 시 이전 버전 복구

MVP에서는 초안/미리보기를 간단히 구현하고, 버전 복구는 이후 단계로 미룰 수 있다.

---

## 3. 관리 대상 범위

### 3.1 홈페이지/랜딩 페이지

관리 대상:

- Hero 섹션
- 주요 기능 소개 섹션
- 샘플 장비 페이지 소개
- 정비 타임라인 예시
- 튜닝 부품 예시
- 중고 판매용 이력 페이지 소개
- 가격/프리미엄 기능 소개
- FAQ
- CTA 영역
- 하단 푸터 링크

운영자가 수정할 수 있는 필드:

- 제목
- 부제목
- 설명
- 이미지
- 버튼 문구
- 버튼 링크
- 노출 여부
- 정렬 순서
- 시작/종료 노출일

### 3.2 메인 배너/프로모션

관리 대상:

- 상단 공지 배너
- 이벤트 배너
- 신규 기능 안내 배너
- 점검 안내 배너
- 유료 스킨/프리미엄 기능 홍보 배너

필수 필드:

- title
- description
- imageUrl
- linkUrl
- ctaLabel
- placement
- startsAt
- endsAt
- isActive
- priority

주의:

- 기간이 지난 배너는 자동 비노출한다.
- 여러 배너가 동시에 노출될 수 있으므로 priority를 둔다.
- 외부 링크는 안전 검증을 한다.

### 3.3 공지사항

관리 대상:

- 서비스 공지
- 업데이트 노트
- 점검 공지
- 정책 변경 안내
- 이벤트 안내

필수 필드:

- title
- body
- category
- status
- isPinned
- publishedAt
- createdBy
- updatedBy

상태 예시:

```txt
draft
scheduled
published
archived
```

주의:

- 공지 작성/수정/삭제는 감사 로그에 남긴다.
- 정책/약관 변경 공지는 버전과 게시일을 남긴다.
- 중요한 공지는 앱 내 배너 또는 이메일/알림과 연결할 수 있게 한다.

### 3.4 FAQ/도움말

관리 대상:

- 가입/로그인
- 장비 등록
- 정비 기록
- 공개 페이지
- 이미지 업로드
- 프리미엄 기능
- 결제/환불
- 신고/운영정책

필수 필드:

- question
- answer
- category
- sortOrder
- isPublished

주의:

- FAQ는 검색 가능해야 한다.
- 결제/환불 관련 답변은 정책 문서와 충돌하지 않게 관리한다.

### 3.5 게시판/커뮤니티

초기에는 커뮤니티 기능을 MVP에서 제외하지만, 구조는 미리 고려한다.

예상 게시판:

- 자유 게시판
- 바이크 자랑 게시판
- 정비 질문 게시판
- 튜닝 부품 리뷰 게시판
- 중고 부품 게시판
- 공지 게시판
- 운영자 추천 장비 게시판

운영자가 관리할 수 있어야 하는 항목:

- 게시판 생성/비활성화
- 게시판 이름/설명 수정
- 게시판 정렬 순서
- 게시글 작성 권한
- 댓글 허용 여부
- 이미지 첨부 허용 여부
- 거래글 허용 여부
- 공지글 고정
- 신고 사유 설정
- 금칙어 설정
- 자동 숨김 기준

---

## 4. 데이터 모델 초안

### 4.1 SitePage

관리 가능한 페이지 단위.

```txt
site_pages
- id
- slug
- title
- description
- status
- seo_title
- seo_description
- og_image_url
- created_by
- updated_by
- published_at
- created_at
- updated_at
```

사용 예:

- home
- pricing
- about
- help
- terms
- privacy

주의:

- 모든 페이지를 DB 기반으로 만들 필요는 없다.
- 랜딩/도움말/공지처럼 운영자가 자주 수정하는 페이지부터 적용한다.

### 4.2 SiteSection

페이지를 구성하는 섹션 단위.

```txt
site_sections
- id
- page_id
- type
- title
- subtitle
- body
- image_url
- cta_label
- cta_url
- config_json
- sort_order
- is_visible
- starts_at
- ends_at
- created_at
- updated_at
```

섹션 type 예시:

```txt
hero
feature_grid
showcase
maintenance_timeline_sample
part_list_sample
testimonial
pricing_preview
faq
cta
```

주의:

- `type`별로 허용되는 필드를 검증한다.
- `config_json`은 보조 설정용으로만 사용하고, 검색/정렬이 필요한 값은 컬럼화한다.
- 어드민 입력값은 Zod 같은 schema로 검증한다.

### 4.3 Banner

```txt
banners
- id
- title
- description
- image_url
- link_url
- cta_label
- placement
- priority
- is_active
- starts_at
- ends_at
- created_by
- updated_by
- created_at
- updated_at
```

placement 예시:

```txt
home_top
home_middle
dashboard_top
public_profile_top
admin_notice
```

### 4.4 Notice

```txt
notices
- id
- title
- body
- category
- status
- is_pinned
- published_at
- created_by
- updated_by
- created_at
- updated_at
```

### 4.5 FaqItem

```txt
faq_items
- id
- category
- question
- answer
- sort_order
- is_published
- created_by
- updated_by
- created_at
- updated_at
```

### 4.6 Board

```txt
boards
- id
- slug
- name
- description
- board_type
- sort_order
- is_active
- allow_comments
- allow_images
- allow_trade_posts
- write_permission
- read_permission
- created_at
- updated_at
```

board_type 예시:

```txt
general
showcase
maintenance_qna
parts_review
trade
notice
```

### 4.7 Post

```txt
posts
- id
- board_id
- user_id
- title
- body
- status
- is_pinned
- view_count
- comment_count
- like_count
- created_at
- updated_at
- deleted_at
```

status 예시:

```txt
published
hidden
removed
pending_review
```

### 4.8 Comment

```txt
comments
- id
- post_id
- user_id
- parent_id
- body
- status
- created_at
- updated_at
- deleted_at
```

### 4.9 ContentRevision

홈페이지/공지/게시글 등의 주요 변경 이력을 관리한다.

```txt
content_revisions
- id
- resource_type
- resource_id
- version
- snapshot_json
- created_by
- created_at
```

주의:

- MVP에서는 필수는 아니지만, 홈페이지 섹션/공지/정책 문서는 revision을 남기는 것이 좋다.
- 게시글 전체 revision은 나중에 도입해도 된다.

---

## 5. 어드민 화면 설계

### 5.1 홈페이지 관리

라우트 예시:

```txt
/admin/site/pages
/admin/site/pages/:pageId
/admin/site/sections
```

기능:

- 페이지 목록 조회
- 페이지 SEO 정보 수정
- 섹션 추가/수정/삭제
- 섹션 노출/비노출
- 섹션 정렬 변경
- 이미지 변경
- CTA 링크 수정
- 미리보기
- 게시/보관 처리

주의:

- drag & drop 정렬은 편하지만 MVP에서는 sortOrder 입력 또는 위/아래 이동 버튼으로 시작한다.
- 섹션 타입별 입력 폼을 분리한다.
- 운영자가 HTML을 직접 입력하지 않게 한다.

### 5.2 배너 관리

라우트 예시:

```txt
/admin/site/banners
```

기능:

- 배너 목록
- 배너 생성/수정
- 위치별 필터
- 기간 설정
- 우선순위 설정
- 활성/비활성
- 미리보기

주의:

- 배너 이미지 업로드는 R2를 사용한다.
- 배너 링크는 내부 링크와 외부 링크를 구분한다.
- 외부 링크는 `rel="noopener noreferrer"` 처리한다.

### 5.3 공지 관리

라우트 예시:

```txt
/admin/site/notices
```

기능:

- 공지 목록
- 초안 작성
- 예약 게시
- 고정 공지 설정
- 보관 처리
- 공지 미리보기

주의:

- 삭제보다 archived 상태를 우선한다.
- 중요한 공지는 알림 발송 여부를 별도 선택하게 한다.

### 5.4 FAQ 관리

라우트 예시:

```txt
/admin/site/faqs
```

기능:

- FAQ 카테고리 관리
- 질문/답변 작성
- 정렬 순서 변경
- 공개/비공개 전환

### 5.5 게시판 관리

라우트 예시:

```txt
/admin/boards
/admin/boards/:boardId
/admin/posts
/admin/comments
```

기능:

- 게시판 목록
- 게시판 생성/수정/비활성화
- 게시판별 권한 설정
- 게시글 목록 조회
- 게시글 숨김/복구
- 댓글 숨김/복구
- 공지글 고정
- 신고된 게시글 필터
- 거래글 여부 필터

주의:

- 게시판 삭제는 기본 제공하지 않는다.
- 이미 게시글이 있는 게시판은 비활성화만 허용한다.
- 거래 게시판은 운영 리스크가 크므로 별도 권한과 신고 프로세스를 둔다.

---

## 6. 디자인 관리 원칙

### 6.1 디자인 시스템은 코드로 관리한다

어드민에서 색상, 폰트, 간격, 버튼 스타일을 무제한으로 바꾸게 하지 않는다.

코드로 관리할 것:

- 색상 토큰
- 타이포그래피
- 버튼 스타일
- 카드 스타일
- 반응형 레이아웃
- 애니메이션 기본값
- 다크모드 정책

어드민에서 관리할 것:

- 섹션 노출 여부
- 섹션 순서
- 배너 이미지
- 문구
- CTA 링크
- 일부 테마 선택

### 6.2 테마 프리셋 방식

운영자가 홈페이지 분위기를 바꿔야 한다면 자유 CSS 입력이 아니라 프리셋 선택 방식을 사용한다.

예:

```txt
default
dark_garage
clean_white
premium_black
seasonal_event
```

주의:

- 프리셋은 코드에서 정의한다.
- 어드민은 적용할 프리셋을 선택한다.
- 사용자 입력 CSS는 허용하지 않는다.

### 6.3 이미지 비율과 가이드

운영자가 업로드하는 이미지는 디자인을 깨뜨리지 않도록 제한한다.

예:

- Hero 이미지: 16:9 또는 21:9
- 배너 이미지: 3:1
- 카드 썸네일: 4:3
- OG 이미지: 1200x630

주의:

- 업로드 시 권장 비율을 안내한다.
- 가능하면 crop/preview UI를 제공한다.
- 원본 이미지를 그대로 노출하지 않고 CDN/R2 경로를 사용한다.

---

## 7. 게시판 운영 정책

### 7.1 게시판 권한

게시판별로 읽기/쓰기 권한을 분리한다.

예:

```txt
readPermission: public | logged_in | admin_only
writePermission: logged_in | verified_user | premium_user | admin_only
```

초기 추천:

- 공지 게시판: 읽기 public, 쓰기 admin_only
- 장비 자랑 게시판: 읽기 public, 쓰기 logged_in
- 정비 질문 게시판: 읽기 public, 쓰기 logged_in
- 중고 부품 게시판: MVP 제외 또는 verified_user 이상

### 7.2 게시글 상태

게시글은 삭제보다 상태 전환을 우선한다.

```txt
published
hidden
removed
pending_review
```

- `hidden`: 운영자 또는 신고로 숨김 처리
- `removed`: 정책 위반으로 제거 처리
- `pending_review`: 자동 필터 또는 신고 누적으로 검토 대기

### 7.3 신고와 자동 숨김

게시글/댓글/이미지는 신고 대상이 될 수 있다.

자동 숨김 기준 예시:

- 같은 게시글 신고 5회 이상
- 금칙어 포함
- 외부 사기 링크 패턴
- 거래 게시판에서 금지 품목 언급

주의:

- 자동 숨김은 삭제가 아니다.
- 관리자가 검토 후 복구/유지/제재를 결정한다.

### 7.4 거래 게시판 주의

중고 부품/장비 거래 기능은 운영 리스크가 크다.

MVP에서는 게시판 구조만 고려하고, 실제 거래 기능은 나중에 도입한다.

도입 시 필요한 것:

- 거래 금지 품목 정책
- 신고 기능
- 사기 의심 신고
- 판매글 상단 노출 결제 정책
- 거래 책임 고지
- 사용자 차단 기능
- 계정 정지 정책

---

## 8. 코드 구조 원칙

### 8.1 기능 분리

권장 구조:

```txt
src/
  features/
    site-content/
      components/
      actions/
      queries/
      schemas/
      types/
    boards/
      components/
      actions/
      queries/
      schemas/
      types/
    moderation/
      actions/
      queries/
      schemas/
      types/
  app/
    admin/
      site/
        pages/
        banners/
        notices/
        faqs/
      boards/
      posts/
      comments/
```

### 8.2 섹션 렌더링 구조

홈페이지 섹션은 type 기반으로 안전하게 렌더링한다.

예:

```ts
const SECTION_RENDERERS = {
  hero: HeroSection,
  feature_grid: FeatureGridSection,
  showcase: ShowcaseSection,
  faq: FaqSection,
  cta: CtaSection,
};
```

주의:

- DB에 저장된 type이 허용 목록에 없으면 렌더링하지 않는다.
- 사용자 입력 HTML을 그대로 렌더링하지 않는다.
- Markdown을 허용할 경우 sanitize 처리를 한다.

### 8.3 입력 검증

사이트 콘텐츠와 게시판 데이터는 모두 schema로 검증한다.

검증 항목:

- 제목 길이
- 설명 길이
- URL 형식
- 이미지 URL/R2 object key
- 시작/종료일
- 게시판 slug 중복
- 게시판 권한 값
- 게시글 본문 길이
- 금칙어

---

## 9. 캐시와 게시 반영

### 9.1 홈페이지 캐시

홈페이지와 공개 페이지는 Cloudflare CDN 캐시를 사용할 수 있다.

주의:

- 어드민에서 랜딩 문구/배너/섹션을 바꾸면 캐시 무효화 또는 짧은 TTL이 필요하다.
- 미리보기 페이지는 캐시하지 않는다.
- 어드민 페이지는 항상 `no-store`를 적용한다.

### 9.2 게시판 캐시

게시판 목록은 캐시 가능하지만, 로그인 사용자별 상태가 섞이면 안 된다.

캐시 가능:

- 공개 게시판 목록
- 공개 게시글 상세
- 공지 목록
- FAQ

캐시 주의:

- 내가 좋아요 눌렀는지 여부
- 내가 신고했는지 여부
- 관리자용 숨김 글 표시
- 작성/수정 권한 상태

---

## 10. 보안 주의사항

- 운영자가 HTML/CSS/JS를 직접 입력하는 기능은 기본적으로 금지한다.
- Markdown을 허용하면 sanitize 처리를 한다.
- 외부 링크는 검증하고 새 창 보안 속성을 적용한다.
- 게시글/댓글은 XSS 방지 처리를 한다.
- 이미지 업로드는 MIME type과 확장자를 모두 검증한다.
- 게시판 설정 변경은 Admin 이상 권한으로 제한한다.
- 홈페이지 주요 섹션 변경은 감사 로그에 남긴다.
- 공지/정책 문서 수정은 revision을 남긴다.
- 게시글 숨김/복구는 moderation action으로 기록한다.

---

## 11. MVP 범위

초기 MVP에서는 아래까지만 구현한다.

### 11.1 홈페이지 관리 MVP

- 메인 Hero 문구 관리
- CTA 버튼 문구/링크 관리
- FAQ 관리
- 공지사항 관리
- 상단 배너 관리
- 섹션 노출/비노출
- 간단한 미리보기

### 11.2 게시판 관리 MVP

MVP에서 게시판 기능을 바로 열지 않는다면 아래 구조만 준비한다.

- board 테이블 설계
- post/comment status 설계
- 신고/숨김 구조와 연결
- 관리자 권한 설계

게시판을 MVP에 포함한다면:

- 공지 게시판
- 장비 자랑 게시판
- 게시글 작성/수정/삭제
- 댓글
- 게시글/댓글 신고
- 관리자 숨김/복구

---

## 12. Phase별 개발 계획

### Phase 1: 사이트 콘텐츠 관리

- SitePage/SiteSection 모델 설계
- Hero/FAQ/공지/배너 관리
- 어드민 미리보기
- 캐시 정책 정리

### Phase 2: 게시판 기본 구조

- Board/Post/Comment 모델 설계
- 게시판 목록/상세
- 게시글 작성/수정
- 댓글
- 관리자 숨김/복구

### Phase 3: 운영 고도화

- 신고 자동 숨김
- 금칙어 관리
- 게시판별 권한 관리
- 추천 게시글/추천 장비 관리
- ContentRevision 도입

### Phase 4: 거래/커뮤니티 확장

- 중고 부품 게시판
- 판매글 상단 노출
- 사용자 차단
- 사기 신고
- 거래 정책 고도화

---

## 13. 개발 시 피해야 할 것

- 홈페이지 전체를 자유 HTML 에디터로 만드는 것
- 운영자가 CSS/JS를 직접 입력하게 하는 것
- 게시판 삭제를 기본 기능으로 제공하는 것
- 게시글 상태 없이 실제 delete부터 하는 것
- 게시판 권한을 프론트에서만 체크하는 것
- 관리자 페이지와 공개 페이지가 같은 쿼리를 공유해 숨김 글이 노출되는 것
- 캐시 무효화 없이 랜딩 콘텐츠를 수정하는 것
- 공지/정책 문서 수정 이력을 남기지 않는 것
- 게시판 신고/숨김 이력을 남기지 않는 것
- 거래 게시판을 정책 없이 먼저 여는 것

---

## 14. 최종 방향

Maniac Garage의 홈페이지와 게시판은 운영자가 쉽게 관리할 수 있어야 한다. 하지만 관리 편의성을 이유로 서비스의 디자인 일관성, 보안, 유지보수성을 희생하면 안 된다.

따라서 최종 원칙은 아래와 같다.

1. 디자인 시스템과 핵심 컴포넌트는 코드로 관리한다.
2. 문구, 이미지, CTA, 배너, FAQ, 공지, 노출 순서는 어드민에서 관리한다.
3. 게시판 구조와 정책은 DB/어드민에서 관리하되, 권한과 보안은 서버에서 강제한다.
4. 모든 주요 변경은 감사 로그 또는 revision으로 추적한다.
5. Cloudflare 캐시와 미리보기/게시 반영 흐름을 분리한다.

이 구조를 따르면 개발자는 안정적인 컴포넌트와 기능을 유지하고, 운영자는 코드 수정 없이 홈페이지와 게시판을 유연하게 관리할 수 있다.
