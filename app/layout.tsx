import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AnonTracker from "@/components/AnonTracker";
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
  title: "AI4SMB Insights — Free AI Marketing for Small Business",
  description: "Free AI-powered marketing tools for small businesses. Generate campaigns and understand your customers — no experience needed.",
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
        <AnonTracker />
        {children}
      </body>
    </html>
  );
}
