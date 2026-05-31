# Regression Test Checklist

GEAR DUCK 배포 후 회귀 테스트 체크리스트다.

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

주의:

```txt
0014/0015 migration이 적용되지 않았더라도 /api/public/boards, /api/public/posts 호출 시 런타임 self-healing으로 기본 게시판/샘플 게시글이 일부 보정된다.
운영 정책상 런타임 seed는 추후 관리자 도구 또는 명시적 seed 명령으로 전환하는 것이 좋다.
```

---

## 1. 기본 페이지 접근 테스트

| 경로 | 기대 결과 |
| --- | --- |
| `/` | 홈이 정상 표시된다. |
| `/search/` | 통합 검색 화면이 표시된다. |
| `/explore/` | 게시판 카테고리/게시판 목록이 표시된다. |
| `/explore/motorcycle/` | 바이크 카테고리 게시글 목록과 글쓰기 버튼이 표시된다. |
| `/explore/motorcycle/write/` | 카테고리 단위 글쓰기 화면이 표시되고 세부 카테고리 선택이 가능하다. |
| `/explore/motorcycle/motorcycle-showcase/` | 해당 게시판 게시글 목록이 표시된다. |
| `/explore/motorcycle/motorcycle-showcase/write/` | 기존 직접 게시판 글쓰기 화면이 표시된다. |
| `/explore/post/?id=post_motorcycle_showcase_1` | 게시글 상세가 표시된다. |
| `/garage/` | 로그인하지 않았으면 로그인 안내가 표시되고, 로그인 후 내 차고 목록이 표시된다. |
| `/garage/new/` | 로그인하지 않았으면 로그인 안내가 표시되고, 로그인 후 장비 등록 폼이 표시된다. |
| `/garage/view/?id=...` | 공개 장비 페이지가 표시된다. |
| `/garage/view/?slug=...` | 기존 slug fallback 공개 장비 페이지가 표시된다. |

---

## 2. 홈 / 검색 / Explore 회귀 테스트

### 홈

- [ ] 홈 로고/사이드 메뉴 버튼이 모바일에서 잘리지 않는다.
- [ ] 메뉴 버튼은 오른쪽 기준으로 통일되어 있다.
- [ ] 홈 검색창 입력 후 `/search/?q=...`로 이동한다.
- [ ] 홈 콘텐츠 피드에 최근 게시글/댓글 많은 글/뉴스/공개 장비가 표시된다.
- [ ] 게시글 카드 클릭 시 `/explore/post/?id=...`로 이동한다.
- [ ] 목록 카드에서 `<p>`, `<strong>` 같은 HTML 태그가 그대로 노출되지 않는다.

### 통합 검색

- [ ] `/search/?q=키보드` 접근 시 검색 페이지가 404 없이 표시된다.
- [ ] 전체 탭에서 게시글/장비/뉴스 결과가 함께 표시된다.
- [ ] 게시글 결과는 입력 단어가 제목 또는 본문에 실제 포함된 경우만 표시된다.
- [ ] 관련 없는 같은 카테고리 글이 broad fallback으로 섞이지 않는다.
- [ ] 게시글 탭 `type=post`가 정상 동작한다.
- [ ] 뉴스 탭 `type=news`가 정상 동작한다.
- [ ] 뉴스 검색은 뉴스 제목 기준으로 동작한다.
- [ ] 장비 탭 `type=equipment`가 정상 동작한다.
- [ ] 한 글자 검색어도 요청 자체는 막히지 않는다.

### 게시판 목록 / 카테고리 홈

- [ ] `/explore/`에서 게시판 목록이 표시된다.
- [ ] `/explore/[category]/`에서 카테고리 홈이 표시된다.
- [ ] 카테고리 홈 상단에 글쓰기 버튼이 표시된다.
- [ ] 필터 탭은 `전체 / 자랑 / 리뷰 / 자유 / 질문 / 거래` 순서로 표시된다.
- [ ] `정비`, `부품` 필터 탭은 표시되지 않는다.
- [ ] 각 필터 선택 시 해당 세부 카테고리 글만 표시된다.
- [ ] 런타임 self-healing 이후 자유/리뷰 게시판도 표시된다.

### 게시글 목록

- [ ] `/explore/motorcycle/`에서 category 필터 게시글이 표시된다.
- [ ] `/explore/motorcycle/motorcycle-showcase/`에서 board 필터 게시글이 표시된다.
- [ ] `limit` query가 1~50 범위로 정상 제한된다.
- [ ] 댓글 수가 표시된다.
- [ ] seed 게시글이 없던 DB에서도 `/api/public/posts` 호출 후 샘플 글이 표시된다.

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

- [ ] `/explore/motorcycle/write/`에서 글쓰기 폼이 열린다.
- [ ] 글쓰기 화면에서 세부 카테고리 선택 셀렉트가 표시된다.
- [ ] 선택 가능 항목은 자랑, 리뷰, 자유, 질문, 거래다.
- [ ] 비로그인 상태로 저장하면 401 또는 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 제목 2자 미만이면 저장이 거부된다.
- [ ] 본문 5자 미만이면 저장이 거부된다.
- [ ] 제목 120자 초과 시 저장이 거부된다.
- [ ] 본문 200KB 초과 시 저장이 거부된다.
- [ ] 정상 저장 후 `/explore/post/?id=새글ID`로 이동한다.
- [ ] 저장된 글 상세에서 본문 HTML이 정상 렌더링된다.
- [ ] 위험 HTML/script가 그대로 실행되지 않는다.

### 게시글 상세

- [ ] breadcrumb는 `홈 > 바이크`처럼 홈과 메인 카테고리만 표시된다.
- [ ] `기어 둘러보기`, 세부 카테고리, `게시글` breadcrumb는 표시되지 않는다.
- [ ] 게시글 본문 카드 아래에 댓글 카드가 표시된다.
- [ ] 하단 검은색 게시판 배너는 표시되지 않는다.
- [ ] 하단 바로가기 박스/바로가기 텍스트는 표시되지 않는다.
- [ ] `바이크로 돌아가기`, `자전거로 돌아가기`처럼 카테고리별 돌아가기 버튼만 표시된다.

### 댓글

- [ ] 달린 댓글 목록이 댓글 입력폼보다 위에 표시된다.
- [ ] 댓글 입력폼은 댓글 목록 아래에 표시된다.
- [ ] 댓글 textarea는 compact 높이로 표시된다.
- [ ] 댓글 textarea 배경은 비활성처럼 회색이 아니라 흰색 계열로 보인다.
- [ ] 포커스 시 테두리/링이 선명하게 표시된다.
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
- [ ] 보기 버튼이 `/garage/view/?id=...` 또는 공개 fallback URL로 이동한다.
- [ ] 수정 버튼이 `/garage/edit/?id=...`로 이동한다.

### 장비 등록

- [ ] 비로그인 상태에서 `/garage/new/` 저장 시 401 또는 로그인 안내가 표시된다.
- [ ] 로그인 상태에서 `/garage/new/` 장비 등록이 가능하다.
- [ ] 한글 slug가 정상 저장된다.
- [ ] 등록 후 공개/상세 페이지로 이동한다.
- [ ] 공개 장비 페이지에서 기본 정보가 표시된다.

### 장비 수정/삭제

- [ ] `/garage/edit/?id=...`에서 기존 장비 정보가 로딩된다.
- [ ] 일부 필드만 수정해도 나머지 필드가 유지된다.
- [ ] 다른 사용자의 장비 수정/삭제는 거부된다.
- [ ] 삭제 시 soft delete 처리되고 목록에서 사라진다.

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

- [ ] public 장비 id는 `/api/public/equipments/:identifier`에서 조회된다.
- [ ] public 장비 slug fallback도 `/api/public/equipments/:identifier`에서 조회된다.
- [ ] private 장비 slug/id는 404를 반환한다.
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

### 게시글 본문 이미지

- [ ] 로그인 상태에서 게시글 본문 이미지를 업로드할 수 있다.
- [ ] 업로드 후 `image_assets`에 `purpose = post_image`로 저장된다.
- [ ] 게시글 본문에는 http/https 이미지 URL만 삽입된다.
- [ ] data:image URL은 sanitizer에서 차단된다.

---

## 10. 뉴스 캐시 테스트

- [ ] `npm run d1:migrate:news:remote` 또는 `npm run d1:migrate:all:remote` 후 `news_items` 테이블이 존재한다.
- [ ] `DEV_TOOLS_ENABLED=false` 또는 미설정이면 `/api/dev/sync-news`는 404를 반환한다.
- [ ] production에서 `DEV_TOOLS_SECRET` 없이 `/api/dev/sync-news` 접근 시 401을 반환한다.
- [ ] 올바른 secret으로 `/api/dev/sync-news` 실행 시 `news_items`에 뉴스가 저장된다.
- [ ] `GET /api/news`는 DB 캐시가 있으면 `source = db`를 반환한다.
- [ ] `news_items.hidden_at`이 설정된 뉴스는 목록과 검색 결과에 표시되지 않는다.

---

## 11. 배포 후 빠른 smoke test

```txt
/
/search/?q=키보드
/search/?q=Sony&type=post
/search/?q=Sony&type=news
/explore/motorcycle/
/explore/motorcycle/write/
/explore/post/?id=seed_review_audio_hd600
/garage/
/garage/view/?id=공개장비ID
/api/search?q=Sony
/api/public/boards
/api/public/posts?category=audio&limit=5
/api/news?limit=6&page=1
```

---

## 12. 실패 시 우선 확인

```txt
Cloudflare Pages 최신 main 커밋 배포 여부
D1 binding 이름이 DB인지 여부
wrangler.toml D1 database_id와 실제 운영 DB 일치 여부
IMAGE_STORAGE_PROVIDER=cloudinary 여부
Cloudinary API key/secret 권한
news_items 컬럼명이 published_at 기준인지 여부
/api/search warnings 응답 여부
/api/public/boards 호출 시 review/free 게시판이 보정되는지 여부
/api/public/posts 호출 시 seed 글이 생성되는지 여부
```
