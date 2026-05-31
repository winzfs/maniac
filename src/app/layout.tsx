import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/shared/components/navigation/SiteFooter";

const siteUrl = "https://maniac-c7d.pages.dev";
const siteTitle = "GEAR DUCK | 장비 덕후들의 커뮤니티";
const siteDescription = "장비 덕후들의 커뮤니티 GEAR DUCK. 오토바이, 기계식 키보드, 커스텀 PC, 카메라, 캠핑 장비까지 내 장비의 세팅, 정비, 부품 기록을 남기고 다른 장비 덕후들과 이야기를 나눠보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | GEAR DUCK",
  },
  description: siteDescription,
  applicationName: "GEAR DUCK",
  keywords: [
    "GEAR DUCK",
    "GearDuck",
    "기어덕",
    "장비 덕후",
    "장비덕후",
    "장비 커뮤니티",
    "장비 기록",
    "정비 기록",
    "오토바이 정비",
    "기계식 키보드",
    "커스텀 PC",
    "튜닝 기록",
    "부품 기록",
  ],
  authors: [{ name: "GEAR DUCK" }],
  creator: "GEAR DUCK",
  publisher: "GEAR DUCK",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "GEAR DUCK",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko"><body>{children}<SiteFooter /></body></html>;
}
