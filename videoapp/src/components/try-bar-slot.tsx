import { getSessionUser } from "@/lib/auth";
import { currentTryView } from "@/lib/try/session";
import { TryBar } from "./try-bar";

/** Server side of the try bar: renders nothing unless this visitor has a product in "try" mode. */
export async function TryBarSlot() {
  const view = await currentTryView();
  if (!view) return null;
  return <TryBar view={view} loggedIn={!!(await getSessionUser())} />;
}
