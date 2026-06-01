# Public Equipment URL Policy

GearDuck 공개 장비 상세 페이지 URL 기준을 정리한다.

## 현재 기준

신규 UI, 검색 결과, sitemap의 공개 장비 노출 URL은 장비 `id` 기반 clean URL을 우선 사용한다.

```txt
/gears/eq_xxx/
```

현재 clean URL은 Cloudflare Pages Function에서 기존 상세 shell로 연결한다.

```txt
/gears/eq_xxx/ → /garage/view/?id=eq_xxx
```

이 기준을 사용하는 이유는 장비 `slug`가 사용자별로만 unique이기 때문이다. 서로 다른 사용자가 같은 slug를 사용할 수 있으므로, 공개 공유 URL과 SEO 노출 URL은 전역 식별자인 장비 `id`를 사용한다.

## 기존 상세 shell

Next static export 구조상 실제 클라이언트 상세 화면은 아래 query string shell을 유지한다.

```txt
/garage/view/?id=eq_xxx
```

이 URL은 fallback 및 내부 상세 shell로 계속 사용한다. 다만 신규 UI, 검색 결과, sitemap에서는 `/gears/[id]/`를 우선 사용한다.

## 호환 URL

기존에 공유된 slug 기반 URL은 가능하면 계속 조회되도록 fallback으로 유지한다.

```txt
/garage/view/?slug=ninja-400
```

다만 slug 기반 URL은 충돌 가능성이 있으므로 신규 UI, API 응답의 `nextPath`, SEO sitemap, 회귀 테스트 기준으로 사용하지 않는다.

## API 기준

현재 공개 장비 API 경로는 기존 파일 구조 때문에 아래 형태를 유지한다.

```txt
/api/public/equipments/:identifier
```

`:identifier`는 우선 장비 `id`로 조회하고, 없으면 기존 slug fallback으로 조회한다.

## SEO 기준

```txt
/sitemap-gears.xml → /gears/[id]/ 기준
검색 결과 장비 링크 → /gears/[id]/ 기준
홈 인기 공개 장비 링크 → /gears/[id]/ 기준
```

현재 `/gears/[id]/`는 302 redirect로 동작한다. SEO 관점에서는 추후 301 redirect 또는 Pages Function HTML 메타 주입/정적-safe 라우팅 전환을 검토한다.

## 금지/보류 기준

아래 방식은 Next static export와 `/garage/` 내 차고 라우팅 충돌 위험 때문에 사용하지 않는다.

```txt
/garage/:slug/
/garage/[slug]/
functions/garage/_middleware.ts
```

구형 `/garage/:slug/` redirect는 현재 공식 지원 범위가 아니다. 필요해지면 `/garage/` 라우팅과 충돌하지 않는 별도 Pages Function 전략을 먼저 설계한다.

## 회귀 테스트 기준

- 새 장비 등록 후 기존 shell인 `/garage/view/?id=...`에서 상세가 표시된다.
- 홈 인기 공개 장비와 검색 결과 장비 링크는 `/gears/[id]/`를 사용한다.
- `/gears/[id]/` 접근 시 `/garage/view/?id=...` 상세 shell로 연결된다.
- 장비 수정 후 `/garage/view/?id=...` 상세 shell이 정상 표시된다.
- 내 차고의 `자랑 보기` 버튼은 기존 shell 또는 clean URL 정책에 맞게 동작한다.
- `/garage/view/?slug=...`는 기존 링크 호환용 fallback으로만 확인한다.
- `/garage/:slug/` redirect는 테스트 필수 항목이 아니다.
