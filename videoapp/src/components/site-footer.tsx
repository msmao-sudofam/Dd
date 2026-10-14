import Link from "next/link";
import { env } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 text-xs text-muted">
        <span>© {new Date().getFullYear()} {env.brandName()}</span>
        <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
        <Link href="/legal/acceptable-use" className="hover:text-foreground">Acceptable use</Link>
        <Link href="/legal/refunds" className="hover:text-foreground">Refunds</Link>
        <span className="ml-auto">AI-generated content. Label it where platforms require.</span>
      </div>
    </footer>
  );
}
