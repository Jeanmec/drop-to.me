import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import LoadingGate from "@/components/Loading/LoadingGate";
import HatchPatterns from "@/components/Scene/HatchPatterns";
import TabNotice from "@/components/TabNotice";
import ToastShelf from "@/components/Toast/ToastShelf";

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <>
      <TabNotice />
      <HatchPatterns />
      <LoadingGate>
        {children}
        <Footer hasTermsLink />
      </LoadingGate>
      <ToastShelf />
    </>
  );
}
