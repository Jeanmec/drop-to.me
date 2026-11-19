import "@/styles/globals.css";

import clsx from "clsx";
import type { Metadata } from "next";
import { DM_Mono, Fraunces } from "next/font/google";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description:
    "Transfer files via secure, encrypted transfer. Free, unlimited size, no logs.",
  keywords:
    "encrypted transfer, file transfer, secure sharing, fast transfer, free, unlimited",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={clsx(fraunces.variable, dmMono.variable)}>
      <body>{children}</body>
    </html>
  );
}
