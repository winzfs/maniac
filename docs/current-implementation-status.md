# Maniac Garage 현재 구현 상태 및 점검 문서

## 1. 문서 목적

이 문서는 현재 `maniac` 저장소에 실제 구현된 상태를 기준으로 배포, 화면, 반응형, 기술 구조, 남은 과제, 다음 개발 순서를 정리한다.

기존 기획 문서는 서비스 방향과 장기 구조를 설명하고, 이 문서는 현재 코드 상태와 다음 작업 기준을 추적한다.

---

## 2. 현재 배포 상태

현재 프로젝트는 **정적 Cloudflare Pages 배포**를 기준으로 동작한다.

현재 방식:

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
- D1/R2는 아직 실제 기능에서 사용하지 않는다.
- D1/R2 binding은 이후 기능 확장을 위해 설정 초안만 유지한다.
- Cloudflare Pages에서 `ASSETS`는 예약어이므로 R2 binding은 `R2_ASSETS`를 사용한다.

---

## 3. 현재 확인 가능한 페이지

현재 정적 배포에서 확인 가능한 페이지는 다음과 같다.

```txt
/
/garage/
/garage/ninja-400/
```

### 3.1 홈 `/`

구현 상태:

- 반응형 랜딩 페이지
- Hero 영역
- 검색창 mock
- Featured Garage mock 카드
- Maintenance Timeline Preview
- Popular Categories
- CTA
- `/garage/` 이동 링크

역할:

- 서비스 첫인상 확인
- 디자인 방향 확인
- 정적 배포 검증

### 3.2 내 차고 `/garage/`

구현 상태:

- mock 장비 목록
- 요약 카드
- 장비 카드
- 공개 페이지 이동 버튼

역할:

- 향후 로그인 후 대시보드가 될 화면
- 장비 CRUD 연결 전 미리보기 화면

### 3.3 공개 장비 페이지 `/garage/ninja-400/`

구현 상태:

- mock 장비 상세
- 커버 비주얼 영역
- 장비명/모델/설명
- 주행거리/정비 기록 수/부품 수 스탯
- 정비 타임라인
- 튜닝 부품 목록

역할:

- 서비스 핵심인 장비 포트폴리오 페이지 미리보기
- 향후 중고 판매/공유 페이지의 기본 구조

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
- 다음 단계에서 repository/query layer를 만들면 mock 데이터 의존을 제거한다.
- 화면 구조는 유지하고 데이터 소스만 교체하는 방향으로 개발한다.

---

## 5. 반응형 점검 상태

현재 UI는 모바일 우선으로 구성한다.

### 5.1 기준 브레이크포인트

점검할 화면 폭:

```txt
360px  작은 모바일
390px  일반 모바일
768px  태블릿
1024px 작은 데스크톱
1280px 데스크톱
```

### 5.2 홈 반응형 기준

모바일:

- Header가 세로로 쌓일 수 있다.
- CTA 버튼은 full width로 보여도 된다.
- Hero는 1열 구조다.
- Featured Garage는 가로 스크롤 카드다.

태블릿/데스크톱:

- Hero는 텍스트 + 비주얼 카드 2단 구조다.
- Maintenance/Category 영역은 2열 구조다.
- CTA는 텍스트와 버튼이 좌우 배치된다.

### 5.3 내 차고 반응형 기준

모바일:

- 장비 카드는 1열이다.
- 상단 버튼은 full width로 내려올 수 있다.
- 요약 스탯은 3칸으로 유지한다.

태블릿:

- 장비 카드는 2열이다.

데스크톱:

- 장비 카드는 최대 3열이다.
- 요약 카드는 텍스트 + 스탯 영역으로 분리된다.

### 5.4 공개 장비 페이지 반응형 기준

모바일:

```txt
커버 이미지
장비 정보
스탯 카드
정비 타임라인
튜닝 부품
```

태블릿:

- 스탯 카드는 3열이다.
- 부품 카드는 2열까지 확장된다.

데스크톱:

- 상단은 커버 이미지 + 장비 정보 2단 구조다.
- 본문은 정비 타임라인 + 부품 사이드바 구조다.

---

## 6. 현재 공통 UI 컴포넌트 상태

현재 기본 컴포넌트:

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

현재 상태:

```txt
src/server/auth/index.ts
```

- `getCurrentUser` stub
- `requireCurrentUser` stub

아직 실제 로그인은 없다.

### 7.2 Admin RBAC

현재 상태:

```txt
src/server/admin/rbac.ts
src/server/admin/audit.ts
```

- AdminSession 타입
- 권한 체크 boundary
- audit log adapter 구조
- 현재 감사 로그는 console adapter 기반

### 7.3 Storage

현재 상태:

```txt
src/server/storage/index.ts
```

- StorageProvider interface
- NoopStorageProvider
- R2StorageProvider boundary
- Cloudflare 전역 `R2Bucket`에 직접 의존하지 않는 `R2LikeBucket` 사용

### 7.4 DB

현재 상태:

```txt
src/server/db/schema/index.ts
```

- Drizzle/D1 스키마 초안 존재
- 실제 repository/query layer는 아직 없음
- 일부 도메인 schema/type은 보강됨

보강된 도메인:

```txt
equipment
parts
```

아직 보강 필요:

```txt
maintenance
public-profile
site-content
boards
admin query/action
```

---

## 8. 현재 주요 기술부채

### 8.1 DB 스키마 정교화 필요

현재 DB 스키마는 첫 scaffold 수준에 가까운 부분이 남아 있다.

필요 작업:

- foreign key 정리
- unique index 정리
- createdAt/updatedAt default 정리
- visibility / moderationStatus 정리
- slug 정책 정리
- soft delete 정책 정리
- equipment, maintenance_logs, parts, photos 상세 필드 정리

### 8.2 Next.js 버전 보안 경고

Cloudflare 빌드 로그에서 Next.js 15.3.2 보안 취약점 경고가 발생했다.

필요 작업:

- Next.js 패치 버전 확인
- 의존성 업데이트
- `npm audit` 확인
- 빌드 재검증

### 8.3 정적 Pages 한계

현재 정적 Pages 배포는 빠르고 단순하지만 아래 기능에는 한계가 있다.

- 로그인 세션
- DB write
- R2 업로드
- 알림
- 결제 webhook
- 어드민 mutation

이 기능이 필요해지는 시점에 Pages Functions 또는 Workers를 도입한다.

### 8.4 디자인 세부 완성도

현재 디자인은 방향성과 반응형 구조를 확인하는 수준이다.

추가로 필요한 것:

- 실제 이미지/썸네일 처리
- 빈 상태 디자인
- 입력 폼 디자인
- 에러 상태 디자인
- 로딩 상태 디자인
- 모바일 메뉴 개선
- 접근성 점검

---

## 9. 다음 개발 순서

현재 상태에서는 아래 순서로 진행한다.

### Phase A: DB 기반 준비

1. DB 스키마 정교화
2. migration 생성/검토
3. DB client 생성
4. repository/query layer 생성
5. mock 데이터 대체 준비

### Phase B: 장비 CRUD

1. 장비 생성 action
2. 장비 수정 action
3. 장비 삭제 또는 soft delete action
4. 장비 등록/수정 폼
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
서비스 핵심 화면의 방향성 확인 가능
실제 DB/로그인/업로드 기능은 아직 미구현
```

따라서 다음 작업은 화면 추가보다 **DB 스키마 정교화와 장비 CRUD 기반 구축**이 우선이다.
