import Link from "next/link";
import { getCurrentProfile, isAdminProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { Analytics } from "./analytics";
import { Roll } from "./roll";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const links = [
    { href: "/presets", label: "Presets" },
    { href: "/feed", label: "Feed" },
    { href: "/ugc", label: "UGC Ads" },
    { href: "/generate", label: "Create" },
    ...(profile ? [{ href: "/library", label: "Library" }] : []),
    { href: "/pricing", label: "Pricing" },
    ...(isAdminProfile(profile) ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <>
      <Analytics userId={profile?.id} email={profile?.email} />
      <header className="sticky top-0 z-40 bg-black/90" data-site-header>
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="text-[15px] font-bold tracking-[-0.03em]">
            {env.brandName()}
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-foreground">{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {profile ? (
              <>
                <Link href="/billing" className="btn-ghost !px-3.5 !py-1.5 tabular-nums" data-testid="credit-balance">
                  {profile.credits_balance} <span className="text-muted">credits</span>
                </Link>
                <Link href="/dashboard" className="btn-ghost !px-3.5 !py-1.5"><Roll>Account</Roll></Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost !px-3.5 !py-1.5"><Roll>Log in</Roll></Link>
                <Link href="/signup" className="btn-primary btn-sheen !py-1.5"><Roll>Start free</Roll></Link>
              </>
            )}
          </div>
        </div>
        <nav className="no-scrollbar flex gap-5 overflow-x-auto px-4 pb-2.5 text-sm text-muted sm:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </header>
    </>
  );
}
