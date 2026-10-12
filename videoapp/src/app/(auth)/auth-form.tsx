"use client";

import Link from "next/link";
import { useActionState } from "react";
import { googleAction, loginAction, signupAction, type AuthFormState } from "./actions";

export function AuthForm({ mode, next, mock, notice }: { mode: "login" | "signup"; next: string; mock: boolean; notice?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? loginAction : signupAction,
    undefined,
  );
  const [gState, gAction, gPending] = useActionState<AuthFormState, FormData>(googleAction, undefined);
  const err = state?.error ?? gState?.error;

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-3xl font-black tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "signup" ? "Free credits on signup — enough for your first clip." : "Log in to keep creating."}
      </p>

      <form action={gAction} className="mt-8">
        <input type="hidden" name="next" value={next} />
        <button className="btn-ghost w-full" disabled={gPending || mock} title={mock ? "Needs Supabase keys" : undefined}>
          Continue with Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" defaultValue={state?.email} key={state?.email} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>
        {notice && !err && <p className="text-sm text-foreground" data-testid="auth-notice">{notice}</p>}
        {err && <p className="text-sm text-danger" role="alert" data-testid="auth-error">{err}</p>}
        {state?.message && <p className="text-sm text-foreground">{state.message}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>No account? <Link className="text-foreground underline" href={`/signup?next=${encodeURIComponent(next)}`}>Sign up</Link></>
        ) : (
          <>Have an account? <Link className="text-foreground underline" href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></>
        )}
      </p>
      {mode === "signup" && (
        <p className="mt-4 text-center text-xs text-muted">
          By signing up you agree to the <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
          <Link href="/legal/acceptable-use" className="underline">Acceptable Use Policy</Link>.
        </p>
      )}
    </div>
  );
}
