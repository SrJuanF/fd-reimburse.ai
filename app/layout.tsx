import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";

import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import AppHeader from "@/components/app-header";

export const metadata: Metadata = {
  title: "Reimburse.ai",
  description:
    "This is a preview of using reasoning models with Next.js and the AI SDK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThirdwebProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <body>
          <AppHeader />
          <Toaster position="top-center" />
          {children}
        </body>
      </html>
    </ThirdwebProvider>
  );
}
