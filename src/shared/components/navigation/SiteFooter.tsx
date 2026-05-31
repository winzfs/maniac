import Link from "next/link";

const serviceLinks = [
  { href: "/about/", label: "서비스 소개" },
  { href: "/explore/", label: "기어 둘러보기" },
  { href: "/explore/news/", label: "장비 뉴스" },
  { href: "/garage/", label: "내 차고" },
];

const policyLinks = [
  { href: "/terms/", label: "이용약관" },
  { href: "/privacy/", label: "개인정보처리방침" },
  { href: "/contact/", label: "문의하기" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/80">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-text-primary">
            <span className="grid size-9 place-items-center rounded-2xl bg-graphite text-base text-white">G</span>
            GEAR DUCK
          </Link>
          <p className="max-w-xl text-sm leading-6 text-text-secondary">
            장비 덕후들의 커뮤니티 GEAR DUCK. 오토바이, PC, 키보드, 카메라, 캠핑 장비까지 내 기어의 세팅과 정비 기록을 남기고 다른 사람들의 장비 이야기를 둘러보세요.
          </p>
          <p className="text-xs text-text-secondary">© {new Date().getFullYear()} GEAR DUCK. All rights reserved.</p>
        </div>

        <nav className="space-y-3" aria-label="서비스 링크">
          <h2 className="text-sm font-black text-text-primary">서비스</h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            {serviceLinks.map((link) => (
              <li key={link.href}><Link href={link.href} className="hover:text-text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav className="space-y-3" aria-label="정책 및 문의 링크">
          <h2 className="text-sm font-black text-text-primary">정책 및 문의</h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            {policyLinks.map((link) => (
              <li key={link.href}><Link href={link.href} className="hover:text-text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
