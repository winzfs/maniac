# Maniac Garage 현재 구현 상태 및 점검 문서

## 1. 문서 목적

이 문서는 현재 `maniac` 저장소에 실제 구현된 상태를 기준으로 배포, 화면, 반응형, 네비게이션, 에디터, 기술 구조, 남은 과제, 다음 개발 순서를 정리한다.

기존 기획 문서는 서비스 방향과 장기 구조를 설명하고, 이 문서는 현재 코드 상태와 다음 작업 기준을 추적한다.

---

## 2. 현재 배포 상태

현재 프로젝트는 **정적 Cloudflare Pages 배포**를 기준으로 동작한다.

```txt
Next.js static export
Cloudflare Pages
Build output directory: out
```

주요 설정:

```txt
next.config.ts
- output: export
- trailingSlash: true
- images.unoptimized: true

wrangler.toml
- pages_build_output_dir = "out"
- R2 binding = "R2_ASSETS"
```

주의:

- 현재는 SSR, Workers, Pages Functions, OpenNext를 사용하지 않는다.
- D1/R2는 아직 실제 런타임 화면에서 사용하지 않는다.
- D1/R2 binding은 이후 기능 확장을 위해 설정 초안만 유지한다.
- Cloudflare Pages에서 `ASSETS`는 예약어이므로 R2 binding은 `R2_ASSETS`를 사용한다.

---

## 3. 현재 확인 가능한 페이지

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

현재 페이지들은 정적 mock 데이터를 사용한다. 로그인, DB, R2 업로드 없이 Cloudflare Pages에서 바로 확인할 수 있다.

---

## 4. 화면별 구현 상태

### 4.1 홈 `/`

- 반응형 랜딩 페이지
- Hero 영역
- 검색창 mock
- Featured Garage mock 카드
- Maintenance Timeline Preview
- Category Boards 카드
- Category Boards 내부 카테고리 선택 버튼
- 선택된 카테고리 주요글 가로 스크롤
- 선택된 카테고리 전체보기 링크
- CTA
- `/explore/`, `/garage/` 이동 링크

홈 페이지는 레이아웃을 유지하면서 섹션 컴포넌트로 분리되어 있다.

```txt
src/app/page.tsx
src/features/home/components/HomeHeroSection.tsx
src/features/home/components/FeaturedGarageSection.tsx
src/features/home/components/HomeUtilitySections.tsx
src/features/home/CategoryPostScroller.tsx
```

원칙:

- `src/app/page.tsx`는 전체 섹션 조립만 담당한다.
- Hero 수정은 `HomeHeroSection`에서 한다.
- Featured Garage 수정은 `FeaturedGarageSection`에서 한다.
- Maintenance/Category Boards/CTA 수정은 `HomeUtilitySections`에서 한다.
- 홈의 카테고리별 주요글 스크롤은 `CategoryPostScroller`에서 관리한다.
- 가로 스크롤은 페이지 전체를 밀지 않고 해당 영역 안에서만 동작하도록 `HorizontalScroller`와 부모 영역에 overflow containment를 적용한다.

### 4.2 카테고리 탐색 `/explore/`

- 장비 카테고리 카드 목록
- 카테고리별 게시판 수 표시
- 카테고리 상세 페이지로 이동
- 공통 PageHeader 적용

### 4.3 카테고리 상세 `/explore/[category]/`

- 카테고리 소개
- 카테고리 accent 정보
- 전체글 목록 우선 표시
- 상단 게시판 필터 버튼 표시
- 전체글 버튼으로 전체글 표시
- 게시판 버튼 클릭 시 해당 게시판 글만 필터링
- 선택된 게시판 버튼을 다시 누르면 전체글로 해제
- 필터 상태에 맞는 글쓰기 버튼 표시
- 게시글 카드 클릭 시 게시글 상세 페이지로 이동
- breadcrumb: 홈 > 장비 둘러보기 > 카테고리

관련 컴포넌트:

```txt
src/features/boards/components/CategoryBoardPostFilter.tsx
```

### 4.4 게시판 상세 `/explore/[category]/[board]/`

- 게시판 제목/설명
- 게시글 수 요약 카드
- 글쓰기 버튼
- mock 게시글 목록
- 게시글 카드 클릭 시 게시글 상세 페이지로 이동
- breadcrumb: 홈 > 장비 둘러보기 > 카테고리 > 게시판
- 이후 DB 기반 `boards`, `posts`, `comments`로 교체 예정

### 4.5 게시글 상세 `/explore/[category]/[board]/[post]/`

- 게시글 제목/요약
- 작성자/작성일/댓글/좋아요 mock 정보
- 이미지 mock 영역
- 본문 mock 영역
- 게시판 정보 사이드 카드
- 상태 안내 카드
- breadcrumb: 홈 > 장비 둘러보기 > 카테고리 > 게시판 > 게시글
- 이후 DB 기반 post body, comments, author profile, 신고/숨김 상태와 연결 예정

### 4.6 글쓰기 `/explore/[category]/[board]/write/`

- 제목 입력
- WYSIWYG 에디터
- 저장/임시저장 준비중 버튼
- breadcrumb: 홈 > 장비 둘러보기 > 카테고리 > 게시판 > 글쓰기
- 현재는 실제 게시글 저장 없이 mock UI만 제공
- 모바일 입력 포커스 확대 완화 적용
- 에디터/툴바 overflow containment 적용
- 다른 페이지와 동일한 `container-shell` 폭 기준 유지

관련 파일:

```txt
src/app/explore/[category]/[board]/write/page.tsx
src/features/editor/SimpleHtmlEditor.tsx
```

### 4.7 내 정보 `/me/`

- mock profile 카드
- 내 활동 요약
- 빠른 이동 카드
- breadcrumb: 홈 > 내 정보

### 4.8 내 차고 `/garage/`

- mock 장비 목록
- 요약 카드
- 장비 카드
- 공개 페이지 이동 버튼

### 4.9 공개 장비 페이지 `/garage/ninja-400/`

- mock 장비 상세
- 커버 비주얼 영역
- 장비명/모델/설명
- 주행거리/정비 기록 수/부품 수 스탯
- 정비 타임라인
- 튜닝 부품 목록

---

## 5. Mock 데이터 상태

현재 mock 데이터는 아래 파일에서 관리한다.

```txt
src/shared/data/mock-garage.ts
src/shared/data/equipment-categories.ts
src/shared/data/mock-board-posts.ts
```

포함 데이터:

- 장비 1개
- 정비 기록 3개
- 튜닝 부품 3개
- 장비 카테고리 8개
- 카테고리별 게시판 config
- 게시판별 mock 게시글

주의:

- 이 데이터는 실제 DB가 아니다.
- 다음 단계에서 repository/query layer와 Pages Functions를 연결하면 mock 데이터 의존을 제거한다.
- 화면 구조는 유지하고 데이터 소스만 교체하는 방향으로 개발한다.

---

## 6. 카테고리/게시판 구조

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

기본 게시판:

```txt
장비 자랑
정비/관리 기록
부품/튜닝 리뷰
질문/상담
중고 부품 일부 카테고리
```

현재 `/explore/[category]/`는 게시판 카드만 보여주는 허브가 아니라, 전체글 목록을 먼저 보여주고 상단 필터 버튼으로 게시판별 글을 필터링한다.

동작:

```txt
처음 진입: 전체글 표시
전체글 버튼: 전체글 표시
게시판 버튼 클릭: 해당 게시판 글만 표시
선택된 게시판 버튼 다시 클릭: 전체글로 해제
전체글 상태 글쓰기: 기본 게시판인 장비 자랑 글쓰기 페이지로 이동
게시판 필터 선택 상태 글쓰기: 선택된 게시판 글쓰기 페이지로 이동
카테고리 전체글/필터의 게시글 카드 클릭: 게시글 상세 페이지로 이동
게시판 상세의 게시글 카드 클릭: 게시글 상세 페이지로 이동
```

현재는 정적 config 기반이다. 향후 DB의 `boards`, `posts`, `comments`와 연결한다.

---

## 7. 공통 네비게이션/헤더 원칙

새 페이지를 만들 때는 개별 페이지에서 breadcrumb/menu/title UI를 직접 반복하지 않는다.

공통 컴포넌트:

```txt
src/shared/components/navigation/Breadcrumbs.tsx
src/shared/components/navigation/MenuButton.tsx
src/shared/components/navigation/PageHeader.tsx
```

현재 동작:

- 메뉴 버튼은 페이지 최상단에 크게 표시한다.
- breadcrumb는 메뉴 버튼 아래에 표시한다.
- breadcrumb 항목은 가능한 경우 `href`를 넣어 상위 페이지로 이동 가능하게 한다.
- 페이지 제목/설명/메뉴/breadcrumb는 `PageHeader`로 통합한다.
- 카테고리/게시판/게시글/글쓰기 페이지는 `PageHeader` 패턴을 우선 사용한다.
- 나중에 네비게이션 구조가 바뀌면 `PageHeader`, `MenuButton`, `equipment-categories.ts`를 중심으로 수정한다.

---

## 8. WYSIWYG 에디터 상태

현재 글쓰기 화면은 아래 컴포넌트를 사용한다.

```txt
src/features/editor/SimpleHtmlEditor.tsx
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

- 브라우저에서 업로드 전 리사이징한다.
- 긴 축 기준 최대 2000px로 제한한다.
- JPEG 품질 0.88로 data URL을 생성한다.
- 현재 mock 단계에서는 data URL을 본문에 삽입한다.
- 실제 서비스 단계에서는 같은 리사이징 흐름 뒤 R2 업로드 URL을 본문에 삽입한다.

레이아웃/모바일 안정화:

- 글쓰기 페이지는 다른 페이지와 동일하게 `container-shell` 기준을 사용한다.
- 모바일 입력 포커스 확대를 줄이기 위해 제목 input과 contentEditable 본문은 모바일에서 `text-base`를 사용한다.
- form grid는 `minmax(0, 1fr)`와 `min-w-0`을 사용해 에디터가 전체 페이지 폭을 밀지 않게 한다.
- 에디터 카드와 툴바는 `overflow-hidden`, `overflow-x-auto`, `max-w-full`로 내부 스크롤만 허용한다.
- 이미지와 에디터 본문은 `max-w-full`을 유지한다.

유지보수 원칙:

- 현재는 무거운 에디터 라이브러리 없이 `contentEditable` 기반 자체 컴포넌트로 시작한다.
- 실제 저장 전 서버에서 HTML sanitize를 반드시 적용해야 한다.
- 이후 TipTap 같은 고급 에디터로 교체하더라도 `features/editor` 경계를 유지한다.
- 에디터 버튼은 가능한 경우 다시 누르면 해제되는 toggle 동작을 우선한다.
- 이전 빌드 실패 원인이던 `html-editor-config` import는 제거되었다.

주의:

- `document.execCommand` 기반이라 브라우저별 차이가 있을 수 있다.
- MVP 이후에는 TipTap/ProseMirror 계열 에디터로 교체하는 것을 권장한다.

---

## 9. 반응형 점검 상태

현재 UI는 모바일 우선으로 구성한다.

점검할 화면 폭:

```txt
360px  작은 모바일
390px  일반 모바일
768px  태블릿
1024px 작은 데스크톱
1280px 데스크톱
```

홈:

- 모바일: Header/CTA는 세로 배치와 full width 버튼 허용
- 태블릿/데스크톱: Hero는 텍스트 + 비주얼 카드 2단 구조
- Featured Garage는 가로 스크롤 카드
- Category Boards 내부 주요글 스크롤은 카드 내부에서만 가로 스크롤된다.

탐색/게시판:

- 모바일: 카테고리/게시판/게시글 카드 1열
- 태블릿: 카테고리/게시판 카드 2열
- 데스크톱: 카테고리/게시판 카드 3~4열
- 카테고리 상세는 전체글 목록과 필터 버튼을 표시한다.
- 게시판 상세는 모바일 1열, 태블릿 이상에서 썸네일+본문 2단 게시글 카드
- 게시글 상세는 모바일 1열, 데스크톱에서 본문 + 사이드 정보 카드 2단 구조
- 글쓰기 페이지는 입력 포커스 확대와 에디터 overflow를 줄이기 위해 `text-base`, `min-w-0`, `overflow-x-hidden` 기준을 유지한다.
- 상단은 공통 PageHeader로 메뉴 버튼과 breadcrumb를 일관되게 표시

글쓰기:

- 모바일: 제목 입력, 에디터, 사이드 카드가 세로 배치된다.
- 모바일 입력 필드는 `text-base`를 사용해 브라우저 자동 확대를 완화한다.
- 데스크톱: 본문 작성 영역과 작성 위치/저장 카드가 2단으로 배치된다.
- 에디터 툴바는 작은 화면에서 에디터 카드 내부에서만 가로 스크롤된다.
- 에디터 본문과 삽입 이미지는 부모 폭을 넘지 않도록 제한한다.

내 차고:

- 모바일: 장비 카드 1열
- 태블릿: 장비 카드 2열
- 데스크톱: 장비 카드 최대 3열

공개 장비 페이지:

- 모바일: 커버 이미지 → 장비 정보 → 스탯 → 타임라인 → 부품
- 태블릿: 스탯 3열, 부품 2열
- 데스크톱: 커버/정보 2단, 본문 타임라인 + 부품 사이드바

---

## 10. 현재 공통 UI 컴포넌트 상태

```txt
Button
Badge
Card
SearchBar
SectionHeader
HorizontalScroller
EmptyState
MobileMenu
Breadcrumbs
MenuButton
PageHeader
SimpleHtmlEditor
CategoryBoardPostFilter
CategoryPostScroller
```

최근 보강된 컴포넌트:

- Button: primary / secondary / ghost, size 지원
- Badge: tone 지원
- Card: default / muted / dark variant 지원
- SearchBar: pill 스타일 검색창
- SectionHeader: action 영역 지원
- MobileMenu: 카테고리 링크 포함
- MenuButton: 큰 주황 메뉴 버튼 + 드롭다운 네비게이션
- Breadcrumbs: 현재 위치 표시 및 상위 이동
- PageHeader: menu/breadcrumb/title/description/action 통합
- SimpleHtmlEditor: contentEditable 기반 WYSIWYG 에디터
- CategoryBoardPostFilter: 카테고리 상세 전체글/게시판 필터 UI
- CategoryPostScroller: 홈 Category Boards 내부 주요글 스크롤 UI

주의:

- 아직 디자인 시스템은 완성형이 아니다.
- 실제 기능 화면이 늘어날수록 공통 컴포넌트를 먼저 확장하고 개별 페이지 하드코딩을 줄인다.

---

## 11. 현재 기술 구조 상태

### 11.1 Auth

```txt
src/server/auth/index.ts
```

- `getCurrentUser` stub
- `requireCurrentUser` stub
- 실제 로그인은 아직 없다.

### 11.2 Admin RBAC

```txt
src/server/admin/rbac.ts
src/server/admin/audit.ts
```

- AdminSession 타입
- 권한 체크 boundary
- audit log adapter 구조
- 현재 감사 로그는 console adapter 기반

### 11.3 Storage

```txt
src/server/storage/index.ts
```

- StorageProvider interface
- NoopStorageProvider
- R2StorageProvider boundary
- Cloudflare 전역 `R2Bucket`에 직접 의존하지 않는 `R2LikeBucket` 사용

### 11.4 DB

```txt
src/server/db/schema/index.ts
src/server/db/client.ts
```

현재 상태:

- Drizzle/D1 스키마 1차 정교화 완료
- D1 DB client boundary 추가
- users/equipments/photos/maintenance/parts/reminders 중심 foreign key 일부 반영
- users.email, equipments.userId+slug, photos.storageKey 등 unique/index 일부 반영
- createdAt/updatedAt 기본값 반영
- soft delete 컬럼 반영

주의:

- 현재 정적 Pages 화면에서는 DB client를 직접 사용하지 않는다.
- 실제 DB read/write는 Pages Functions 또는 Workers 도입 후 연결한다.

### 11.5 Equipment 도메인

```txt
src/features/equipment/types/index.ts
src/features/equipment/schemas/index.ts
src/features/equipment/queries/repository.ts
src/features/equipment/actions/mutations.ts
```

현재 상태:

- 장비 도메인 타입 보강
- create/update/list filter Zod schema 추가
- owner equipment 조회 repository 초안 추가
- public equipment 조회 repository 초안 추가
- create/update/soft delete mutation boundary 추가
- 장비 slug 자동 생성 가능
- update/delete는 userId 조건을 포함하도록 보강
- Node `crypto` 직접 의존 제거, Edge/runtime 안전한 ID 생성 helper 사용

아직 필요한 것:

- 실제 요청/응답 route 또는 Pages Function 연결
- optimistic UI 또는 form action 연결
- slug 중복 충돌 처리
- mutation 실패 처리와 사용자 메시지

### 11.6 Parts 도메인

```txt
src/features/parts/types/index.ts
src/features/parts/schemas/index.ts
```

현재 상태:

- 부품 도메인 타입 보강
- create/update/list filter Zod schema 추가

아직 필요한 것:

- repository/action 구현
- 장비 상세 페이지 연결

### 11.7 Board 도메인

현재 상태:

- `src/shared/data/equipment-categories.ts`에서 카테고리별 board config 관리
- `src/shared/data/mock-board-posts.ts`에서 mock post 관리
- `src/features/boards/components/CategoryBoardPostFilter.tsx`에서 카테고리 상세 필터 UI 관리
- `/explore/[category]/` 전체글 + 게시판 필터 구현
- `/explore/[category]/[board]/` 정적 게시글 목록 페이지 구현
- `/explore/[category]/[board]/[post]/` 정적 게시글 상세 페이지 구현
- `/explore/[category]/[board]/write/` 글쓰기 mock 구현
- `features/editor`에 WYSIWYG 에디터 경계 추가

아직 필요한 것:

- `features/boards` 타입/schema/repository/action 보강
- DB `boards`, `posts`, `comments`와 실제 연결
- 게시글 상세 페이지를 실제 post body 데이터로 교체
- 댓글 mock/CRUD 구조
- 글쓰기 저장 기능
- HTML sanitize 서버 처리
- 신고/숨김 처리 연결

---

## 12. 현재 주요 기술부채

### 12.1 DB 스키마 추가 검증 필요

1차 정교화는 되었지만 migration 생성 후 반드시 SQL을 검토해야 한다.

필요 작업:

- `npm run db:generate` 결과 확인
- D1에서 지원되는 SQL인지 확인
- 기존 migration과 충돌 여부 확인
- local D1 적용 테스트
- preview/production DB 분리

### 12.2 Pages Functions 도입 필요

정적 Pages만으로는 아래 기능을 구현할 수 없다.

- 로그인 세션
- DB read/write
- R2 업로드
- 어드민 mutation
- 결제 webhook

장비 CRUD나 게시글 작성 기능을 실제로 연결하는 시점에 Pages Functions 또는 Workers를 도입한다.

### 12.3 Next.js 버전 보안 경고

Cloudflare 빌드 로그에서 Next.js 15.3.2 보안 취약점 경고가 발생했다.

필요 작업:

- Next.js 패치 버전 확인
- 의존성 업데이트
- `npm audit` 확인
- 빌드 재검증

### 12.4 에디터 보안/호환성

- 현재 WYSIWYG 에디터는 `contentEditable`/`execCommand` 기반이다.
- 실제 저장 전 서버 sanitize가 필수다.
- data URL 이미지는 DB 저장 전 R2 업로드 URL로 전환해야 한다.
- 장기적으로 TipTap/ProseMirror 기반 에디터 전환을 검토한다.

### 12.5 디자인 세부 완성도

현재 디자인은 방향성과 반응형 구조를 확인하는 수준이다.

추가로 필요한 것:

- 실제 이미지/썸네일 처리
- 입력 폼 디자인
- 에러 상태 디자인
- 로딩 상태 디자인
- 모바일 메뉴를 실제 drawer로 개선
- 접근성 점검

---

## 13. 다음 개발 순서

### Phase A: DB 기반 마무리

1. migration 생성/검토
2. D1 local 적용 테스트
3. Pages Functions 또는 Workers 도입 방향 결정
4. 실제 DB 연결 환경변수/binding 확인

### Phase B: 장비 CRUD UI 연결

1. 장비 등록 폼
2. 장비 수정 폼
3. 장비 삭제/숨김 처리 UI
4. 장비 생성/수정/삭제 action 연결
5. `/garage/`를 mock에서 실제 데이터로 교체
6. `/garage/[slug]/`를 mock에서 실제 데이터로 교체

### Phase C: 게시판 기능 연결

1. `features/boards` 타입/schema/repository/action 보강
2. HTML sanitize 유틸
3. 글쓰기 폼 저장 연결
4. 게시글 상세 페이지를 DB 데이터로 교체
5. 댓글 mock/CRUD 구조
6. DB 기반 board/post/comment 연결
7. 신고/숨김 처리 연결

### Phase D: 이미지 업로드

1. R2 bucket 환경 분리
2. 이미지 업로드 UI
3. storage provider 연결
4. equipment photo 테이블 연결
5. 공개 페이지 이미지 반영
6. 에디터 data URL 이미지 삽입을 R2 업로드 URL 삽입으로 교체

### Phase E: 정비/부품 CRUD

1. 정비 기록 CRUD
2. 부품 CRUD
3. 공개/비공개 처리
4. 공개 페이지 타임라인 연결

### Phase F: 어드민 기본 운영

1. 관리자 권한 연결
2. 사용자/장비/게시글 조회
3. 콘텐츠 숨김/복구
4. 감사 로그 DB 저장

---

## 14. 개발 원칙 리마인드

- 정적 화면은 mock으로 빠르게 확인하되, 데이터 소스 교체가 쉬운 구조로 유지한다.
- DB 연결 전에도 schema/type/action 경계를 먼저 만든다.
- 페이지 컴포넌트에서 DB를 직접 호출하지 않는다.
- 공개 페이지 조회와 소유자 관리 조회는 반드시 분리한다.
- 공개/비공개/운영 숨김 상태를 혼동하지 않는다.
- 카테고리/게시판 config는 지금은 정적 데이터지만, 이후 어드민 관리형 DB 데이터로 교체할 수 있게 유지한다.
- 페이지 상단 구조는 `PageHeader`를 우선 사용하고, 개별 페이지에 breadcrumb/menu UI를 직접 반복하지 않는다.
- 에디터는 `features/editor` 경계를 유지하고, 저장 전 sanitize와 이미지 업로드 전환을 반드시 거친다.
- 글쓰기 페이지는 다른 페이지와 같은 container 기준을 유지하고, `min-w-0`, `overflow-x-hidden`, `text-base` 규칙을 유지한다.
- 홈 페이지는 섹션 컴포넌트로 유지하고, `src/app/page.tsx`는 조립 역할만 담당하게 유지한다.
- 가로 스크롤 UI는 부모 레이아웃을 밀지 않도록 `min-w-0`, `overflow-hidden`, `overflow-x-auto` containment를 유지한다.
- Cloudflare Pages 정적 배포가 깨지지 않도록 서버 전용 코드는 import 경로를 신중히 관리한다.

---

## 15. 현재 결론

현재 프로젝트는 다음 상태다.

```txt
정적 배포 가능
반응형 preview 페이지 확인 가능
홈 페이지 섹션 컴포넌트 분리 완료
공통 PageHeader/Breadcrumbs/MenuButton 기반 네비게이션 추가
카테고리 → 전체글/게시판 필터 → 게시판 상세 → 게시글 상세 → 글쓰기 mock 흐름 구현
글쓰기 화면 모바일 확대/overflow 완화 적용
WYSIWYG 에디터, 실행취소/다시실행, 링크/H2/인용 toggle, 이미지 2000px 리사이징 추가
내 정보 mock 페이지 구현
DB 스키마 1차 정교화 완료
D1 client boundary 추가
Equipment repository/action boundary 추가
실제 로그인/DB 연결/R2 업로드/게시글 저장은 아직 미구현
```

따라서 다음 작업은 **게시글 저장/sanitize/R2 업로드 연결** 또는 **댓글 mock/CRUD 구조 추가** 중 하나다.
