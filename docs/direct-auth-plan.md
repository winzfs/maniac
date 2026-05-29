# Direct Auth Implementation Plan

Maniac Garage에서 외부 인증 서비스 없이 이메일 기반 직접 로그인을 구현하기 위한 계획이다.

현재 서비스는 `dev_user_maniac` mock user를 사용한다. 직접 로그인 구현 후에는 요청 쿠키에서 현재 사용자를 확인하고, 장비/게시글/댓글 데이터를 실제 user id 기준으로 저장한다.

---

## 목표

```txt
회원가입
로그인
로그아웃
내 정보 조회
HttpOnly 쿠키 기반 세션
D1 users 테이블 기반 사용자 저장
기존 MOCK_USER_ID 제거 준비
```

---

## 1차 범위

```txt
이메일 + 비밀번호 회원가입
이메일 + 비밀번호 로그인
로그아웃
/api/auth/me
내 정보 페이지 표시
장비/게시글/댓글 작성 시 currentUser.id 사용
```

1차 범위에서 제외:

```txt
이메일 인증
비밀번호 찾기
소셜 로그인
MFA
관리자 권한 UI
```

---

## DB 변경 계획

`users` 테이블에 비밀번호 검증용 해시 컬럼을 추가한다.

별도 세션 테이블을 둔다.

권장 SQL:

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
위 SQL은 기존 DB에 한 번만 적용한다.
ALTER TABLE은 같은 DB에 반복 적용하면 중복 컬럼 오류가 날 수 있다.
추후 migration 이력 관리 도입 시 0005_add_auth_tables.sql로 분리한다.
```

---

## API 계획

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

권장 속성:

```txt
HttpOnly
Secure in production
SameSite=Lax
Path=/
Max-Age=2592000
```

세션 만료:

```txt
30일
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

## 구현 순서

```txt
1. auth DB migration 적용
2. functions/_shared/auth-password.ts 추가
3. functions/_shared/auth-session.ts 추가
4. /api/auth/signup 추가
5. /api/auth/login 추가
6. /api/auth/logout 추가
7. /api/auth/me 추가
8. 로그인/회원가입 페이지 추가
9. Header/Menu에 로그인 상태 표시
10. 기존 쓰기 API에서 MOCK_USER_ID 대신 currentUser.id 사용
```

---

## 기존 API 전환 계획

현재:

```txt
MOCK_USER_ID = dev_user_maniac
```

전환 후:

```txt
const user = await requireCurrentUser(request, env);
const userId = user.id;
```

적용 대상:

```txt
POST   /api/equipments
GET    /api/equipments
GET    /api/equipments/:id
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs
DELETE /api/equipments/:id/logs
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts
DELETE /api/equipments/:id/parts
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments
```
