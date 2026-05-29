# Maniac Garage 현재 구현 상태 및 점검 문서

## 1. 문서 목적

이 문서는 `maniac` 저장소의 현재 실제 구현 상태를 기준으로 배포 구조, 동작 페이지, API, D1 연동, 남은 과제, 다음 개발 순서를 정리한다.

기존 기획 문서는 서비스 방향과 장기 구조를 설명하고, 이 문서는 **현재 코드와 배포에서 실제로 동작하는 기능**을 추적한다.

---

## 2. 현재 한 줄 상태

Cloudflare Pages + D1 기반으로 장비 등록/목록/상세/수정/삭제와 정비 기록 CRUD, 부품 기록 CRUD까지 동작하는 1차 MVP 상태다.

```txt
장비 CRUD ✅
정비 기록 CRUD ✅
부품 기록 CRUD ✅
공개 장비 페이지 ✅
D1 저장 ✅
R2 업로드 ❌ 보류
실제 로그인 ❌ mock user 사용
```

---

## 3. 배포/런타임 구조

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

- D1 binding은 `wrangler.toml` 기준으로 관리한다.
- Cloudflare 대시보드에서 binding을 추가해도 `wrangler.toml`이 있으면 toml 설정이 우선될 수 있다.
- 현재 D1 database id는 `wrangler.toml`에 명시되어 있다.
- R2는 카드 등록 요구로 현재 보류 중이다.
- R2 대신 부품 `imageUrl`에 외부 이미지 URL을 직접 입력하는 방식으로 임시 대응한다.

---

## 4. 인증/사용자 상태

아직 실제 로그인/세션은 연결하지 않았다.

현재 모든 장비/정비/부품 데이터는 개발용 mock user에 귀속된다.

```txt
MOCK_USER_ID = dev_user_maniac
```

관련 파일:

```txt
functions/api/equipments.ts
functions/api/equipments/[id].ts
functions/api/equipments/[id]/logs.ts
functions/api/equipments/[id]/parts.ts
functions/garage/[slug].ts
```

향후 작업:

```txt
실제 로그인 연결
세션에서 userId 추출
mock user 제거
사용자별 데이터 격리
권한 검증 공통화
```

---

## 5. 현재 확인 가능한 주요 페이지

```txt
/
/explore/
/explore/motorcycle/
/explore/motorcycle/motorcycle-showcase/
/explore/motorcycle/motorcycle-showcase/motorcycle-showcase-post-1/
/explore/motorcycle/motorcycle-showcase/write/
/me/
/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/[slug]/
/garage/ninja-400/
```

현재 `/explore/*`, `/me/` 계열은 대부분 mock UI다.

현재 실제 D1과 연결된 핵심 페이지는 아래다.

```txt
/garage/
/garage/new/
/garage/edit/?id=장비ID
/garage/[slug]/
```

---

## 6. 장비 기능 구현 상태

### 6.1 장비 등록 `/garage/new/`

장비 등록 폼에서 입력한 정보를 D1 `equipments` 테이블에 저장한다.

주요 흐름:

```txt
/garage/new/
→ POST /api/equipments
→ D1 equipments insert
→ nextPath: /garage/[slug]/
```

관련 파일:

```txt
src/app/garage/new/page.tsx
src/features/equipment/components/EquipmentCreateForm.tsx
functions/api/equipments.ts
src/features/equipment/actions/mutations.ts
src/features/equipment/schemas/index.ts
```

한글 slug를 허용한다.

```txt
예: 닌자-400-3
```

URL에서 한글 slug는 인코딩되므로 공개 페이지 Function에서 `decodeURIComponent` 처리한다.

### 6.2 내 차고 `/garage/`

D1에 저장된 장비 목록을 불러온다.

```txt
GET /api/equipments
```

장비 카드에는 기본 정보와 정비 요약을 표시한다.

```txt
장비명
브랜드/모델/연식
사용량
공개 상태
정비 기록 개수
최근 정비일
총 정비 비용
보기 버튼
수정 버튼
```

관련 파일:

```txt
src/app/garage/page.tsx
src/features/equipment/components/GarageEquipmentList.tsx
functions/api/equipments.ts
```

### 6.3 장비 수정/삭제 `/garage/edit/?id=...`

장비 id를 query string으로 받아 클라이언트 컴포넌트에서 조회한다.

```txt
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
```

정적 export 환경에서 `/garage/[slug]/edit/` 같은 동적 edit route 대신, 안정적으로 동작하는 단일 edit page를 사용한다.

```txt
/garage/edit/?id=장비ID
```

관련 파일:

```txt
src/app/garage/edit/page.tsx
src/features/equipment/components/EquipmentEditPanel.tsx
functions/api/equipments/[id].ts
```

삭제는 hard delete가 아니라 `deleted_at`을 채우는 soft delete 방식이다.

### 6.4 공개 장비 페이지 `/garage/[slug]/`

Cloudflare Pages Function이 `/garage/:slug` 요청을 받아 D1에서 장비를 조회하고 HTML을 직접 반환한다.

```txt
GET /garage/:slug
```

현재 공개 페이지 표시 내용:

```txt
장비 기본 정보
장비 소개
스펙
사용량
공개 상태
slug
정비 타임라인
장착 부품
```

관련 파일:

```txt
functions/garage/[slug].ts
```

현재는 React 페이지가 아니라 Function에서 HTML 문자열을 직접 생성한다. 장기적으로는 API JSON + React 렌더링 구조로 개선하는 것이 좋다.

---

## 7. 정비 기록 기능 구현 상태

장비 수정 화면에서 정비 기록을 추가, 조회, 수정, 삭제할 수 있다.

### 7.1 API

```txt
GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=정비기록ID
DELETE /api/equipments/:id/logs?logId=정비기록ID
```

관련 파일:

```txt
functions/api/equipments/[id]/logs.ts
```

### 7.2 입력 필드

```txt
type
title
description
performedAt
usageMetricValue
cost
shopName
visibility
isPublic
```

### 7.3 UI

관련 파일:

```txt
src/features/equipment/components/MaintenanceLogPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
```

지원 동작:

```txt
정비 기록 목록 표시
정비 기록 추가
정비 기록 인라인 수정
정비 기록 삭제
공개/비공개/링크공개 설정
```

### 7.4 공개 페이지 표시

공개 장비 페이지에는 아래 조건의 정비 기록만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

정렬:

```txt
performed_at DESC
created_at DESC
```

---

## 8. 부품 기록 기능 구현 상태

장비 수정 화면에서 부품 기록을 추가, 조회, 수정, 삭제할 수 있다.

### 8.1 API

```txt
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=부품ID
DELETE /api/equipments/:id/parts?partId=부품ID
```

관련 파일:

```txt
functions/api/equipments/[id]/parts.ts
```

### 8.2 입력 필드

```txt
category
brand
name
price
installedAt
purchaseUrl
imageUrl
memo
visibility
```

### 8.3 UI

관련 파일:

```txt
src/features/equipment/components/PartsPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
```

지원 동작:

```txt
부품 목록 표시
부품 추가
부품 인라인 수정
부품 삭제
공개/비공개/링크공개 설정
구매 링크 입력
이미지 URL 입력
```

R2 업로드가 아직 없으므로 이미지는 외부 URL을 직접 입력한다.

### 8.4 공개 페이지 표시

공개 장비 페이지에는 아래 조건의 부품만 표시한다.

```txt
visibility = public
deleted_at IS NULL
```

표시 내용:

```txt
이미지 또는 PART 플레이스홀더
카테고리
설치일
브랜드 + 부품명
메모
가격
구매 링크
```

---

## 9. D1 테이블 상태

현재 사용 중인 주요 테이블:

```txt
users
equipments
maintenance_logs
parts
```

`users`, `equipments`는 기존 Drizzle 스키마/초기 DB 구조를 사용한다.

`maintenance_logs`, `parts`는 개발 편의를 위해 Pages Function에서 다음 방식으로 보장한다.

```sql
CREATE TABLE IF NOT EXISTS maintenance_logs (...)
CREATE TABLE IF NOT EXISTS parts (...)
```

주의:

- 이 방식은 빠른 MVP에는 편하지만 장기 운영에는 적합하지 않다.
- 다음 단계에서 정식 migration으로 분리해야 한다.
- 테이블 구조 변경 시 Function 코드와 migration이 어긋날 수 있다.

---

## 10. 현재 API 목록

```txt
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

GET    /garage/:slug
```

---

## 11. 주요 코드 위치

```txt
functions/api/equipments.ts
functions/api/equipments/[id].ts
functions/api/equipments/[id]/logs.ts
functions/api/equipments/[id]/parts.ts
functions/garage/[slug].ts

src/app/garage/page.tsx
src/app/garage/new/page.tsx
src/app/garage/edit/page.tsx

src/features/equipment/components/GarageEquipmentList.tsx
src/features/equipment/components/EquipmentCreateForm.tsx
src/features/equipment/components/EquipmentEditPanel.tsx
src/features/equipment/components/EquipmentMaintenanceSection.tsx
src/features/equipment/components/MaintenanceLogPanel.tsx
src/features/equipment/components/PartsPanel.tsx

src/features/equipment/schemas/index.ts
src/features/equipment/actions/mutations.ts
src/server/db/client.ts
src/server/db/schema.ts
```

---

## 12. 카테고리/게시판 상태

게시판/탐색 영역은 아직 mock UI 중심이다.

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

관련 파일:

```txt
src/shared/data/equipment-categories.ts
src/shared/data/mock-board-posts.ts
src/shared/data/mock-comments.ts
src/features/boards/components/CategoryBoardPostFilter.tsx
src/features/boards/components/PostCommentSection.tsx
src/features/boards/components/PostCommentCard.tsx
```

아직 실제 DB 저장은 연결되지 않았다.

---

## 13. 글쓰기/WYSIWYG 상태

글쓰기 mock 화면에는 자체 구현한 가벼운 WYSIWYG 에디터를 사용한다.

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

현재는 mock UI이며 실제 게시글 저장은 아직 연결되지 않았다.

---

## 14. 최근 해결한 이슈

### 14.1 D1 binding 문제

Cloudflare Pages가 대시보드 바인딩보다 `wrangler.toml` 설정을 기준으로 동작하는 상태였다.

해결:

```txt
wrangler.toml에 D1 database_id 직접 추가
binding = DB
```

### 14.2 한글 slug 조회 문제

한글 slug가 URL에서 `%EB...` 형태로 인코딩되어 D1 조회가 실패했다.

해결:

```txt
functions/garage/[slug].ts에서 decodeURIComponent 처리
```

### 14.3 정적 export 동적 페이지 문제

`/garage/[slug]/`가 빌드 시점에 생성되지 않아 새 장비 공개 페이지가 404였다.

해결:

```txt
functions/garage/[slug].ts에서 동적 slug를 받아 D1 조회 후 HTML 반환
```

### 14.4 Next 15 searchParams 타입 문제

`src/app/garage/edit/page.tsx`에서 서버 컴포넌트가 `searchParams`를 일반 객체로 받아 빌드 타입 에러가 발생했다.

해결:

```txt
클라이언트 컴포넌트 EquipmentMaintenanceSection에서 useSearchParams() 사용
```

### 14.5 부품 추가 후 reset 에러

부품 저장은 성공하지만 `event.currentTarget.reset()`이 비동기 처리 후 null처럼 동작해 에러가 발생했다.

해결:

```txt
const form = event.currentTarget
const payload = makePayload(new FormData(form))
await fetch(...)
form.reset()
```

---

## 15. 아직 mock/stub인 부분

```txt
실제 로그인/세션 연동
사용자별 권한 분리
R2 이미지 업로드
게시글/댓글 저장 기능
어드민 UI
결제/구독
신고/모더레이션 워크플로우
정식 DB migration 관리
React 기반 공개 장비 상세 페이지 전환
API 공통 유틸/에러 처리 정리
```

---

## 16. 다음 개발 추천 순서

### 1순위: 정식 D1 migration 정리

현재 `maintenance_logs`, `parts` 테이블이 Function 내부 `CREATE TABLE IF NOT EXISTS`로 보장된다. 안정성을 위해 migration 파일로 분리해야 한다.

할 일:

```txt
migrations 추가
maintenance_logs schema 정리
parts schema 정리
Function 내부 ensureTable 제거 또는 최소화
```

### 2순위: API 공통 유틸 분리

현재 API마다 반복되는 코드가 많다.

반복되는 항목:

```txt
jsonResponse
errorResponse
getEquipmentId
readJsonObject
ensureTable
hasEquipment
ZodError 처리
```

공통 유틸로 분리하면 이후 게시글/댓글 API를 붙일 때 안정적이다.

### 3순위: 공개 장비 페이지 구조 개선

현재 `/garage/[slug]/`는 Pages Function에서 HTML 문자열을 직접 만든다.

개선 방향:

```txt
GET /api/public/equipments/:slug JSON API 추가
React 공개 페이지에서 fetch 후 렌더링
공개 페이지 디자인 컴포넌트화
```

### 4순위: 로그인/세션 연결

mock user를 제거하고 실제 사용자별 데이터로 분리한다.

### 5순위: R2 업로드

R2 사용이 가능해지면 아래 기능을 붙인다.

```txt
장비 대표 이미지 업로드
부품 이미지 업로드
정비 기록 사진 첨부
게시글 이미지 업로드
```

### 6순위: 게시글/댓글 DB 저장 연결

현재 `/explore/*`는 mock 중심이다. 장비 MVP 이후 커뮤니티 기능을 DB로 전환한다.
