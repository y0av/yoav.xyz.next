import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { Suspense } from "react";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yoav - Full-stack Developer",
  description: "Full-stack lead developer with expertise in IoT, mobile applications, and gamification. 18+ years of professional experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoMono.variable} antialiased font-mono`}
      >
  <Suspense fallback={null}>
    <AnalyticsProvider />
  </Suspense>
  {children}
      </body>
    </html>
  );
}
