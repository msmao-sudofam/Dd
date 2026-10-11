import Link from "next/link";
import { getCurrentProfile, isAdminProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { Analytics } from "./analytics";

export async function SiteHeader() {
  const profile = await getCurrentProfile();
  return (
    <>
    <Analytics userId={profile?.id} email={profile?.email} />
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="text-base font-black tracking-tight">
          {env.brandName()}
          <span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-muted sm:flex">
          <Link href="/presets" className="hover:text-foreground">Presets</Link>
          <Link href="/generate" className="hover:text-foreground">Create</Link>
          {profile && <Link href="/library" className="hover:text-foreground">Library</Link>}
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          {isAdminProfile(profile) && <Link href="/admin" className="hover:text-foreground">Admin</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {profile ? (
            <>
              <Link href="/billing" className="btn-ghost !px-3 !py-1.5" data-testid="credit-balance">
                <span className="text-accent">●</span>
                <span>{profile.credits_balance}</span>
                <span className="text-muted">credits</span>
              </Link>
              <Link href="/dashboard" className="btn-ghost !px-3 !py-1.5">Account</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost !px-4 !py-1.5">Log in</Link>
              <Link href="/signup" className="btn-primary !px-4 !py-1.5">Get free credits</Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2 text-sm text-muted sm:hidden">
        <Link href="/presets">Presets</Link>
        <Link href="/generate">Create</Link>
        {profile && <Link href="/library">Library</Link>}
        <Link href="/pricing">Pricing</Link>
        {isAdminProfile(profile) && <Link href="/admin">Admin</Link>}
      </nav>
    </header>
    </>
  );
}
