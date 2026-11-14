import type { Metadata } from "next";
import Footer from "@/components/Footer";
import HatchPatterns from "@/components/Scene/HatchPatterns";
import TermsHeader from "@/components/Terms/TermsHeader";
import TermsOfUse from "@/components/Terms/TermsOfUse";

export const metadata: Metadata = {
  title: "Terms of use | Drop to me",
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export default function TermsPage() {
  return (
    <>
      <HatchPatterns />
      <TermsHeader />
      <main>
        <TermsOfUse />
      </main>
      <Footer hasTermsLink={false} />
    </>
  );
}
