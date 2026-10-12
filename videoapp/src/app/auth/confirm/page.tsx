import { confirmEmailAction } from "@/app/(auth)/actions";

export const metadata = { title: "Confirm your email" };

// The emailed link lands here and only the button spends the one-time token. Confirming on GET breaks for
// real people: mail scanners open links first, and a link opened on another device has no PKCE verifier.
export default async function Page({ searchParams }: PageProps<"/auth/confirm">) {
  const { token_hash, next } = await searchParams;
  const tokenHash = typeof token_hash === "string" ? token_hash : "";
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-3xl font-black tracking-tight">Confirm your email</h1>
      {tokenHash ? (
        <form action={confirmEmailAction} className="mt-8">
          <input type="hidden" name="token_hash" value={tokenHash} />
          {typeof next === "string" && <input type="hidden" name="next" value={next} />}
          <p className="text-sm text-muted">One click and your account is ready.</p>
          <button className="btn-primary mt-6 w-full" data-testid="confirm-email">Confirm and continue</button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-muted" data-testid="confirm-missing">
          This link is incomplete. Open the link from your confirmation email again.
        </p>
      )}
    </div>
  );
}
