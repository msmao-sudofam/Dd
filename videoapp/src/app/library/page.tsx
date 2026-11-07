import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { LibraryGrid } from "@/components/create/library-grid";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const profile = await requireProfile("/library");
  const jobs = await db().listJobs(profile.id, 120);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">Library</h1>
        <Link href="/presets" className="btn-primary">New video</Link>
      </div>
      <LibraryGrid initialJobs={jobs} />
    </div>
  );
}
