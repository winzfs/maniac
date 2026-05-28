# Maniac Garage (Foundation v1.5)

## 프로젝트 목적
Maniac Garage 서비스의 **확장 가능한 1.5차 기반**을 제공합니다. 현재 단계는 CRUD 화면 구현 전, 도메인/스키마/배포/권한 인터페이스를 실제 개발 가능한 수준으로 정리하는 데 집중합니다.

## 문서 위치
- `docs/maniac-garage-service-plan.md`
- `docs/admin-management-plan.md`
- `docs/site-content-board-management-plan.md`
- `docs/design-direction-guide.md`

## 현재 Foundation 범위
- 도메인 중심 폴더 구조 (`src/features/*`, `src/server/*`)
- 공통 UI 컴포넌트 재사용 기반
- 랜딩 페이지 목업
- Drizzle + D1 스키마 초안(관계/인덱스/유니크 포함)
- RBAC 권한 상수/검증 인터페이스
- Cloudflare Workers(OpenNext) 배포 골격

## 아직 mock/stub인 부분
- 인증(`getCurrentUser`)은 stub
- 감사 로그는 콘솔 writer 기본값(실DB writer 미연동)
- R2 업로드는 provider 인터페이스/초안만 존재
- 랜딩 데이터는 mock 기반

## 로컬 실행
```bash
npm install
npm run dev
```

## DB Migration
스키마 변경 시:
```bash
npm run db:generate
npm run db:migrate
```
- Drizzle 스키마 변경 후 migration 파일 diff를 반드시 검토하세요.
- Preview/Production 환경 DB에 같은 migration 순서를 적용하세요.

## Cloudflare 배포
OpenNext 기반 Next.js + Workers 흐름:
```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

### 배포 전 확인사항
- `wrangler.toml`의 D1/R2 바인딩 이름이 코드와 일치하는지 확인
- Preview/Production별로 D1 `database_id` 분리
- Preview/Production별로 R2 bucket 분리 권장
- `compatibility_date` 업데이트 정책 수립
- Node 의존성이 Edge 런타임에서 안전한지 확인

## 다음 구현 순서 (권장)
1. Auth 실제 연동(세션 + admin role 조회)
2. Audit log DB writer 구현
3. equipment/maintenance/parts 서버 action + query 추가
4. site-content/board CRUD API 초안 추가
5. 관리자 최소 운영 API(신고 처리/숨김/복구)
