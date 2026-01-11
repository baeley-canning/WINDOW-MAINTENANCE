import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PopupWidget }  from "@/components/PopupWidget";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Window Maintenance — Aluminium Window & Sliding Door Repairs",
  description: "Sliding door rollers & tracks, awning stays & hinges, handles, locks, wedges and seals across Wellington.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) for preview build */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-69S1NYW3V6"></script>
        <script dangerouslySetInnerHTML={{__html:`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
          gtag('config','G-69S1NYW3V6'); gtag('config','AW-16889477810');
        `}} />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <Navbar />
          <div>{children}</div>
          <Footer />
          <PopupWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
