# Maniac Garage 서비스 기획 및 개발 가이드

## 1. 문서 목적

이 문서는 `maniac` 프로젝트에서 구축할 장비/정비 기록 갤러리 서비스의 제품 방향, MVP 범위, 확장 가능한 기능 구조, 데이터 모델, 코딩 원칙, 유지보수 주의사항, Cloudflare 기반 배포 및 데이터베이스 구성 원칙을 정리한다.

서비스는 오토바이, 커스텀 PC, 기계식 키보드, 자전거, 카메라 등 애착 장비를 가진 마니아가 자신의 장비를 기록하고 공유할 수 있는 플랫폼을 목표로 한다. 초기 버전은 오토바이/바이크 오너를 1차 타깃으로 잡고, 이후 다른 장비 카테고리로 확장한다.

---

## 2. 서비스 한 줄 정의

**내 장비의 사진, 정비 이력, 튜닝 부품, 관리 주기를 하나의 멋진 공개 페이지로 기록하고 공유하는 마니아용 장비 포트폴리오 플랫폼.**

단순한 정비 기록장이 아니라 다음 4가지를 동시에 만족시키는 서비스로 기획한다.

1. 내 장비를 예쁘게 보여주는 갤러리
2. 정비/튜닝 이력을 관리하는 로그북
3. 중고 판매 시 신뢰를 높이는 이력 페이지
4. 마니아끼리 탐색하고 참고할 수 있는 장비 아카이브

---

## 3. 핵심 포지셔닝

### 나쁜 포지셔닝

> 오토바이 정비 기록 관리 앱

이 포지션은 너무 실용 도구에 가깝고 감성적 동기가 약하다.

### 좋은 포지셔닝

> 내 장비의 모든 기록을 가장 멋진 페이지로.

또는

> 정비 이력부터 튜닝 기록까지, 내 바이크의 포트폴리오.

서비스의 핵심 감정은 다음과 같다.

- 내 장비를 자랑하고 싶다.
- 어떤 부품을 달았는지 정리하고 싶다.
- 언제 어떤 정비를 했는지 잊고 싶지 않다.
- 나중에 팔 때 관리가 잘 된 장비라는 신뢰를 주고 싶다.

---

## 4. 초기 타깃

### 4.1 1차 타깃: 오토바이/바이크 오너

초기에는 오토바이 카테고리에 집중한다.

이유:

- 정비 주기와 소모품 관리 니즈가 명확하다.
- 튜닝 부품과 사진 자랑 욕구가 강하다.
- 중고 거래 시 정비 이력이 실제 구매 판단에 영향을 준다.
- 장비 단가와 유지비가 높아 유료 기능 전환 가능성이 상대적으로 높다.

### 4.2 이후 확장 후보

- 커스텀 PC
- 기계식 키보드
- 자전거
- 카메라/렌즈
- 캠핑 장비
- 낚시 장비
- 악기

단, 초기 코드 구조는 확장을 고려하되 UI/카피/기본 템플릿은 바이크 중심으로 시작한다.

---

## 5. MVP 범위

첫 버전의 목적은 결제보다 **사용자가 실제로 장비 페이지를 만들고 공유하는지 검증하는 것**이다.

### 5.1 MVP 필수 기능

1. 회원가입/로그인
2. 내 장비 등록
3. 대표 사진 및 갤러리 이미지 업로드
4. 정비/튜닝 기록 타임라인 작성
5. 장착 부품 리스트 작성
6. 공개 장비 페이지 생성
7. 공유 링크 복사
8. 모바일 반응형 UI

### 5.2 MVP에서 제외할 기능

초기에는 아래 기능을 넣지 않는다.

- 실시간 채팅
- DM
- 결제
- 중고거래 에스크로
- 댓글/팔로우
- 복잡한 커뮤니티 게시판
- 앱 출시
- AI 추천
- 정비소 예약
- 브랜드 제휴몰

서비스 검증 전에는 운영 부담이 큰 기능을 만들지 않는다.

---

## 6. 핵심 화면

### 6.1 랜딩 페이지

목표: 사용자가 서비스 가치를 즉시 이해하고 가입하게 만든다.

주요 섹션:

- 서비스 한 줄 소개
- 샘플 장비 페이지 미리보기
- 정비 타임라인 예시
- 튜닝 부품 리스트 예시
- 중고 판매 시 활용 예시
- 무료 시작 CTA

예시 카피:

> 당신의 장비에도 히스토리가 필요합니다.  
> 튜닝, 정비, 부품, 사진 기록을 하나의 멋진 페이지로 정리하세요.

### 6.2 대시보드

사용자의 장비 목록을 보여준다.

필수 기능:

- 장비 카드 목록
- 장비 추가 버튼
- 최근 정비 기록 바로가기
- 공개 페이지 보기 버튼

### 6.3 장비 관리 페이지

탭 구조로 구성한다.

- 개요
- 사진
- 정비 기록
- 튜닝 부품
- 알림
- 공개 페이지 설정

MVP에서는 알림 탭을 비활성/준비중 상태로 둘 수 있다.

### 6.4 정비 기록 작성 화면

필수 입력:

- 작업 종류
- 제목
- 날짜
- 당시 주행거리 또는 사용 시간
- 메모

선택 입력:

- 비용
- 사용 부품
- 사진
- 작업 장소
- 공개 여부
- 다음 알림 기준

### 6.5 공개 장비 페이지

이 서비스의 가장 중요한 화면이다.

구성:

- 대표 이미지
- 장비명
- 제조사/모델/연식
- 누적 주행거리 또는 사용 시간
- 오너 한마디
- 튜닝 요약
- 최근 정비 기록
- 전체 타임라인
- 갤러리
- 공유 버튼

공개 페이지는 사용자가 자랑하고 싶을 만큼 감성적으로 보여야 한다.

---

## 7. 주요 도메인 모델

초기부터 모든 도메인을 하나의 거대한 테이블이나 컴포넌트로 만들지 않는다. 장비, 사진, 정비 기록, 부품, 알림, 결제, 공개 페이지 설정은 서로 독립적인 모듈로 분리한다.

### 7.1 User

사용자 계정.

주요 필드:

- id
- email
- nickname
- profileImageUrl
- provider
- createdAt
- updatedAt

### 7.2 Equipment

사용자가 등록한 장비.

주요 필드:

- id
- userId
- category
- brand
- model
- nickname
- year
- description
- mainImageUrl
- visibility
- usageMetricType
- usageMetricValue
- createdAt
- updatedAt

주의:

- `category`는 문자열 하드코딩보다 enum 또는 별도 테이블로 관리한다.
- 바이크 외 카테고리 확장을 고려해 `mileage`만 고정하지 말고 `usageMetricType`, `usageMetricValue` 같은 구조를 사용한다.
  - bike = km
  - PC = hours 또는 purchase_date
  - keyboard = built_at 또는 usage_months

### 7.3 EquipmentPhoto

장비 사진.

주요 필드:

- id
- equipmentId
- imageUrl
- thumbnailUrl
- caption
- takenAt
- sortOrder
- createdAt

주의:

- 원본 이미지와 썸네일 이미지를 분리할 수 있게 설계한다.
- 이미지 업로드는 반드시 용량 제한, 확장자 제한, 서버 측 검증을 둔다.

### 7.4 MaintenanceLog

정비/튜닝/관리 기록.

주요 필드:

- id
- equipmentId
- type
- title
- description
- performedAt
- usageMetricValue
- cost
- shopName
- isPublic
- createdAt
- updatedAt

주의:

- `type`은 단순 문자열보다 코드값으로 관리한다.
- 정비 기록은 향후 판매용 페이지 신뢰도에 쓰일 수 있으므로 생성/수정 이력 추적을 고려한다.
- 사용자가 공개하지 않은 기록이 공개 페이지/API로 노출되지 않도록 접근 제어를 철저히 한다.

### 7.5 Part

장착 부품/튜닝 부품.

주요 필드:

- id
- equipmentId
- category
- brand
- name
- price
- installedAt
- purchaseUrl
- imageUrl
- memo
- createdAt

주의:

- 부품 카테고리는 장비 카테고리별로 다를 수 있다.
- 바이크 부품과 PC 부품을 같은 코드에 억지로 넣지 말고, 공통 필드 + 카테고리별 확장 필드 구조를 고려한다.

### 7.6 Reminder

정비/소모품 알림.

주요 필드:

- id
- equipmentId
- maintenanceType
- title
- baseUsageMetricValue
- intervalUsageMetricValue
- baseDate
- intervalDays
- nextDueUsageMetricValue
- nextDueDate
- channel
- isActive
- createdAt

주의:

- 알림 채널은 이메일, 웹푸시, 카카오 알림톡 등으로 확장 가능하게 enum화한다.
- 카카오 알림톡은 초기부터 붙이지 말고 이메일/웹 알림으로 먼저 검증한다.

### 7.7 Theme / Skin

공개 장비 페이지 꾸미기 상품.

주요 필드:

- id
- name
- price
- previewImageUrl
- isPremium
- createdAt

주의:

- 스킨은 코드에 직접 박지 말고 설정 기반으로 관리한다.
- 특정 스킨이 특정 카테고리 전용인지 구분할 수 있어야 한다.

---

## 8. 예상 수익화 모델

### 8.1 프리미엄 장비 페이지

- 프리미엄 스킨
- 커스텀 배경
- 고급 타임라인 디자인
- 더 많은 사진 업로드
- 영상 첨부
- 커스텀 URL
- 워터마크 제거
- 통계 카드

초기에는 월 구독보다 **스킨 단품 결제**가 심리적 장벽이 낮을 수 있다.

### 8.2 정비 알림 Pro

- 정비 주기 무제한
- 이메일/웹푸시/카카오 알림
- 주행거리 기반 알림
- 소모품별 추천 주기

### 8.3 판매용 인증 페이지

중고 판매 시 정비 이력 링크를 생성하는 기능.

- 판매용 공개 페이지
- PDF 정비 이력서
- 최근 정비/부품 교체 요약
- 관리 상태 강조

### 8.4 거래/노출 수익

유저 수가 충분히 쌓인 뒤 고려한다.

- 부품 판매글 상단 노출
- 장비 판매글 상단 노출
- 샵 광고
- 브랜드 제휴

초기부터 중고거래를 깊게 만들지 않는다. 운영 리스크가 크다.

---

## 9. 권장 기술 스택

초기 개발 속도, 비용, 유지보수, 배포 편의성을 고려해 **Cloudflare 중심 구성**을 우선 검토한다.

### 9.1 기본 애플리케이션 스택

- Next.js 또는 Remix
- TypeScript
- Tailwind CSS
- Drizzle ORM 우선 검토
- Zod 기반 입력 검증
- Cloudflare Pages 또는 Cloudflare Workers
- Cloudflare R2
- Cloudflare D1 또는 외부 PostgreSQL
- Toss Payments 또는 PortOne

### 9.2 Cloudflare 우선 구성

Cloudflare를 기본 배포/운영 플랫폼으로 사용한다.

권장 구성:

- 정적/SSR 웹 배포: Cloudflare Pages
- 서버 로직/API: Cloudflare Workers 또는 Pages Functions
- 이미지/첨부 저장소: Cloudflare R2
- CDN/캐시: Cloudflare CDN
- 도메인/DNS: Cloudflare DNS
- 환경변수/시크릿: Cloudflare Dashboard 또는 Wrangler secrets
- 주기 작업: Cloudflare Cron Triggers
- 간단한 KV 캐시: Cloudflare KV

주의:

- Next.js를 Cloudflare에 배포할 경우 Node.js 런타임 의존 패키지를 신중히 선택한다.
- Edge 런타임에서 동작하지 않는 라이브러리, 파일 시스템 접근, 일부 Node API 사용을 피한다.
- 이미지 처리 라이브러리처럼 native dependency가 필요한 기능은 Cloudflare 환경에서 제약이 있을 수 있다.
- 초기에는 Cloudflare Pages + Pages Functions 조합으로 시작하고, 백엔드가 커지면 Workers를 명확히 분리한다.

### 9.3 데이터베이스 선택 기준

데이터베이스는 아래 두 선택지 중 하나로 결정한다.

#### 선택지 A: Cloudflare D1

장점:

- Cloudflare 생태계와 잘 맞는다.
- MVP 비용이 낮다.
- Workers/Pages Functions와 붙이기 쉽다.
- SQLite 기반이라 단순한 CRUD 서비스에 빠르게 적용 가능하다.

주의:

- PostgreSQL에 비해 고급 쿼리, 복잡한 트랜잭션, 확장성 판단이 필요하다.
- 장기적으로 커뮤니티/거래/검색/통계 기능이 커지면 한계가 생길 수 있다.
- Prisma보다 Drizzle ORM 조합을 우선 검토한다.

적합한 경우:

- 초기 MVP
- 장비/정비/부품/사진 메타데이터 중심 CRUD
- 비용을 낮추고 빠르게 검증하려는 경우

#### 선택지 B: 외부 PostgreSQL

후보:

- Supabase Postgres
- Neon
- Railway Postgres
- Cloudflare Hyperdrive + PostgreSQL

장점:

- 관계형 모델과 복잡한 쿼리에 강하다.
- 향후 검색, 통계, 거래, 결제 이력 관리가 커져도 안정적이다.
- Prisma/Drizzle 선택지가 넓다.

주의:

- Cloudflare Workers에서 외부 DB 연결 시 connection pooling 문제가 생길 수 있다.
- Cloudflare Hyperdrive 또는 서버리스 친화 DB 드라이버 사용을 검토한다.
- DB 리전과 주요 사용자 리전을 고려한다. 한국 타깃이면 아시아 리전 지원 여부를 확인한다.

적합한 경우:

- 처음부터 장기 확장성을 강하게 보고 갈 경우
- 결제/판매용 인증/검색/통계 기능을 빠르게 붙일 계획이 있는 경우
- 데이터 정합성이 더 중요한 경우

### 9.4 초기 권장 결정

MVP는 다음 중 하나로 시작한다.

1. **Cloudflare Pages + Pages Functions + D1 + R2 + Drizzle**
   - 가장 가볍고 비용이 낮다.
   - MVP 검증에 적합하다.

2. **Cloudflare Pages/Workers + 외부 PostgreSQL + R2 + Drizzle**
   - 장기 확장성이 더 좋다.
   - DB 연결 방식과 운영 비용을 먼저 검토해야 한다.

현재 서비스는 이미지와 공개 페이지가 중요하고, 초기에는 CRUD 중심이므로 **1차 MVP는 D1로 시작해도 충분하다.** 다만 중고거래, 결제 이력, 통계, 검색 기능이 커지면 PostgreSQL 전환 또는 병행을 검토한다.

### 9.5 Cloudflare 배포 구조 예시

```txt
Cloudflare DNS
  -> Cloudflare Pages
      -> Next.js/Remix Frontend
      -> Pages Functions API
          -> D1 또는 PostgreSQL
          -> R2 Storage
          -> KV Cache
          -> Cron Triggers
```

### 9.6 데이터베이스 마이그레이션 원칙

- 스키마 변경은 반드시 migration 파일로 관리한다.
- 운영 DB에 직접 수동 변경하지 않는다.
- 개발/스테이징/운영 DB를 분리한다.
- seed 데이터는 개발용과 운영용을 분리한다.
- migration은 롤백 가능성을 고려해 작성한다.
- 데이터 삭제 컬럼 변경은 soft migration을 우선한다.

예시:

```txt
migrations/
  0001_create_users.sql
  0002_create_equipments.sql
  0003_create_maintenance_logs.sql
  0004_create_parts.sql
  0005_create_equipment_photos.sql
```

### 9.7 Cloudflare 환경변수 관리

환경변수는 `.env`에만 의존하지 말고 Cloudflare 배포 환경별로 분리한다.

필수 분리:

- local
- preview/staging
- production

관리 대상:

- DB connection/binding
- R2 bucket binding
- auth secret
- OAuth client id/secret
- payment secret
- webhook secret
- public site URL

주의:

- 공개 가능한 변수와 서버 전용 secret을 구분한다.
- GitHub 저장소에 secret을 커밋하지 않는다.
- Cloudflare Preview 환경과 Production 환경의 DB/R2 bucket을 분리한다.

### 9.8 이미지 저장소 구성

이미지는 Cloudflare R2를 기본 저장소로 사용한다.

권장 bucket:

- `maniac-dev-assets`
- `maniac-prod-assets`

폴더 구조 예시:

```txt
equipments/{equipmentId}/photos/{photoId}/original.webp
equipments/{equipmentId}/photos/{photoId}/thumb.webp
users/{userId}/avatar.webp
```

주의:

- 업로드 시 파일 크기 제한을 둔다.
- 공개 이미지 URL과 비공개 원본 접근 정책을 분리한다.
- 삭제 시 DB 레코드와 R2 object 정리 정책을 함께 설계한다.
- Cloudflare Images 사용 여부는 추후 비용과 변환 기능을 보고 결정한다.

### 9.9 캐시 전략

공개 장비 페이지는 캐시 효과가 크다.

권장:

- 공개 장비 페이지 HTML/데이터 캐시
- 대표 이미지 CDN 캐시
- 장비 탐색 목록 캐시
- 비공개/소유자 페이지는 캐시하지 않거나 짧게 설정

주의:

- 정비 기록 수정 후 공개 페이지 캐시 무효화 전략이 필요하다.
- 소유자 전용 데이터가 CDN 캐시에 섞이지 않도록 한다.

---

## 10. 코드 구조 원칙

모든 기능과 코드는 확장 및 유지보수가 용이하도록 구성한다.

### 10.1 도메인 중심 구조

기능별로 파일을 흩뿌리지 말고 도메인 기준으로 묶는다.

예시:

```txt
src/
  app/
  features/
    equipment/
      components/
      actions/
      queries/
      schemas/
      types/
    maintenance/
      components/
      actions/
      queries/
      schemas/
      types/
    parts/
      components/
      actions/
      queries/
      schemas/
      types/
    public-profile/
      components/
      queries/
      themes/
  shared/
    components/
    lib/
    constants/
    utils/
  server/
    db/
    auth/
    storage/
```

### 10.2 UI와 비즈니스 로직 분리

컴포넌트 안에서 DB 호출, 권한 체크, 파일 업로드, 결제 로직을 직접 처리하지 않는다.

권장 구조:

- UI 컴포넌트: 화면 표시와 사용자 인터랙션만 담당
- action/service: 생성, 수정, 삭제 같은 비즈니스 흐름 담당
- query/repository: 데이터 조회 담당
- schema: 입력 검증 담당
- type: 도메인 타입 담당

### 10.3 입력 검증 필수

모든 사용자 입력은 서버 측에서 검증한다.

예시 검증 대상:

- 장비명 길이
- 정비 기록 제목/본문 길이
- 날짜 형식
- 비용 범위
- 주행거리/사용량 범위
- 이미지 파일 확장자
- 이미지 파일 크기
- URL 형식

클라이언트 검증은 UX용이고, 보안은 서버 검증이 기준이다.

### 10.4 공개/비공개 접근 제어

이 서비스는 공개 페이지가 핵심이기 때문에 접근 제어 실수가 치명적이다.

주의:

- 비공개 장비는 공개 API에서 조회되지 않아야 한다.
- 비공개 정비 기록은 공개 페이지에 절대 노출되지 않아야 한다.
- 소유자만 수정/삭제할 수 있어야 한다.
- 공개 페이지 조회 쿼리와 관리자/소유자 조회 쿼리를 분리한다.

### 10.5 카테고리 확장성

처음은 바이크 중심이지만 다른 장비 카테고리를 고려한다.

나쁜 예:

```ts
motorcycleMileage: number;
oilChangedAt: Date;
```

좋은 예:

```ts
category: EquipmentCategory;
usageMetricType: 'km' | 'hours' | 'days' | 'custom';
usageMetricValue: number | null;
```

카테고리별 세부 정보는 별도 확장 테이블 또는 JSON 필드로 분리한다.

단, JSON 필드를 남용하지 않는다. 검색/필터링/정렬이 필요한 필드는 정규화한다.

### 10.6 설정 기반 설계

정비 유형, 부품 카테고리, 스킨, 알림 채널 등은 코드 곳곳에 하드코딩하지 않는다.

권장:

- 상수 파일
- DB 기반 설정
- 카테고리별 config

예시:

```ts
const EQUIPMENT_CATEGORY_CONFIG = {
  motorcycle: {
    usageMetric: 'km',
    defaultMaintenanceTypes: ['engine_oil', 'tire', 'brake_pad', 'chain'],
  },
  pc: {
    usageMetric: 'hours',
    defaultMaintenanceTypes: ['dust_cleaning', 'thermal_paste', 'fan_check'],
  },
};
```

### 10.7 이미지 처리 주의

이미지는 비용과 성능에 큰 영향을 준다.

주의:

- 원본 이미지를 그대로 리스트에 뿌리지 않는다.
- 썸네일/중간 크기 이미지를 생성하거나 CDN 변환 기능을 사용한다.
- 업로드 용량 제한을 둔다.
- 공개 페이지는 이미지 lazy loading을 적용한다.
- 이미지 삭제 시 스토리지 파일도 함께 정리한다.

### 10.8 삭제 정책

정비 기록과 장비 삭제는 신중히 처리한다.

권장:

- 실제 삭제보다 soft delete 우선 검토
- 장비 삭제 시 사진, 기록, 부품, 알림의 처리 정책 명확화
- 결제/판매용 인증 페이지와 연결된 데이터는 즉시 삭제하지 않도록 주의

### 10.9 로그와 감사 이력

중고 판매용 신뢰 페이지로 확장하려면 기록의 신뢰성이 중요해진다.

향후 고려:

- 정비 기록 생성일/수정일 표시
- 중요한 기록의 수정 이력 저장
- 판매용 페이지 생성 시 스냅샷 저장

MVP에서는 과도한 감사 시스템을 만들 필요는 없지만, `createdAt`, `updatedAt`은 반드시 둔다.

### 10.10 테스트 우선 영역

초기부터 모든 UI 테스트를 만들 필요는 없지만 아래는 반드시 테스트한다.

- 소유자 권한 체크
- 공개/비공개 필터링
- 정비 기록 생성/수정/삭제
- 이미지 업로드 검증
- 장비 삭제 시 연관 데이터 처리
- 알림 예정일 계산 로직
- Cloudflare preview/production 환경변수 분리
- D1 또는 PostgreSQL migration 적용

---

## 11. API 설계 주의사항

### 11.1 공개 API와 소유자 API 분리

공개 장비 페이지용 조회와 대시보드용 조회를 분리한다.

예시:

- `getPublicEquipmentProfile(slug)`
- `getOwnerEquipmentDetail(userId, equipmentId)`

공개 API에서는 비공개 필드가 select 단계에서부터 제외되어야 한다.

### 11.2 페이지 단위 조회 최적화

공개 페이지는 이미지, 정비 기록, 부품 리스트를 함께 보여준다.

주의:

- N+1 쿼리 방지
- 필요한 필드만 select
- 타임라인 페이지네이션 고려
- 이미지 목록은 초기 노출 개수 제한

### 11.3 슬러그 정책

공개 페이지 URL에 사용할 slug는 충돌과 변경 정책을 정해야 한다.

예시:

```txt
/@nickname/equipment-slug
```

주의:

- 닉네임 변경 시 기존 링크 유지 여부
- 장비 slug 중복 처리
- 예약어 사용 제한

---

## 12. 보안 주의사항

- 모든 mutation은 로그인 필수
- 장비 소유자만 수정/삭제 가능
- 업로드 파일 MIME type 검증
- 이미지 외 파일 업로드 차단
- XSS 방지를 위해 사용자 입력 렌더링 시 escape 처리
- 공개 페이지 description/메모에서 HTML 직접 입력 금지
- 결제 웹훅은 반드시 서명 검증
- 관리자 기능은 별도 권한 체계 적용
- Cloudflare 환경변수와 secret은 GitHub에 커밋하지 않는다.
- Preview 환경에서 운영 DB/R2 bucket에 접근하지 않도록 분리한다.

---

## 13. 성능 주의사항

- 공개 페이지는 SEO와 공유 미리보기가 중요하다.
- 대표 이미지는 Open Graph 이미지로 사용될 수 있게 한다.
- 이미지 lazy loading 적용
- Cloudflare CDN 캐시를 적극 활용한다.
- 타임라인 무한 스크롤 또는 페이지네이션 고려
- 장비 탐색 페이지는 필터/정렬 인덱스 고려
- 정비 기록 수가 많아져도 페이지가 느려지지 않게 설계한다.
- Cloudflare Workers/Pages Functions에서 cold start와 외부 DB 연결 비용을 고려한다.

---

## 14. SEO 및 공유

공개 페이지는 공유될 때 매력적으로 보여야 한다.

필수:

- 장비명 기반 title
- 장비 소개 기반 description
- 대표 이미지 OG image
- canonical URL
- 공개 여부에 따른 noindex 처리

예시:

```txt
Ninja 400 - minsu의 바이크 정비/튜닝 기록 | Maniac Garage
```

---

## 15. 단계별 개발 로드맵

### Phase 1: MVP

목표: 장비 페이지 생성과 공유 검증.

- 프로젝트 기본 세팅
- Cloudflare Pages/Workers 배포 세팅
- D1 또는 PostgreSQL DB 구성
- R2 이미지 저장소 구성
- 인증
- 장비 등록/수정/삭제
- 이미지 업로드
- 정비 기록 CRUD
- 부품 리스트 CRUD
- 공개 페이지
- 공유 링크
- 기본 반응형 UI

### Phase 2: 재방문 기능

목표: 사용자가 기록을 계속 추가하게 만든다.

- 정비 주기 알림
- Cloudflare Cron Triggers 기반 알림 작업
- 주행거리 업데이트
- 최근 정비 요약
- 다음 정비 예정 표시
- 장비별 통계
- 갤러리 개선

### Phase 3: 수익화

목표: 낮은 운영 부담의 유료 기능부터 도입.

- 프리미엄 스킨
- 커스텀 배지
- PDF 정비 이력서
- 판매용 페이지
- 결제 연동
- 결제 웹훅 검증

### Phase 4: 커뮤니티/거래 확장

목표: 유저 수가 쌓인 뒤 네트워크 효과 강화.

- 장비 탐색 페이지
- 좋아요
- 댓글
- 팔로우
- 부품 리뷰
- 중고 부품 게시판
- 상단 노출 결제

---

## 16. 개발 시 피해야 할 것

- MVP부터 중고거래 전체 기능을 만드는 것
- 바이크 전용 필드를 모든 테이블에 박아 확장을 막는 것
- 공개 페이지와 관리자 페이지의 쿼리를 재사용해 비공개 정보가 새는 것
- 이미지 원본을 무제한 업로드하게 두는 것
- 스킨/정비 유형/부품 카테고리를 컴포넌트 내부에 하드코딩하는 것
- DB 스키마 없이 UI부터 과하게 만드는 것
- 결제 로직을 일반 action 안에 섞는 것
- 서비스 계층 없이 컴포넌트에서 직접 DB를 수정하는 것
- 테스트 없이 권한 로직을 배포하는 것
- Cloudflare Edge 환경에서 동작하지 않는 Node.js 전용 패키지를 핵심 경로에 넣는 것
- Preview/Production 환경을 같은 DB 또는 같은 R2 bucket으로 운영하는 것
- migration 없이 운영 DB를 수동 변경하는 것

---

## 17. 의사결정 기준

기능을 추가할 때 아래 질문을 통과해야 한다.

1. 사용자가 내 장비를 더 멋지게 보여주는 데 도움이 되는가?
2. 사용자가 정비/튜닝 기록을 계속 남기게 만드는가?
3. 중고 판매나 신뢰 형성에 도움이 되는가?
4. 바이크 외 카테고리로 확장할 때 큰 구조 변경 없이 대응 가능한가?
5. Cloudflare 기반 배포/운영 구조에서 안정적으로 동작하는가?
6. 운영 부담이 MVP 단계에서 감당 가능한가?

위 질문 중 1~3에 해당하지 않는 기능은 초기 우선순위를 낮춘다.

---

## 18. 초기 성공 지표

- 가입자 대비 장비 생성률
- 장비당 평균 사진 수
- 장비당 평균 정비 기록 수
- 공개 페이지 공유 수
- 공유 링크 클릭 수
- 7일 이내 재방문율
- 판매용 페이지 사용 의향
- 프리미엄 스킨 구매 의향
- Cloudflare 비용 대비 트래픽 처리 효율
- 이미지 저장소 사용량 증가 추이

---

## 19. 최종 방향

초기에는 `바이크 전용 장비 기록 갤러리`로 시작한다. 다만 코드와 데이터 모델은 `장비 카테고리 확장`을 전제로 설계한다.

서비스의 본질은 정비 기록장이 아니라 **마니아의 장비 포트폴리오**다. 따라서 기능 우선순위는 항상 아래 순서를 따른다.

1. 공개 페이지가 멋있어야 한다.
2. 기록 작성이 쉬워야 한다.
3. 정비 이력이 신뢰 자료가 되어야 한다.
4. Cloudflare 기반으로 저비용 배포와 확장 가능한 운영 구조를 갖춰야 한다.
5. 이후 결제와 거래로 확장할 수 있어야 한다.

이 문서는 구현 중 제품 방향과 기술 방향이 흔들릴 때 기준 문서로 사용한다.
