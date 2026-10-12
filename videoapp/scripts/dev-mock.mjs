// `npm run dev:mock`: next dev with every external service mocked. A script rather than inline
// `VAR=value next dev` so it also works from cmd.exe and PowerShell.
import { spawn } from "node:child_process";

// Real keys from .env.local are blanked (an empty value still wins over the file): mock mode sends nothing out.
const off = { FAL_KEY: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", RESEND_API_KEY: "", STRIPE_SECRET_KEY: "", NEXT_PUBLIC_POSTHOG_KEY: "" };
const env = { ...process.env, ...off, MOCK_BACKEND: "true", MOCK_PROVIDERS: "true", MOCK_STRIPE: "true" };
const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { env, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
