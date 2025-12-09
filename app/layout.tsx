import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";

import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import AppHeader from "@/components/app-header";
import reimburseLogo from "./reimburse-removebg-preview.png";

export const metadata: Metadata = {
  title: "Reimburse.ai",
  description:
    "This is a preview of using reasoning models with Auditor Receipts and Company Treasure.",
  icons: {
    icon: reimburseLogo.src,
    shortcut: reimburseLogo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThirdwebProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <body>
          <AppHeader />
          <Toaster position="top-center" />
          {children}
        </body>
      </html>
    </ThirdwebProvider>
  );
}
