import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = "https://maniac-garage.pages.dev";
const siteTitle = "Maniac Garage | 장비 기록과 정비 이야기가 모이는 커뮤니티";
const siteDescription = "오토바이, 기계식 키보드, 커스텀 PC, 카메라, 캠핑 장비까지. 내 장비를 기록하고 다른 마니아들의 세팅과 정비 이야기를 둘러보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Maniac Garage",
  },
  description: siteDescription,
  applicationName: "Maniac Garage",
  keywords: [
    "장비 기록",
    "정비 기록",
    "오토바이 정비",
    "기계식 키보드",
    "커스텀 PC",
    "장비 커뮤니티",
    "튜닝 기록",
    "부품 기록",
  ],
  authors: [{ name: "Maniac Garage" }],
  creator: "Maniac Garage",
  publisher: "Maniac Garage",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Maniac Garage",
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
  return <html lang="ko"><body>{children}</body></html>;
}
