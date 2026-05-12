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

export const metadata: Metadata = {
  title: "Indentured Ship Records, 1860–1911",
  description:
    "Search the Gandhi-Luthuli Documentation Centre's records of 152,240 indentured passengers who arrived at Port Natal between 1860 and 1911.",
  icons: {
    icon: "https://fav.farm/%F0%9F%9A%A2",
  },
  openGraph: {
    title: "Indentured Ship Records, 1860–1911",
    description:
      "Search the records of 152,240 indentured passengers who arrived at Port Natal between 1860 and 1911.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indentured Ship Records, 1860–1911",
    description:
      "Search the records of 152,240 indentured passengers who arrived at Port Natal between 1860 and 1911.",
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
