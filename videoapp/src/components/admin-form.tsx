"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminFormState } from "@/app/admin/actions";

export function AdminForm({
  action,
  children,
}: {
  action: (s: AdminFormState, f: FormData) => Promise<AdminFormState>;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="card grid gap-4 p-6 sm:grid-cols-2">
      {children}
      {state?.error && <p className="text-sm text-danger sm:col-span-2" data-testid="admin-error">{state.error}</p>}
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
