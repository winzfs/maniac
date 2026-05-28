# Maniac Garage (Foundation)

## 프로젝트 목적
Maniac Garage 웹서비스의 1차 개발 기반(도메인 구조, 디자인 시스템, 랜딩 페이지 골격, DB/RBAC 초안)을 구성합니다.

## 문서 위치
- `docs/maniac-garage-service-plan.md`
- `docs/admin-management-plan.md`
- `docs/site-content-board-management-plan.md`
- `docs/design-direction-guide.md`

## 로컬 실행
```bash
npm install
npm run dev
```

## DB Migration
```bash
npm run db:generate
npm run db:migrate
```

## Cloudflare 배포 고려사항
- Next.js + Cloudflare Pages/Workers 배포를 위한 `wrangler.toml` 초안을 포함합니다.
- D1/R2 바인딩 이름(`DB`, `ASSETS`)은 코드와 일치시켜야 합니다.
- Node 전용 패키지 의존을 최소화해 Edge 호환성을 우선합니다.

## Preview/Production 환경 분리 주의사항
- D1 DB는 Preview/Production 분리 필수 (서로 다른 database_id 사용).
- R2 버킷도 환경별 분리 권장.
- 관리자 권한/감사 로그는 동일 스키마를 유지하되 환경별 데이터 분리 운영.
