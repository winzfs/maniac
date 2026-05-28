# Maniac Garage (Foundation)

## 프로젝트 목적

Maniac Garage 웹서비스의 1차 개발 기반을 구성합니다.

현재 범위는 전체 서비스 구현이 아니라, 이후 장비 CRUD, 이미지 업로드, 공개 장비 페이지, 어드민 기능을 안정적으로 확장하기 위한 foundation입니다.

## 문서 위치

- `docs/maniac-garage-service-plan.md`
- `docs/admin-management-plan.md`
- `docs/site-content-board-management-plan.md`
- `docs/design-direction-guide.md`

## 현재 구현 범위

- Next.js 기반 앱 골격
- Tailwind 디자인 토큰
- 랜딩 페이지 mock
- 공통 UI 컴포넌트 초안
- 도메인 중심 폴더 구조
- Drizzle/D1용 DB 스키마 초안
- 관리자 RBAC 초안
- 감사 로그 adapter 초안
- 인증 boundary stub
- R2 storage provider boundary
- Cloudflare Pages/D1/R2 설정 초안

## 아직 mock/stub인 부분

- 실제 로그인/세션 연동
- 실제 DB client 생성 및 query layer
- 장비 CRUD
- 이미지 업로드 UI와 R2 업로드 flow
- 어드민 UI
- 게시판 UI
- 결제/구독
- 실제 감사 로그 DB 저장 adapter

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

## Cloudflare 배포 고려사항

- `wrangler.toml`은 Cloudflare Pages, D1, R2 바인딩 초안입니다.
- D1 binding 이름은 `DB`, R2 binding 이름은 `ASSETS`로 유지합니다.
- 현재 `cf:build`, `cf:deploy`, `cf:types` 스크립트는 Cloudflare 배포 준비용 초안입니다.
- Next.js를 Cloudflare에 배포할 때는 실제 Pages adapter/OpenNext 구성을 별도로 검증해야 합니다.
- Node 전용 패키지 의존을 최소화해 Edge 호환성을 우선합니다.

## Preview/Production 환경 분리 주의사항

- D1 DB는 Preview/Production 분리 필수입니다.
- R2 버킷도 환경별 분리합니다.
- Preview에서 운영 DB/R2에 접근하면 안 됩니다.
- 결제/알림/운영성 webhook은 Preview에서 실제 발송되지 않게 합니다.

## 다음 구현 순서 추천

1. DB client와 repository/query layer 정리
2. 장비 등록/수정/삭제
3. 내 차고 페이지
4. 공개 장비 페이지 mock 데이터 연결
5. R2 이미지 업로드
6. 정비 기록 CRUD
7. 부품 리스트 CRUD
8. 어드민 기본 조회/숨김 처리
