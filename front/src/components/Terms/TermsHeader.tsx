import Link from "next/link";
import MiniLighthouse from "@/components/LandingPage/MiniLighthouse";
import { env } from "@/env";

export default function TermsHeader() {
  return (
    <header className="flex items-end justify-between gap-6 px-14 pt-10 max-md:px-4 max-md:pt-6">
      <Link href="/" className="group flex items-end gap-3">
        <MiniLighthouse className="h-21 w-9" />
        <span className="text-sign group-hover:text-moon leading-none font-black italic">
          {env.NEXT_PUBLIC_WEBSITE_NAME}
        </span>
      </Link>
      <Link
        href="/"
        className="text-cream hover:text-moon text-label inline-flex min-h-11 items-center font-mono"
      >
        Back to the app
      </Link>
    </header>
  );
}
