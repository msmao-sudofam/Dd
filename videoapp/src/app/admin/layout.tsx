import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 flex gap-4 text-sm">
        <Link href="/admin" className="font-bold">Admin</Link>
        <Link href="/admin/presets" className="text-muted hover:text-foreground">Presets</Link>
        <Link href="/admin/models" className="text-muted hover:text-foreground">Models</Link>
        <Link href="/admin/margin" className="text-muted hover:text-foreground">Margin</Link>
      </nav>
      {children}
    </div>
  );
}
