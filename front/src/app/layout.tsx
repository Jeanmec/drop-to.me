import "@/styles/globals.css";

import { type Metadata } from "next";
import { DM_Mono, Fraunces } from "next/font/google";

import { SocketProvider } from "@/contexts/SocketProvider";
import { PeerProvider } from "@/contexts/PeerProvider";
import { ConnectionProvider } from "@/contexts/ConnectionProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import Footer from "@/components/Footer";
import HatchPatterns from "@/components/Scene/HatchPatterns";
import { StrictMode } from "react";

export const metadata: Metadata = {
  title: "Drop to me | Peer to peer transfer",
  description:
    "Send files online via secure peer to peer transfer. Free, unlimited size, no logs.",
  keywords:
    "peer to peer, file transfer, secure sharing, fast transfer, free, unlimited",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StrictMode>
      <html lang="en" className={`${fraunces.variable} ${dmMono.variable}`}>
        <body>
          <HatchPatterns />
          <ToastProvider>
            <PeerProvider>
              <SocketProvider>
                <ConnectionProvider>
                  {children}
                  <Footer />
                </ConnectionProvider>
              </SocketProvider>
            </PeerProvider>
          </ToastProvider>
        </body>
      </html>
    </StrictMode>
  );
}
