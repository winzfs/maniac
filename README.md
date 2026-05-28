# Maniac Garage (Foundation)

## 프로젝트 목적

Maniac Garage 웹서비스의 1차 개발 기반을 구성합니다.

현재 범위는 전체 서비스 구현이 아니라, 이후 장비 CRUD, 이미지 업로드, 공개 장비 페이지, 카테고리별 게시판, 어드민 기능을 안정적으로 확장하기 위한 foundation입니다.

## 문서 위치

- `docs/maniac-garage-service-plan.md`
- `docs/admin-management-plan.md`
- `docs/site-content-board-management-plan.md`
- `docs/design-direction-guide.md`
- `docs/current-implementation-status.md`

## 현재 구현 범위

- Next.js 기반 앱 골격
- 정적 Cloudflare Pages 배포 설정
- Tailwind 디자인 토큰
- 반응형 랜딩 페이지 mock
- 홈 페이지 섹션 컴포넌트 분리
- 반응형 내 차고 페이지 mock: `/garage/`
- 반응형 공개 장비 페이지 mock: `/garage/ninja-400/`
- 장비 카테고리 탐색 페이지 mock: `/explore/`
- 카테고리별 전체글 + 게시판 필터 mock: `/explore/[category]/`
- 카테고리별 게시판 상세 mock: `/explore/[category]/[board]/`
- 카테고리별 게시글 상세 mock: `/explore/[category]/[board]/[post]/`
- 카테고리별 글쓰기 mock + WYSIWYG 에디터: `/explore/[category]/[board]/write/`
- 글쓰기 화면 모바일 확대/overflow 완화
- 공통 PageHeader/Breadcrumbs/MenuButton 네비게이션
- 공통 UI 컴포넌트 초안
- 도메인 중심 폴더 구조
- Drizzle/D1용 DB 스키마 초안
- 관리자 RBAC 초안
- 감사 로그 adapter 초안
- 인증 boundary stub
- R2 storage provider boundary

## 현재 확인 가능한 페이지

```txt
/
/explore/
/explore/motorcycle/
/explore/motorcycle/motorcycle-showcase/
/explore/motorcycle/motorcycle-showcase/motorcycle-showcase-post-1/
/explore/motorcycle/motorcycle-showcase/write/
/explore/motorcycle/motorcycle-maintenance/
/explore/motorcycle/motorcycle-parts/
/explore/motorcycle/motorcycle-qna/
/explore/motorcycle/motorcycle-trade/
/explore/pc/
/explore/keyboard/
/explore/bicycle/
/explore/camera/
/explore/camping/
/explore/audio/
/explore/custom/
/me/
/garage/
/garage/ninja-400/
```

현재 페이지들은 정적 mock 데이터를 사용합니다. 로그인, DB, R2 업로드 없이 Cloudflare Pages에서 바로 확인할 수 있습니다.

## 홈 페이지 구조

홈 페이지는 레이아웃을 유지하면서 섹션 컴포넌트로 분리되어 있습니다.

```txt
src/app/page.tsx
src/features/home/components/HomeHeroSection.tsx
src/features/home/components/FeaturedGarageSection.tsx
src/features/home/components/HomeUtilitySections.tsx
src/features/home/CategoryPostScroller.tsx
```

원칙:

- `src/app/page.tsx`는 전체 섹션 조립만 담당합니다.
- Hero 수정은 `HomeHeroSection`에서 합니다.
- Featured Garage 수정은 `FeaturedGarageSection`에서 합니다.
- Maintenance/Category Boards/CTA 수정은 `HomeUtilitySections`에서 합니다.
- 홈의 카테고리별 주요글 스크롤은 `CategoryPostScroller`에서 관리합니다.
- 가로 스크롤은 페이지 전체를 밀지 않고 해당 영역 안에서만 동작하도록 `HorizontalScroller`와 부모 영역에 overflow containment를 적용합니다.

## 카테고리/게시판 구조

장비 카테고리와 카테고리별 게시판 config는 아래 파일에서 관리합니다.

```txt
src/shared/data/equipment-categories.ts
```

게시판 mock 게시글 데이터는 아래 파일에서 관리합니다.

```txt
src/shared/data/mock-board-posts.ts
```

카테고리 페이지의 전체글/게시판 필터 UI는 아래 컴포넌트에서 관리합니다.

```txt
src/features/boards/components/CategoryBoardPostFilter.tsx
```

현재 카테고리:

```txt
motorcycle  바이크
pc          커스텀 PC
keyboard    기계식 키보드
bicycle     자전거
camera      카메라
camping     캠핑 장비
audio       오디오
custom      기타 장비
```

각 카테고리에는 기본 게시판이 포함됩니다.

```txt
장비 자랑
정비/관리 기록
부품/튜닝 리뷰
질문/상담
중고 부품 일부 카테고리
```

현재 `/explore/[category]/`는 게시판 카드만 보여주는 허브가 아니라, 전체글 목록을 먼저 보여주고 상단 필터 버튼으로 게시판별 글을 필터링합니다.

동작:

```txt
처음 진입: 전체글 표시
전체글 버튼: 전체글 표시
게시판 버튼 클릭: 해당 게시판 글만 표시
선택된 게시판 버튼 다시 클릭: 전체글로 해제
필터 상태에 맞는 글쓰기 버튼 표시
게시글 카드 클릭: 게시글 상세 페이지로 이동
게시판 상세의 게시글 카드 클릭: 게시글 상세 페이지로 이동
```

게시글 상세 mock 라우트:

```txt
src/app/explore/[category]/[board]/[post]/page.tsx
```

현재 게시판은 정적 mock 데이터 기반입니다. 이후 DB 기반 `boards`, `posts`, `comments`와 연결합니다.

## 공통 네비게이션 구조

상세 페이지의 상단 구조는 공통 컴포넌트로 관리합니다.

```txt
src/shared/components/navigation/Breadcrumbs.tsx
src/shared/components/navigation/MenuButton.tsx
src/shared/components/navigation/PageHeader.tsx
```

원칙:

- 메뉴 버튼은 페이지 최상단에 표시합니다.
- breadcrumb는 메뉴 버튼 아래에 표시합니다.
- breadcrumb 항목은 가능한 경우 상위 페이지로 이동 가능해야 합니다.
- 새 페이지는 개별 breadcrumb/menu UI를 직접 반복하지 않고 `PageHeader`를 우선 사용합니다.
- 메뉴 구조 변경은 `MenuButton`, 카테고리 변경은 `equipment-categories.ts`를 중심으로 수정합니다.

## 글쓰기 WYSIWYG 에디터

글쓰기 mock 화면에는 자체 구현한 가벼운 WYSIWYG 에디터를 사용합니다.

```txt
src/features/editor/SimpleHtmlEditor.tsx
src/app/explore/[category]/[board]/write/page.tsx
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

이미지 처리:

- 브라우저에서 업로드 전 리사이징합니다.
- 긴 축 기준 최대 2000px로 제한합니다.
- 현재 mock 단계에서는 data URL을 본문에 삽입합니다.
- 실제 서비스 단계에서는 같은 리사이징 흐름 뒤 R2 업로드 URL을 삽입하는 구조로 바꿉니다.

레이아웃/모바일 안정화:

- 글쓰기 페이지는 다른 페이지와 동일하게 `container-shell` 기준을 사용합니다.
- 모바일 입력 포커스 확대를 줄이기 위해 제목 input과 contentEditable 본문은 모바일에서 `text-base`를 사용합니다.
- form grid는 `minmax(0, 1fr)`와 `min-w-0`을 사용해 에디터가 전체 페이지 폭을 밀지 않게 합니다.
- 에디터 카드와 툴바는 `overflow-hidden`, `overflow-x-auto`, `max-w-full`로 내부 스크롤만 허용합니다.
- 이미지와 에디터 본문은 `max-w-full`을 유지합니다.

유지보수 원칙:

- 현재는 무거운 에디터 라이브러리 없이 `contentEditable` 기반 자체 컴포넌트로 시작합니다.
- 실제 저장 전 서버에서 HTML sanitize를 반드시 적용해야 합니다.
- 이후 TipTap 같은 고급 에디터로 교체하더라도 `features/editor` 경계를 유지합니다.
- 에디터 버튼은 “적용만”이 아니라 가능한 경우 다시 누르면 해제되는 toggle 동작을 우선합니다.

현재 에디터는 mock UI이며 실제 게시글 저장은 아직 연결되지 않았습니다.

## 반응형 기준

현재 UI는 모바일 우선으로 구성합니다.

- 모바일: 1열 중심, 버튼 full width 우선
- 태블릿: 카드 2열, 스탯 3열 전환
- 데스크톱: Hero 2단 구성, 공개 장비 페이지는 타임라인 + 사이드바 구조
- 전체 페이지는 `container-shell`을 통해 중앙 정렬과 최대 폭을 제한
- 가로 스크롤 컴포넌트는 페이지 전체가 아니라 해당 영역 안에서만 스크롤되도록 containment를 유지합니다.
- 글쓰기 페이지는 입력 포커스 확대와 에디터 overflow를 줄이기 위해 `text-base`, `min-w-0`, `overflow-x-hidden` 기준을 유지합니다.

주요 확인 폭:

```txt
360px  모바일 최소 폭
390px  일반 모바일
768px  태블릿
1024px 작은 데스크톱
1280px 데스크톱
```

## 아직 mock/stub인 부분

- 실제 로그인/세션 연동
- 실제 DB client 런타임 연결
- 장비 CRUD UI
- 정비 기록 CRUD
- 부품 CRUD
- 게시글/댓글 저장 기능
- R2 이미지 업로드 flow
- 어드민 UI
- 결제/구독
- 실제 감사 로그 DB 저장 adapter
- HTML sanitize 서버 처리

## 로컬 실행

```bash
npm install
npm run dev
```

## 검사

```bash
npm run typecheck
npm run build
```

`next.config.ts`에서 `output: "export"`를 사용하므로 `npm run build` 후 `out/` 폴더가 생성됩니다.

## Cloudflare Pages 배포

현재 단계에서는 SSR, Workers, OpenNext 없이 정적 Cloudflare Pages로 배포합니다.

### 1. Cloudflare 로그인

```bash
npx wrangler login
```

### 2. 로컬에서 Pages 미리보기

```bash
npm run pages:preview
```

### 3. Pages 배포

```bash
npm run pages:deploy
```

배포 스크립트는 아래 흐름으로 동작합니다.

```bash
next build
wrangler pages deploy out --project-name maniac-garage
```

Cloudflare 대시보드에서 GitHub 연동으로 배포할 경우 설정값은 다음과 같이 잡습니다.

```txt
Framework preset: None 또는 Next.js static export 기준
Build command: npm run pages:build
Build output directory: out
Root directory: /
```

## D1/R2 사용 시점

현재 정적 Pages 배포에서는 D1/R2가 직접 사용되지 않습니다.

D1/R2는 이후 Pages Functions 또는 Workers를 붙일 때 사용합니다. 다만 `wrangler.toml`에는 나중을 위해 binding 초안을 유지합니다.

주의:

- Pages의 `ASSETS` 이름은 예약어라 R2 binding 이름은 `R2_ASSETS`를 사용합니다.
- 정적 배포 중에는 Cloudflare 전역 타입에 직접 의존하지 않도록 storage boundary를 유지합니다.

## DB Migration

```bash
npm run db:generate
npm run db:migrate
```

스키마 변경 시 원칙:

1. `src/server/db/schema/index.ts` 수정
2. `npm run db:generate` 실행
3. 생성된 migration 확인
4. local/preview/production 순서로 적용

운영 DB는 직접 수동 변경하지 않습니다.

## Preview/Production 환경 분리 주의사항

- D1 DB는 Preview/Production 분리 필수입니다.
- R2 버킷도 환경별 분리합니다.
- Preview에서 운영 DB/R2에 접근하면 안 됩니다.
- 결제/알림/운영성 webhook은 Preview에서 실제 발송되지 않게 합니다.

## 다음 구현 순서 추천

1. migration 생성/검토
2. D1 local 적용 테스트
3. 장비 등록/수정/삭제 UI 구현
4. 내 차고 페이지를 mock에서 DB 데이터로 교체
5. 공개 장비 페이지를 mock에서 DB 데이터로 교체
6. 게시글 저장 action과 HTML sanitize 유틸 구현
7. 게시글 상세 페이지를 DB 데이터로 교체
8. 댓글 mock/CRUD 구조 추가
9. R2 이미지 업로드 연결
10. 카테고리별 게시판을 DB 기반 board/post로 교체
11. 정비 기록 CRUD
12. 부품 리스트 CRUD
13. 어드민 기본 조회/숨김 처리
