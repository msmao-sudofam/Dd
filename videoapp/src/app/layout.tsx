import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoBanner } from "@/components/demo-banner";
import { AccentPicker } from "@/components/accent-picker";
import { Fx } from "@/components/fx";
import { TryBarSlot } from "@/components/try-bar-slot";
import { env } from "@/lib/env";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl()),
  title: { default: `${env.brandName()} — AI video ads in one click`, template: `%s · ${env.brandName()}` },
  description: "Turn one product photo into scroll-stopping 9:16 video ads with one-click AI presets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="grain flex min-h-full flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <TryBarSlot />
        <Fx />
        {/* Colour try-out: Vercel preview deployments only, never production. */}
        {process.env.VERCEL_ENV === "preview" && <AccentPicker />}
      </body>
    </html>
  );
}
