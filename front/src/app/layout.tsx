import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";

import { SocketProvider } from "@/contexts/SocketProvider";
import { PeerProvider } from "@/contexts/PeerProvider";
import { ConnectionProvider } from "@/contexts/ConnectionProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import Footer from "@/components/Footer";
import { StrictMode } from "react";

export const metadata: Metadata = {
  title: "Drop to me | Peer to peer transfer",
  description:
    "Send files online via secure peer to peer transfer. Free, unlimited size, no logs.",
  keywords:
    "peer to peer, file transfer, secure sharing, fast transfer, free, unlimited",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StrictMode>
      <html
        lang="en"
        className={`${inter.variable} ${poppins.variable} ${plusJakartaSans.variable}`}
      >
        <body>
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
