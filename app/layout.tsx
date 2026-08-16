import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://signalforge-impact-forge.taka0101ty.chatgpt.site",
  ),
  title: {
    default: "SignalForge",
    template: "%s | SignalForge",
  },
  description:
    "An AI-powered logical consistency engine for prediction markets.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SignalForge",
    title: "SignalForge",
    description:
      "AI understands the relationship. Mathematics verifies the probability.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SignalForge prediction-market consistency analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalForge",
    description:
      "AI understands the relationship. Mathematics verifies the probability.",
    images: ["/opengraph-image.png"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
