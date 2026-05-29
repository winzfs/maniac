# Maniac Garage

장비 마니아를 위한 **장비/정비/부품 기록 갤러리** 웹서비스입니다.

오토바이, 커스텀 PC, 기계식 키보드, 자전거, 카메라, 캠핑 장비처럼 애착이 큰 장비를 등록하고, 정비 이력과 부품 정보를 기록한 뒤 공개 페이지로 공유하는 것을 목표로 합니다.

## 현재 상태 요약

현재 저장소는 Cloudflare Pages + D1 기반의 1차 MVP까지 구현되어 있습니다.

```txt
장비 등록 ✅
D1 저장 ✅
내 차고 목록 표시 ✅
공개 장비 페이지 표시 ✅
장비 수정/삭제 ✅
정비 기록 CRUD ✅
정비 기록 공개 타임라인 ✅
부품 기록 CRUD ✅
부품 공개 목록 ✅
```

아직 로그인은 실제 인증이 아니라 개발용 mock user를 사용합니다.

```txt
MOCK_USER_ID = dev_user_maniac
```

R2 이미지 업로드는 카드 등록 이슈로 보류 중이며, 현재는 부품 `imageUrl`에 외부 이미지 URL을 직접 입력하는 방식으로 임시 대응합니다.

## 문서 위치

```txt
docs/maniac-garage-service-plan.md
docs/admin-management-plan.md
docs/site-content-board-management-plan.md
docs/design-direction-guide.md
docs/current-implementation-status.md
```

가장 최신 개발 현황은 아래 문서를 기준으로 확인합니다.

```txt
docs/current-implementation-status.md
```

## 배포/런타임 구조

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

D1 binding은 `wrangler.toml`에서 관리합니다. Cloudflare 대시보드에서 바인딩을 직접 수정해도 `wrangler.toml`이 우선 적용될 수 있습니다.

## 현재 확인 가능한 주요 페이지

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

## 현재 주요 기능

### 장비 관리

```txt
/garage/new/
```

장비를 등록하고 D1 `equipments` 테이블에 저장합니다.

```txt
/garage/
```

D1에서 저장된 장비 목록을 불러옵니다. 장비 카드에는 정비 요약이 표시됩니다.

```txt
정비 기록 개수
최근 정비일
총 정비 비용
```

```txt
/garage/edit/?id=장비ID
```

장비 기본 정보 수정/삭제, 정비 기록 관리, 부품 기록 관리를 제공합니다.

```txt
/garage/[slug]/
```

Cloudflare Pages Function이 slug를 받아 D1에서 장비를 조회하고 공개 HTML 페이지를 반환합니다.

### 정비 기록 관리

장비 수정 화면에서 정비 기록을 추가, 수정, 삭제할 수 있습니다.

지원 필드:

```txt
type
title
description
performedAt
usageMetricValue
cost
shopName
visibility
```

공개 페이지에는 `visibility = public`인 정비 기록만 표시됩니다.

### 부품 기록 관리

장비 수정 화면에서 부품 기록을 추가, 수정, 삭제할 수 있습니다.

지원 필드:

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

공개 페이지에는 `visibility = public`인 부품만 표시됩니다.

## API / Pages Functions

현재 Cloudflare Pages Functions에서 아래 API를 제공합니다.

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

개발 편의를 위해 `maintenance_logs`, `parts` 테이블은 해당 API가 호출될 때 `CREATE TABLE IF NOT EXISTS`로 보장합니다. 장기적으로는 별도 migration으로 분리해야 합니다.

## 주요 코드 위치

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
```

## 아직 mock/stub인 부분

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
```

## 다음 추천 작업

1. 정식 D1 migration 정리
2. 장비/정비/부품 API 공통 유틸 분리
3. 공개 장비 페이지를 Pages Function HTML 문자열에서 React/JSON 기반 구조로 개선
4. 로그인/세션 연결
5. R2 사용 가능 시 대표 이미지 업로드 추가
6. 게시글/댓글 DB 저장 연결
