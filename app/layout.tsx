import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "./Footer";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://1860.ratulmaharaj.com";
const SITE_TITLE = "Indentured Ship Records, 1860–1911";
const SITE_DESCRIPTION =
  "Search the records of 152,240 indentured passengers who arrived at Port Natal between 1860 and 1911, sourced from the Gandhi-Luthuli Documentation Centre at UKZN.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: "1860 Indentured Ship Records",
  authors: [{ name: "Ratul Maharaj", url: "https://ratulmaharaj.com" }],
  creator: "Ratul Maharaj",
  keywords: [
    "indentured labour",
    "indentured immigrants",
    "Natal",
    "South Africa",
    "India",
    "1860",
    "1911",
    "Port Natal",
    "Durban",
    "Gandhi-Luthuli Documentation Centre",
    "UKZN",
    "passenger records",
    "ship records",
    "genealogy",
    "Indian diaspora",
  ],
  icons: {
    icon: "https://fav.farm/%F0%9F%9A%A2",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-serif">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
