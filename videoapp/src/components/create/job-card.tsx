"use client";

import type { Job } from "@/lib/types";

const STATUS_LABEL: Record<Job["status"], string> = {
  queued: "Queued",
  running: "Rendering…",
  succeeded: "Ready",
  failed: "Failed",
  refunded: "Failed — credits refunded",
};

export function JobCard({ job }: { job: Job }) {
  const pending = job.status === "queued" || job.status === "running";
  const aspect = job.input_json.aspect_ratio === "16:9" ? "aspect-video" : job.input_json.aspect_ratio === "1:1" ? "aspect-square" : "aspect-[9/16]";
  return (
    <div className="card overflow-hidden" data-testid="job-card" data-status={job.status} data-job-id={job.id}>
      <div className={`relative ${aspect} bg-surface-2`}>
        {job.status === "succeeded" && job.output_url ? (
          job.output_type === "video" ? (
            <video src={job.output_url} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.output_url} alt={job.input_json.prompt} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted">
            {pending && <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />}
            <span className={job.status === "refunded" || job.status === "failed" ? "text-danger" : ""}>
              {STATUS_LABEL[job.status]}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 text-xs text-muted">{job.input_json.prompt}</p>
        <div className="flex items-center justify-between text-xs">
          <span data-testid="job-status">{STATUS_LABEL[job.status]}</span>
          <span className="text-muted">{job.credits_charged} cr</span>
        </div>
        {job.status === "succeeded" && job.output_url && (
          <a
            href={job.output_url.includes("/api/storage/") ? `${job.output_url}?download=1` : `${job.output_url}?download=`}
            download
            className="btn-ghost w-full !py-1.5"
            data-testid="download"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
