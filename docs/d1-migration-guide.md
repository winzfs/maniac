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

현재는 `functions/api/equipments/[id]/logs.ts`, `functions/api/equipments/[id]/parts.ts` 내부의 런타임 테이블 생성 안전장치를 제거했다. 따라서 테이블 생성/변경은 migration 또는 D1 Console SQL을 기준으로 관리한다.

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

모바일 또는 Cloudflare 대시보드 중심으로 작업한다면 D1 Console에서 migration SQL 내용을 직접 붙여넣고 실행해도 된다.

## 적용 확인

```bash
npx wrangler d1 execute maniac-garage-dev --remote --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('maintenance_logs', 'parts');"
```

기대 결과:

```txt
maintenance_logs
parts
```

D1 Console에서는 아래 SQL로 확인할 수 있다.

```sql
SELECT name
FROM sqlite_master
WHERE type = 'table'
  AND name IN ('maintenance_logs', 'parts');
```

## 현재 상태

```txt
migration 파일 추가 ✅
remote D1에 SQL 적용 ✅
API 내부 ensureTable 제거 ✅
테이블 생성 책임을 migration으로 이동 ✅
```

## 주의사항

현재 `maintenance_logs`, `parts`는 SQL migration으로 존재하지만, Drizzle schema에는 아직 완전히 동기화하지 않았다.

따라서 다음 구조 정리가 필요하다.

```txt
D1 SQL schema 확인
Drizzle schema에 maintenance_logs, parts 반영
migration 실행 스크립트 package.json 추가
local/remote D1 migration 흐름 정리
```

## 다음 정리 작업

```txt
1. D1 schema와 Drizzle schema 싱크
2. local/remote migration 실행 스크립트 package.json에 추가
3. 공통 DB utility 추가
4. 실제 로그인 연결 후 user_id 기준 권한 검증 정리
```
