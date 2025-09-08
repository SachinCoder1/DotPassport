import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DotPassport",
  description: "Your passport to the digital world.",
  keywords: ["passport", "digital", "authentication"],
  // favicon
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",

  },
  // url images
  openGraph: {
    title: "DotPassport",
    description: "Your passport to the digital world.",
    url: "https://dotpassport.io",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "DotPassport - Your passport to the digital world.",
      },
    ],
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
        <Toaster />
        <Navbar />
        <div className="mb-16"></div>
        {children}
      </body>

      {/* Google tag (gtag.js) */}
      <Script strategy="afterInteractive" async src="https://www.googletagmanager.com/gtag/js?id=G-CYLNXVBVP3"></Script>
      <Script strategy="afterInteractive" id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-CYLNXVBVP3');
        `}
      </Script>
    </html>
  );
}
