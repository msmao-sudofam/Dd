// `npm run dev:mock`: next dev with every external service mocked. A script rather than inline
// `VAR=value next dev` so it also works from cmd.exe and PowerShell.
import { spawn } from "node:child_process";

const env = { ...process.env, MOCK_BACKEND: "true", MOCK_PROVIDERS: "true", MOCK_STRIPE: "true" };
const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { env, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
