# Direct Auth Implementation Status

Maniac Garage에서 외부 인증 서비스 없이 이메일 기반 직접 로그인을 구현한 상태를 정리한다.

기존 `dev_user_maniac` mock user 기반 쓰기 흐름은 세션 기반 `currentUser.id` 저장/조회/수정/삭제 흐름으로 전환되었다.

---

## 구현 완료 범위

```txt
이메일 + 비밀번호 회원가입 ✅
이메일 + 비밀번호 로그인 ✅
로그아웃 ✅
GET /api/auth/me ✅
HttpOnly 쿠키 기반 세션 ✅
D1 users 테이블 기반 사용자 저장 ✅
users.credential_hash 저장 ✅
auth_sessions 테이블 기반 세션 저장 ✅
메뉴 로그인 상태 표시 ✅
/me/ 내 정보 페이지 ✅
/me/ 활동 요약 ✅
/me/posts/ 내 작성글 관리 ✅
/me/comments/ 내 댓글 관리 ✅
장비/게시글/댓글 작성 시 currentUser.id 사용 ✅
```

1차 범위에서 아직 제외된 것:

```txt
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
관리자 권한 UI
```

---

## DB 변경

`migrations/0005_add_auth_tables.sql`에서 인증용 컬럼/테이블을 추가한다.

```sql
ALTER TABLE users ADD COLUMN credential_hash TEXT;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verifier_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  revoked_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_verifier_hash_unique
  ON auth_sessions (verifier_hash);

CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
  ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx
  ON auth_sessions (expires_at);
```

주의:

```txt
0005는 기존 DB에 한 번만 적용한다.
ALTER TABLE users ADD COLUMN credential_hash TEXT; 는 같은 DB에 반복 적용하면 중복 컬럼 오류가 난다.
새 D1 DB는 0001 → 0002 → 0003 → 0004 → 0005 순서로 적용한다.
```

---

## API

```txt
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### POST /api/auth/signup

입력:

```json
{
  "email": "user@example.com",
  "nickname": "닉네임",
  "password": "password"
}
```

처리:

```txt
email normalize
password 정책 검사
credential hash 생성
users insert
session 생성
HttpOnly cookie 설정
```

### POST /api/auth/login

입력:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

처리:

```txt
email로 users 조회
credential hash 검증
session 생성
HttpOnly cookie 설정
```

### POST /api/auth/logout

처리:

```txt
현재 session revoked_at 업데이트
쿠키 삭제
```

### GET /api/auth/me

처리:

```txt
쿠키에서 session verifier 확인
DB에서 유효 세션 조회
사용자 정보 반환
```

---

## Cookie 정책

쿠키 이름:

```txt
maniac_session
```

현재 속성:

```txt
HttpOnly
SameSite=Lax
Path=/
Max-Age=2592000
Expires 포함
Secure in production
```

세션 만료:

```txt
30일
```

---

## 비밀번호 해시 정책

```txt
algorithm: PBKDF2-SHA256
iterations: 100000
salt: random 16 bytes
key length: 32 bytes
stored format: pbkdf2-sha256$iterations$saltBase64$hashBase64
```

주의:

```txt
Cloudflare Workers Web Crypto는 PBKDF2 iteration 100000 초과를 지원하지 않는다.
초기 210000 설정은 런타임 오류가 발생해 100000으로 낮췄다.
```

---

## 보안 원칙

```txt
비밀번호 원문 저장 금지
credential hash만 저장
세션 원문 verifier 저장 금지
verifier hash만 DB 저장
쿠키는 HttpOnly 사용
production에서는 Secure cookie 사용
로그인 실패 메시지는 과도하게 구체화하지 않기
```

---

## 세션 기반으로 전환된 API

```txt
GET    /api/equipments
POST   /api/equipments
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
GET    /api/equipments/:id/logs
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs
DELETE /api/equipments/:id/logs
GET    /api/equipments/:id/parts
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts
DELETE /api/equipments/:id/parts
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments
GET    /api/me/summary
GET    /api/me/posts
GET    /api/me/posts/:id
PATCH  /api/me/posts/:id
DELETE /api/me/posts/:id
GET    /api/me/comments
DELETE /api/me/comments/:id
```

기본 패턴:

```txt
const auth = await requireCurrentUser(request, env);
if (auth.response) return auth.response;
const userId = auth.user.id;
```

---

## 현재 남은 인증 관련 작업

```txt
이메일 인증
비밀번호 찾기
비밀번호 변경
세션 목록/전체 로그아웃
소셜 로그인
MFA
관리자 권한 모델
rate limit / brute-force protection
```
