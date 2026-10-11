"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Job } from "@/lib/types";
import { supabaseBrowser } from "./supabase-browser";

const PENDING = new Set(["queued", "running"]);

/**
 * Tracks jobs live: Supabase Realtime pushes row changes when configured; polling /api/jobs
 * (which also reconciles with the provider if a webhook was lost) runs while anything is pending.
 */
export function useJobs(initial: Job[], onBalance?: (b: number) => void) {
  const [jobs, setJobs] = useState<Job[]>(initial);
  const jobsRef = useRef(jobs);
  const balanceRef = useRef(onBalance);
  useEffect(() => {
    jobsRef.current = jobs;
    balanceRef.current = onBalance;
  });

  const upsert = useCallback((incoming: Job[]) => {
    setJobs((prev) => {
      const map = new Map(prev.map((j) => [j.id, j]));
      for (const j of incoming) map.set(j.id, { ...map.get(j.id), ...j });
      return [...map.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
    });
  }, []);

  const hasPending = jobs.some((j) => PENDING.has(j.status));

  useEffect(() => {
    if (!hasPending) return;
    let stopped = false;
    const tick = async () => {
      const ids = jobsRef.current.filter((j) => PENDING.has(j.status)).map((j) => j.id);
      if (!ids.length) return;
      try {
        const res = await fetch(`/api/jobs?ids=${ids.join(",")}`, { cache: "no-store" });
        if (res.ok && !stopped) {
          const data = (await res.json()) as { jobs: Job[]; balance: number };
          upsert(data.jobs);
          balanceRef.current?.(data.balance);
        }
      } catch {}
    };
    const t = setInterval(tick, 2500);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [hasPending, upsert]);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel("jobs-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, (payload: { new: Record<string, unknown> }) => {
        if (payload.new && "id" in payload.new) upsert([payload.new as unknown as Job]);
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [upsert]);

  return { jobs, upsert };
}
