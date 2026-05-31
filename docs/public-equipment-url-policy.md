# Public Equipment URL Policy

GearDuck 공개 장비 상세 페이지 URL 기준을 정리한다.

## 현재 기준

공개 장비 상세 페이지의 canonical URL은 장비 `id`를 기준으로 한다.

```txt
/garage/view/?id=eq_xxx
```

이 기준을 사용하는 이유는 장비 `slug`가 사용자별로만 unique이기 때문이다. 서로 다른 사용자가 같은 slug를 사용할 수 있으므로, 공개 공유 URL과 SEO canonical URL은 전역 식별자인 장비 `id`를 사용한다.

## 호환 URL

기존에 공유된 slug 기반 URL은 가능하면 계속 조회되도록 fallback으로 유지한다.

```txt
/garage/view/?slug=ninja-400
```

다만 slug 기반 URL은 충돌 가능성이 있으므로 신규 UI, API 응답의 `nextPath`, SEO canonical, 회귀 테스트 기준으로 사용하지 않는다.

## API 기준

현재 공개 장비 API 경로는 기존 파일 구조 때문에 아래 형태를 유지한다.

```txt
/api/public/equipments/:identifier
```

`:identifier`는 우선 장비 `id`로 조회하고, 없으면 기존 slug fallback으로 조회한다.

## 금지/보류 기준

아래 방식은 Next static export와 `/garage/` 내 차고 라우팅 충돌 위험 때문에 사용하지 않는다.

```txt
/garage/:slug/
/garage/[slug]/
functions/garage/_middleware.ts
```

구형 `/garage/:slug/` redirect는 현재 공식 지원 범위가 아니다. 필요해지면 `/garage/` 라우팅과 충돌하지 않는 별도 Pages Function 전략을 먼저 설계한다.

## 회귀 테스트 기준

- 새 장비 등록 후 `/garage/view/?id=...`로 이동한다.
- 장비 수정 후 `/garage/view/?id=...`로 이동한다.
- 내 차고의 `자랑 보기` 버튼은 `/garage/view/?id=...`를 사용한다.
- `/garage/view/?slug=...`는 기존 링크 호환용 fallback으로만 확인한다.
- `/garage/:slug/` redirect는 테스트 필수 항목이 아니다.
