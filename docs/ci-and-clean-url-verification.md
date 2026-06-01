# CI 및 clean URL 점검 기록

이 문서는 최근 코드 점검에서 반영한 빌드 안정성, 보안 감사, clean URL, SEO 정합성 변경 사항을 별도로 기록한다.

## 1. CI 구성

GitHub Actions 워크플로우를 추가했다.

```txt
.github/workflows/ci.yml
```

실행 단계:

```txt
npm install
npm run security:audit
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
GitHub Actions가 저장소에서 비활성화되어 있으면 workflow 파일이 있어도 run이 생성되지 않는다.
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

## 3. Next.js 보안 패치 업데이트

Next.js와 eslint-config-next를 같은 15.3 패치 라인에서 업데이트했다.

```txt
next: 15.3.2 → 15.3.9
eslint-config-next: 15.3.2 → 15.3.9
```

의도:

```txt
React 19 / Next 15 조합과 Cloudflare Pages static export 구조를 유지하면서, 메이저 업그레이드 리스크 없이 15.3 라인의 보안·버그 수정 패치를 반영한다.
Next 16 메이저 업그레이드는 별도 브랜치에서 빌드/라우팅/Cloudflare 호환성을 확인한 뒤 진행한다.
```

## 4. 보안 감사

`package.json`에 보안 감사 스크립트를 추가했다.

```txt
npm run security:audit
```

실제 명령:

```txt
npm audit --audit-level=high
```

정책:

```txt
high 이상 취약점이 남아 있으면 CI가 실패하도록 한다.
moderate 이하 취약점은 별도 판단으로 처리하되, 배포 전 npm audit 결과를 확인한다.
```

## 5. Lockfile 생성 절차

현재 저장소에는 `package-lock.json`이 없다. 설치 해상도 고정을 위해 로컬에서 아래 절차로 lockfile을 추가하는 것을 권장한다.

```bash
npm install
git add package-lock.json
git commit -m "chore: add npm lockfile"
```

lockfile 추가 후 CI를 아래처럼 바꾸는 것이 좋다.

```txt
Install dependencies: npm ci
```

주의:

```txt
package-lock.json은 실제 npm install 결과물이어야 하므로 수동 작성하지 않는다.
lockfile 추가 직후 npm run security:audit, npm run lint, npm run typecheck, npm run pages:build를 모두 확인한다.
```

## 6. Clean URL redirect 상태

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

## 7. SEO canonical / OG / JSON-LD 기준

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

## 8. 운영 환경변수 체크

Cloudflare Pages 운영 환경에서 아래 값을 확인한다.

```txt
APP_ENV=production
IMAGE_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
DEV_TOOLS_ENABLED
DEV_TOOLS_SECRET
```

특히 `APP_ENV=production`은 세션 쿠키의 Secure 속성에 영향을 준다.

## 9. 회귀 테스트 추가 항목

배포 후 아래 항목을 확인한다.

```txt
[ ] GitHub Actions CI가 push 또는 PR에서 실행된다.
[ ] CI에서 security:audit/lint/typecheck/pages:build가 모두 통과한다.
[ ] npm audit --audit-level=high가 통과한다.
[ ] /posts/[id]/ 접근 시 301로 /explore/post/?id=[id] shell에 연결된다.
[ ] /gears/[id]/ 접근 시 301로 /garage/view/?id=[id] shell에 연결된다.
[ ] 검색 결과 게시글 링크가 /posts/[id]/ 기준이다.
[ ] 검색 결과 장비 링크가 /gears/[id]/ 기준이다.
[ ] sitemap-posts.xml이 /posts/[id]/ 기준이다.
[ ] sitemap-gears.xml이 /gears/[id]/ 기준이다.
[ ] 게시글 상세 로딩 후 canonical이 /posts/[id]/ 기준으로 갱신된다.
[ ] 장비 상세 로딩 후 canonical이 /gears/[id]/ 기준으로 갱신된다.
[ ] 운영 배포에서 세션 쿠키에 Secure 속성이 붙는다.
```

## 10. 남은 검토 항목

```txt
package-lock.json 추가 후 npm ci 전환
GitHub Actions 활성화 여부 확인
Next 16 메이저 업그레이드 별도 검증
Cloudflare Pages 환경변수 APP_ENV=production 확인
정식 도메인 적용 시 SITE_ORIGIN / metadataBase / sitemap URL 일괄 변경
Pages Function HTML 메타 주입 또는 정적-safe 상세 라우팅 검토
```
