"use client";

import { useJobs } from "@/lib/client/use-jobs";
import type { Job } from "@/lib/types";
import { JobCard } from "./job-card";

export function LibraryGrid({ initialJobs }: { initialJobs: Job[] }) {
  const { jobs } = useJobs(initialJobs);
  if (!jobs.length) return <div className="card p-10 text-center text-sm text-muted">Nothing here yet.</div>;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="library-grid">
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}
