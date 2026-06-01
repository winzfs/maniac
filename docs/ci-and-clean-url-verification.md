# CI 및 clean URL 점검 기록

이 문서는 최근 코드 점검에서 반영한 빌드 안정성, clean URL, SEO 정합성 변경 사항을 별도로 기록한다.

## 1. CI 구성

GitHub Actions 워크플로우를 추가했다.

```txt
.github/workflows/ci.yml
```

실행 단계:

```txt
npm install
npm run lint
npm run typecheck
npm run pages:build
```

트리거:

```txt
push to main
pull_request to main
```

주의:

```txt
현재 저장소에는 package-lock.json이 없으므로 npm ci가 아니라 npm install을 사용한다.
lockfile을 추가하면 CI install 단계는 npm ci로 전환하는 것이 좋다.
```

## 2. Next.js 타입 설정

`tsconfig.json`에 Next.js 권장 타입 설정을 반영했다.

```txt
compilerOptions.plugins = [{ name: "next" }]
include += ".next/types/**/*.ts"
```

목적:

```txt
Next build 중 자동 보정되던 tsconfig 설정을 저장소에 명시한다.
PageProps, App Router, static export 관련 타입 검증을 더 안정적으로 수행한다.
```

## 3. Clean URL redirect 상태

공개 게시글/장비 clean URL은 Pages Function을 통해 기존 static shell로 연결한다.

```txt
/posts/[id]/ → /explore/post/?id=[id]
/gears/[id]/ → /garage/view/?id=[id]
```

변경 사항:

```txt
기존 302 redirect를 301 redirect로 변경했다.
```

이유:

```txt
/posts/[id]/, /gears/[id]/를 공식 공유/검색/sitemap URL로 사용하므로 임시 redirect보다 영구 redirect가 적합하다.
```

## 4. SEO canonical / OG / JSON-LD 기준

공식 노출 URL은 아래 clean URL을 기준으로 한다.

```txt
게시글 canonical: /posts/[id]/
게시글 og:url: /posts/[id]/
게시글 DiscussionForumPosting url/mainEntityOfPage: /posts/[id]/
장비 canonical: /gears/[id]/
장비 og:url: /gears/[id]/
```

기존 query string URL은 static export 환경의 상세 shell 및 fallback 용도로 유지한다.

```txt
/explore/post/?id=[id]
/garage/view/?id=[id]
/garage/view/?slug=[slug]
```

## 5. 회귀 테스트 추가 항목

배포 후 아래 항목을 확인한다.

```txt
[ ] GitHub Actions CI가 push 또는 PR에서 실행된다.
[ ] CI에서 lint/typecheck/pages:build가 모두 통과한다.
[ ] /posts/[id]/ 접근 시 301로 /explore/post/?id=[id] shell에 연결된다.
[ ] /gears/[id]/ 접근 시 301로 /garage/view/?id=[id] shell에 연결된다.
[ ] 검색 결과 게시글 링크가 /posts/[id]/ 기준이다.
[ ] 검색 결과 장비 링크가 /gears/[id]/ 기준이다.
[ ] sitemap-posts.xml이 /posts/[id]/ 기준이다.
[ ] sitemap-gears.xml이 /gears/[id]/ 기준이다.
[ ] 게시글 상세 로딩 후 canonical이 /posts/[id]/ 기준으로 갱신된다.
[ ] 장비 상세 로딩 후 canonical이 /gears/[id]/ 기준으로 갱신된다.
```

## 6. 남은 검토 항목

```txt
package-lock.json 추가 후 npm ci 전환
Next.js 보안 업데이트
Cloudflare Pages 환경변수 APP_ENV=production 확인
정식 도메인 적용 시 SITE_ORIGIN / metadataBase / sitemap URL 일괄 변경
Pages Function HTML 메타 주입 또는 정적-safe 상세 라우팅 검토
```
