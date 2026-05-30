# Regression Test Checklist

Maniac Garage 배포 후 회귀 테스트 체크리스트다.

이 문서는 Cloudflare Pages + Pages Functions + D1 기반 현재 MVP 기준으로 작성한다.

---

## 0. 테스트 전 준비

### 환경 확인

```txt
Cloudflare Pages 배포 성공 여부 확인
D1 binding 이름이 DB인지 확인
wrangler.toml의 database_name / database_id 확인
APP_ENV 값 확인
IMAGE_STORAGE_PROVIDER 및 Cloudinary 환경변수 확인
DEV_TOOLS_ENABLED / DEV_TOOLS_SECRET 설정 확인
```

### D1 migration 확인

새 D1 데이터베이스라면 아래 순서로 migration을 적용한다.

```bash
npm run d1:migrate:all:remote
npm run d1:tables:remote
```

핵심 테이블 확인:

```txt
users
auth_sessions
equipments
maintenance_logs
parts
boards
posts
comments
image_assets
news_items
```

### 운영 환경 주의

운영 환경에서는 실제 회원가입/로그인 후 `maniac_session` HttpOnly 쿠키 기반으로 쓰기 API를 테스트한다.

로그인하지 않은 상태에서 보호된 쓰기 API를 호출하면 401을 반환해야 한다.

---

## 1. 기본 페이지 접근 테스트

| 경로 | 기대 결과 |
| --- | --- |
| `/` | 홈이 정상 표시된다. |
| `/explore/` | 게시판 카테고리/게시판 목록이 표시된다. |
| `/explore/motorcycle/` | 오토바이 카테고리 게시글 목록이 표시된다. |
| `/explore/motorcycle/motorcycle-showcase/` | 해당 게시판 게시글 목록이 표시된다. |
| `/explore/motorcycle/motorcycle-showcase/write/` | 글쓰기 화면이 표시된다. |
| `/explore/post/?id=post_motorcycle_showcase_1` | 게시글 상세가 표시된다. |
| `/garage/` | 로그인하지 않았으면 로그인 안내가 표시되고, 로그인 후 내 차고 목록이 표시된다. |
| `/garage/new/` | 로그인하지 않았으면 로그인 안내가 표시되고, 로그인 후 장비 등록 폼이 표시된다. |
| `/garage/view/?slug=...` | 공개 장비 페이지가 표시된다. |

---

## 2. 홈 / Explore 회귀 테스트

### 홈 게시글 스크롤러

- [ ] 홈에서 카테고리별 게시글 스크롤러가 표시된다.
- [ ] 게시글 카드 클릭 시 `/explore/post/?id=...`로 이동한다.
- [ ] 상세 페이지에서 게시글 본문이 정상 표시된다.
- [ ] 목록 카드에서 `<p>`, `<strong>` 같은 HTML 태그가 그대로 노출되지 않는다.

### 게시판 목록

- [ ] `/explore/`에서 게시판 목록이 표시된다.
- [ ] 게시판별 post count가 표시된다.
- [ ] 카테고리/게시판 정렬이 자연스럽다.

### 게시글 목록

- [ ] `/explore/motorcycle/`에서 category 필터 게시글이 표시된다.
- [ ] `/explore/motorcycle/motorcycle-showcase/`에서 board 필터 게시글이 표시된다.
- [ ] `limit` query가 1~50 범위로 정상 제한된다.
- [ ] 댓글 수가 표시된다.

### 구형 게시글 URL redirect

- [ ] `/explore/:category/:board/:post` 접근 시 `/explore/post/?id=:post`로 redirect된다.
- [ ] redirect 후 Cloudflare Error 1101이 발생하지 않는다.

---

## 3. 인증 / 세션 테스트

### 회원가입 / 로그인 / 로그아웃

- [ ] `/signup/`에서 이메일/비밀번호 회원가입이 가능하다.
- [ ] 회원가입 성공 후 로그인 상태가 된다.
- [ ] `/login/`에서 기존 계정으로 로그인이 가능하다.
- [ ] 로그인 후 `/api/auth/me`가 현재 사용자 정보를 반환한다.
- [ ] 로그아웃 후 `/api/auth/me`가 비로그인 상태를 반환한다.
- [ ] 세션 쿠키는 HttpOnly로 설정되어 브라우저 JavaScript에서 직접 읽을 수 없다.
- [ ] production 환경에서는 세션 쿠키에 Secure가 붙는다.

### 보호 API 인증

- [ ] 로그인하지 않은 상태에서 `GET /api/equipments`는 401을 반환한다.
- [ ] 로그인하지 않은 상태에서 `POST /api/equipments`는 401을 반환한다.
- [ ] 로그인하지 않은 상태에서 `POST /api/posts`는 401을 반환한다.
- [ ] 로그인한 상태에서는 본인 데이터 기준으로 장비/게시글/댓글 작성이 가능하다.

---

## 4. 게시글 작성 / 상세 / 댓글 테스트

### 게시글 작성

- [ ] `/explore/motorcycle/motorcycle-showcase/write/`에서 글쓰기 폼이 열린다.
- [ ] 비로그인 상태로 저장하면 401 또는 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 제목 2자 미만이면 저장이 거부된다.
- [ ] 본문 5자 미만이면 저장이 거부된다.
- [ ] 제목 120자 초과 시 저장이 거부된다.
- [ ] 본문 200KB 초과 시 저장이 거부된다.
- [ ] 정상 저장 후 `/explore/post/?id=새글ID`로 이동한다.
- [ ] 저장된 글 상세에서 본문 HTML이 정상 렌더링된다.
- [ ] 위험 HTML/script가 그대로 실행되지 않는다.

### 댓글

- [ ] 비로그인 상태로 댓글 작성 시 401 또는 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 댓글 2자 미만이면 저장이 거부된다.
- [ ] 댓글 1000자 초과 시 저장이 거부된다.
- [ ] 댓글 작성 후 목록에 즉시 반영된다.
- [ ] 본인이 작성한 댓글 삭제가 가능하다.
- [ ] 다른 사용자가 작성한 댓글 삭제는 거부된다.
- [ ] 삭제 후 댓글 목록에서 사라진다.

---

## 5. 장비 관리 테스트

### 장비 목록

- [ ] 비로그인 상태에서 `/garage/` 접근 시 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 `/garage/`에 내 장비 목록이 표시된다.
- [ ] 장비 카드에 정비 기록 개수, 최근 정비일, 총 정비 비용이 표시된다.
- [ ] 보기 버튼이 `/garage/view/?slug=...`로 이동한다.
- [ ] 수정 버튼이 `/garage/edit/?id=...`로 이동한다.

### 장비 등록

- [ ] 비로그인 상태에서 `/garage/new/` 저장 시 401 또는 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 `/garage/new/` 장비 등록이 가능하다.
- [ ] 한글 slug가 정상 저장된다.
- [ ] 등록 후 `/garage/view/?slug=...`로 이동한다.
- [ ] 공개 장비 페이지에서 기본 정보가 표시된다.

### 장비 수정/삭제

- [ ] `/garage/edit/?id=...`에서 기존 장비 정보가 로딩된다.
- [ ] 일부 필드만 수정해도 나머지 필드가 유지된다.
- [ ] 다른 사용자의 장비 수정/삭제는 거부된다.
- [ ] 삭제 시 soft delete 처리되고 목록에서 사라진다.

### 기존 공개 링크 redirect

- [ ] `/garage/:slug/` 접근 시 `/garage/view/?slug=:slug`로 redirect된다.
- [ ] 한글 slug도 정상 redirect된다.

---

## 6. 정비 기록 테스트

- [ ] 정비 기록 목록이 표시된다.
- [ ] 정비 기록 추가가 가능하다.
- [ ] 정비 기록 수정 시 보낸 필드만 변경된다.
- [ ] `description`, `usageMetricValue`, `cost`, `shopName` 미전송 시 기존 값이 유지된다.
- [ ] 다른 사용자의 장비에 정비 기록을 추가/수정/삭제할 수 없다.
- [ ] 정비 기록 삭제 시 목록에서 사라진다.
- [ ] 공개 장비 페이지에는 `visibility = public`인 정비 기록만 표시된다.

---

## 7. 부품 기록 테스트

- [ ] 부품 목록이 표시된다.
- [ ] 부품 추가가 가능하다.
- [ ] 부품 수정 시 보낸 필드만 변경된다.
- [ ] `brand`, `price`, `installedAt`, `purchaseUrl`, `imageUrl`, `memo` 미전송 시 기존 값이 유지된다.
- [ ] 다른 사용자의 장비에 부품을 추가/수정/삭제할 수 없다.
- [ ] 부품 삭제 시 목록에서 사라진다.
- [ ] 공개 장비 페이지에는 `visibility = public`인 부품만 표시된다.

---

## 8. 공개 API 보안 테스트

### 공개 장비 API

- [ ] public 장비 slug는 `/api/public/equipments/:slug`에서 조회된다.
- [ ] private 장비 slug는 404를 반환한다.
- [ ] moderation_status가 normal이 아닌 장비는 404를 반환한다.
- [ ] 정비/부품은 visibility가 public인 항목만 응답된다.

### 공개 게시글 API

- [ ] published/public/normal 게시글만 조회된다.
- [ ] deleted_at이 있는 게시글은 조회되지 않는다.
- [ ] 비활성 board의 게시글은 조회되지 않는다.
- [ ] 댓글 목록에는 published/normal 댓글만 포함된다.

---

## 9. 이미지 업로드 테스트

### 프로필 이미지

- [ ] 로그인 상태에서 프로필 이미지를 업로드할 수 있다.
- [ ] jpg, png, webp, gif 외 파일은 거부된다.
- [ ] 5MB 초과 이미지는 거부된다.
- [ ] 업로드 후 `image_assets`에 `purpose = profile_image`로 저장된다.
- [ ] 업로드 후 `users.profile_image_url`과 `users.profile_image_asset_id`가 갱신된다.

### 장비 대표 이미지

- [ ] 로그인 상태에서 장비 대표 이미지를 업로드할 수 있다.
- [ ] 업로드 후 `image_assets`에 `purpose = equipment_main_image`로 저장된다.
- [ ] 장비 등록/수정 저장 시 `mainImageUrl`이 장비에 반영된다.

---

## 10. 뉴스 캐시 테스트

- [ ] `npm run d1:migrate:news:remote` 또는 `npm run d1:migrate:all:remote` 후 `news_items` 테이블이 존재한다.
- [ ] `DEV_TOOLS_ENABLED=false` 또는 미설정이면 `/api/dev/sync-news`는 404를 반환한다.
- [ ] production에서 `DEV_TOOLS_SECRET` 없이 `/api/dev/sync-news` 접근 시 401을 반환한다.
- [ ] 올바른 secret으로 `/api/dev/sync-news` 실행 시 `news_items`에 뉴스가 저장된다.
- [ ] `GET /api/news`는 DB 캐시가 있으면 `source = db`를 반환한다.
- [ ] `news_items`가 비어 있거나 migration이 누락된 경우 `GET /api/news`는 RSS fallback으로 동작한다.

---

## 11. D1 / migration 테스트

새 D1 DB 기준:

- [ ] `npm run d1:migrate:all:remote`가 순서대로 성공한다.
- [ ] `npm run d1:tables:remote`로 핵심 테이블이 확인된다.
- [ ] `users`, `auth_sessions`, `equipments`, `maintenance_logs`, `parts`, `boards`, `posts`, `comments`, `image_assets`, `news_items`가 존재한다.
- [ ] `dev_user_maniac`가 users 테이블에 존재한다.
- [ ] boards seed data가 존재한다.
- [ ] 선택 seed를 적용한 경우 샘플 장비/게시글이 조회된다.

기존 D1 DB 기준:

- [ ] 0001 재적용 시 `CREATE TABLE IF NOT EXISTS`, `INSERT OR IGNORE`로 인해 치명적 충돌이 없다.
- [ ] 0002~0009 중복 적용은 상황에 따라 ALTER 중복 오류가 날 수 있으므로 migration 이력 관리 필요성을 기록한다.

---

## 12. 회귀 테스트 결과 기록 양식

```txt
테스트 일시:
배포 URL:
브랜치/커밋:
APP_ENV:
D1 database_name:
테스트 담당:

통과:
실패:
보류:

발견 이슈:
1.
2.
3.

다음 조치:
1.
2.
3.
```
