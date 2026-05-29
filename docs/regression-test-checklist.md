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
equipments
maintenance_logs
parts
boards
posts
comments
```

### 운영 환경 주의

`APP_ENV=production`이면 mock user 기반 쓰기 API는 401로 차단된다.

운영에서 글쓰기/장비 작성까지 테스트하려면 실제 로그인/세션 구현 후 진행해야 한다. 현재 mock user 쓰기 테스트는 production이 아닌 환경에서 진행한다.

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
| `/garage/` | 내 차고 목록이 표시된다. |
| `/garage/new/` | 장비 등록 폼이 표시된다. |
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

## 3. 게시글 작성 / 상세 / 댓글 테스트

### 게시글 작성

- [ ] `/explore/motorcycle/motorcycle-showcase/write/`에서 글쓰기 폼이 열린다.
- [ ] 제목 2자 미만이면 저장이 거부된다.
- [ ] 본문 5자 미만이면 저장이 거부된다.
- [ ] 제목 120자 초과 시 저장이 거부된다.
- [ ] 본문 200KB 초과 시 저장이 거부된다.
- [ ] 정상 저장 후 `/explore/post/?id=새글ID`로 이동한다.
- [ ] 저장된 글 상세에서 본문 HTML이 정상 렌더링된다.
- [ ] 위험 HTML/script가 그대로 실행되지 않는다.

### 댓글

- [ ] 댓글 2자 미만이면 저장이 거부된다.
- [ ] 댓글 1000자 초과 시 저장이 거부된다.
- [ ] 댓글 작성 후 목록에 즉시 반영된다.
- [ ] 본인이 작성한 mock 댓글 삭제가 가능하다.
- [ ] 삭제 후 댓글 목록에서 사라진다.

---

## 4. 장비 관리 테스트

### 장비 목록

- [ ] `/garage/`에서 장비 목록이 표시된다.
- [ ] 장비 카드에 정비 기록 개수, 최근 정비일, 총 정비 비용이 표시된다.
- [ ] 보기 버튼이 `/garage/view/?slug=...`로 이동한다.
- [ ] 수정 버튼이 `/garage/edit/?id=...`로 이동한다.

### 장비 등록

- [ ] `/garage/new/`에서 장비 등록이 가능하다.
- [ ] 한글 slug가 정상 저장된다.
- [ ] 등록 후 `/garage/view/?slug=...`로 이동한다.
- [ ] 공개 장비 페이지에서 기본 정보가 표시된다.

### 장비 수정/삭제

- [ ] `/garage/edit/?id=...`에서 기존 장비 정보가 로딩된다.
- [ ] 일부 필드만 수정해도 나머지 필드가 유지된다.
- [ ] 삭제 시 soft delete 처리되고 목록에서 사라진다.

### 기존 공개 링크 redirect

- [ ] `/garage/:slug/` 접근 시 `/garage/view/?slug=:slug`로 redirect된다.
- [ ] 한글 slug도 정상 redirect된다.

---

## 5. 정비 기록 테스트

- [ ] 정비 기록 목록이 표시된다.
- [ ] 정비 기록 추가가 가능하다.
- [ ] 정비 기록 수정 시 보낸 필드만 변경된다.
- [ ] `description`, `usageMetricValue`, `cost`, `shopName` 미전송 시 기존 값이 유지된다.
- [ ] 정비 기록 삭제 시 목록에서 사라진다.
- [ ] 공개 장비 페이지에는 `visibility = public`인 정비 기록만 표시된다.

---

## 6. 부품 기록 테스트

- [ ] 부품 목록이 표시된다.
- [ ] 부품 추가가 가능하다.
- [ ] 부품 수정 시 보낸 필드만 변경된다.
- [ ] `brand`, `price`, `installedAt`, `purchaseUrl`, `imageUrl`, `memo` 미전송 시 기존 값이 유지된다.
- [ ] 부품 삭제 시 목록에서 사라진다.
- [ ] 공개 장비 페이지에는 `visibility = public`인 부품만 표시된다.

---

## 7. 공개 API 보안 테스트

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

## 8. 운영 환경 mock write guard 테스트

`APP_ENV=production` 설정 상태에서 확인한다.

아래 API는 401을 반환해야 한다.

```txt
POST   /api/equipments
PATCH  /api/equipments/:id
DELETE /api/equipments/:id
POST   /api/equipments/:id/logs
PATCH  /api/equipments/:id/logs?logId=...
DELETE /api/equipments/:id/logs?logId=...
POST   /api/equipments/:id/parts
PATCH  /api/equipments/:id/parts?partId=...
DELETE /api/equipments/:id/parts?partId=...
POST   /api/posts
POST   /api/public/posts/:id/comments
DELETE /api/public/posts/:id/comments?commentId=...
```

기대 응답:

```txt
401
Login is required in production.
```

---

## 9. D1 / migration 테스트

새 D1 DB 기준:

- [ ] `npm run d1:migrate:all:remote`가 순서대로 성공한다.
- [ ] `npm run d1:tables:remote`로 핵심 테이블이 확인된다.
- [ ] `dev_user_maniac`가 users 테이블에 존재한다.
- [ ] boards seed data가 존재한다.
- [ ] 초기 seed post가 조회된다.

기존 D1 DB 기준:

- [ ] 0001 재적용 시 `CREATE TABLE IF NOT EXISTS`, `INSERT OR IGNORE`로 인해 치명적 충돌이 없다.
- [ ] 0002~0004 중복 적용은 상황에 따라 ALTER 중복 오류가 날 수 있으므로 migration 이력 관리 필요성을 기록한다.

---

## 10. 회귀 테스트 결과 기록 양식

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
