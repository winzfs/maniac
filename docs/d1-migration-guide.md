# D1 Migration Guide

Maniac Garage는 Cloudflare D1을 사용한다.

현재 MVP에서 사용하는 주요 테이블은 다음과 같다.

```txt
users
equipments
maintenance_logs
parts
```

`maintenance_logs`, `parts`는 초기 개발 중 API 내부 `CREATE TABLE IF NOT EXISTS`로 보장했지만, 운영 안정성을 위해 `migrations/0002_add_maintenance_logs_and_parts.sql`로 분리했다.

## 현재 D1 설정

`wrangler.toml` 기준:

```toml
[[d1_databases]]
binding = "DB"
database_name = "maniac-garage-dev"
database_id = "3eb4039d-f12f-4d9b-be5a-047b2a714012"
```

Cloudflare Pages는 `wrangler.toml`의 binding 설정을 우선할 수 있으므로, D1 binding을 바꿀 때는 대시보드뿐 아니라 `wrangler.toml`도 함께 확인한다.

## Migration 파일

```txt
migrations/0002_add_maintenance_logs_and_parts.sql
```

포함 내용:

```txt
maintenance_logs table
maintenance_logs indexes
parts table
parts indexes
```

## 적용 명령

로컬에서 Wrangler 로그인이 되어 있다면 다음 명령으로 remote D1에 적용한다.

```bash
npx wrangler d1 execute maniac-garage-dev --remote --file migrations/0002_add_maintenance_logs_and_parts.sql
```

또는 database id 기준으로 실행할 수 있다.

```bash
npx wrangler d1 execute 3eb4039d-f12f-4d9b-be5a-047b2a714012 --remote --file migrations/0002_add_maintenance_logs_and_parts.sql
```

## 적용 확인

```bash
npx wrangler d1 execute maniac-garage-dev --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('maintenance_logs', 'parts');"
```

기대 결과:

```txt
maintenance_logs
parts
```

## 현재 주의사항

아직 `functions/api/equipments/[id]/logs.ts`, `functions/api/equipments/[id]/parts.ts` 안에는 `ensureTable()` 안전장치가 남아 있다.

이유:

```txt
이미 배포된 환경에서 migration 적용 전 API가 죽지 않게 하기 위함
모바일/대시보드 중심 개발 중 수동 migration 누락 가능성 방지
```

migration 적용이 안정화되면 다음 단계에서 `ensureTable()`을 제거하고 schema/migration 기준으로만 운영한다.

## 다음 정리 작업

```txt
1. migration 적용 확인
2. API 내부 ensureTable 제거
3. D1 schema와 Drizzle schema 싱크
4. 공통 DB utility 추가
5. local/remote migration 실행 스크립트 package.json에 추가
```
