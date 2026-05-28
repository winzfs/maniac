# Maniac Garage 현재 구현 상태 및 점검 문서

## 1. 문서 목적

이 문서는 현재 `maniac` 저장소에 실제 구현된 상태를 기준으로 배포, 화면, 반응형, 기술 구조, 남은 과제, 다음 개발 순서를 정리한다.

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
/garage/
/garage/ninja-400/
```

### 3.1 홈 `/`

- 반응형 랜딩 페이지
- Hero 영역
- 검색창 mock
- Featured Garage mock 카드
- Maintenance Timeline Preview
- Popular Categories
- CTA
- `/garage/` 이동 링크

### 3.2 내 차고 `/garage/`

- mock 장비 목록
- 요약 카드
- 장비 카드
- 공개 페이지 이동 버튼

### 3.3 공개 장비 페이지 `/garage/ninja-400/`

- mock 장비 상세
- 커버 비주얼 영역
- 장비명/모델/설명
- 주행거리/정비 기록 수/부품 수 스탯
- 정비 타임라인
- 튜닝 부품 목록

---

## 4. Mock 데이터 상태

현재 mock 데이터는 아래 파일에서 관리한다.

```txt
src/shared/data/mock-garage.ts
```

포함 데이터:

- 장비 1개
- 정비 기록 3개
- 튜닝 부품 3개

주의:

- 이 데이터는 실제 DB가 아니다.
- 다음 단계에서 repository/query layer와 Pages Functions를 연결하면 mock 데이터 의존을 제거한다.
- 화면 구조는 유지하고 데이터 소스만 교체하는 방향으로 개발한다.

---

## 5. 반응형 점검 상태

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

내 차고:

- 모바일: 장비 카드 1열
- 태블릿: 장비 카드 2열
- 데스크톱: 장비 카드 최대 3열

공개 장비 페이지:

- 모바일: 커버 이미지 → 장비 정보 → 스탯 → 타임라인 → 부품
- 태블릿: 스탯 3열, 부품 2열
- 데스크톱: 커버/정보 2단, 본문 타임라인 + 부품 사이드바

---

## 6. 현재 공통 UI 컴포넌트 상태

```txt
Button
Badge
Card
SearchBar
SectionHeader
HorizontalScroller
EmptyState
MobileMenu
```

최근 보강된 컴포넌트:

- Button: primary / secondary / ghost, size 지원
- Badge: tone 지원
- Card: default / muted / dark variant 지원
- SearchBar: pill 스타일 검색창
- SectionHeader: action 영역 지원

주의:

- 아직 디자인 시스템은 완성형이 아니다.
- 실제 기능 화면이 늘어날수록 공통 컴포넌트를 먼저 확장하고 개별 페이지 하드코딩을 줄인다.

---

## 7. 현재 기술 구조 상태

### 7.1 Auth

```txt
src/server/auth/index.ts
```

- `getCurrentUser` stub
- `requireCurrentUser` stub
- 실제 로그인은 아직 없다.

### 7.2 Admin RBAC

```txt
src/server/admin/rbac.ts
src/server/admin/audit.ts
```

- AdminSession 타입
- 권한 체크 boundary
- audit log adapter 구조
- 현재 감사 로그는 console adapter 기반

### 7.3 Storage

```txt
src/server/storage/index.ts
```

- StorageProvider interface
- NoopStorageProvider
- R2StorageProvider boundary
- Cloudflare 전역 `R2Bucket`에 직접 의존하지 않는 `R2LikeBucket` 사용

### 7.4 DB

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

### 7.5 Equipment 도메인

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

### 7.6 Parts 도메인

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

---

## 8. 현재 주요 기술부채

### 8.1 DB 스키마 추가 검증 필요

1차 정교화는 되었지만 migration 생성 후 반드시 SQL을 검토해야 한다.

필요 작업:

- `npm run db:generate` 결과 확인
- D1에서 지원되는 SQL인지 확인
- 기존 migration과 충돌 여부 확인
- local D1 적용 테스트
- preview/production DB 분리

### 8.2 Pages Functions 도입 필요

정적 Pages만으로는 아래 기능을 구현할 수 없다.

- 로그인 세션
- DB read/write
- R2 업로드
- 어드민 mutation
- 결제 webhook

장비 CRUD를 실제로 연결하는 시점에 Pages Functions 또는 Workers를 도입한다.

### 8.3 Next.js 버전 보안 경고

Cloudflare 빌드 로그에서 Next.js 15.3.2 보안 취약점 경고가 발생했다.

필요 작업:

- Next.js 패치 버전 확인
- 의존성 업데이트
- `npm audit` 확인
- 빌드 재검증

### 8.4 디자인 세부 완성도

현재 디자인은 방향성과 반응형 구조를 확인하는 수준이다.

추가로 필요한 것:

- 실제 이미지/썸네일 처리
- 입력 폼 디자인
- 에러 상태 디자인
- 로딩 상태 디자인
- 모바일 메뉴 개선
- 접근성 점검

---

## 9. 다음 개발 순서

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

### Phase C: 이미지 업로드

1. R2 bucket 환경 분리
2. 이미지 업로드 UI
3. storage provider 연결
4. equipment photo 테이블 연결
5. 공개 페이지 이미지 반영

### Phase D: 정비/부품 CRUD

1. 정비 기록 CRUD
2. 부품 CRUD
3. 공개/비공개 처리
4. 공개 페이지 타임라인 연결

### Phase E: 어드민 기본 운영

1. 관리자 권한 연결
2. 사용자/장비 조회
3. 콘텐츠 숨김/복구
4. 감사 로그 DB 저장

---

## 10. 개발 원칙 리마인드

- 정적 화면은 mock으로 빠르게 확인하되, 데이터 소스 교체가 쉬운 구조로 유지한다.
- DB 연결 전에도 schema/type/action 경계를 먼저 만든다.
- 페이지 컴포넌트에서 DB를 직접 호출하지 않는다.
- 공개 페이지 조회와 소유자 관리 조회는 반드시 분리한다.
- 공개/비공개/운영 숨김 상태를 혼동하지 않는다.
- Cloudflare Pages 정적 배포가 깨지지 않도록 서버 전용 코드는 import 경로를 신중히 관리한다.

---

## 11. 현재 결론

현재 프로젝트는 다음 상태다.

```txt
정적 배포 가능
반응형 preview 페이지 확인 가능
DB 스키마 1차 정교화 완료
D1 client boundary 추가
Equipment repository/action boundary 추가
실제 로그인/DB 연결/업로드 UI는 아직 미구현
```

따라서 다음 작업은 **migration 검증 후 장비 CRUD UI와 Pages Functions 연결**이다.
