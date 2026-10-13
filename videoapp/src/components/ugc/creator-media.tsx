import { LazyVideo } from "@/components/lazy-video";
import type { UgcActor } from "@/lib/types";

/** A creator's card media: their short talking clip (muted loop) over the portrait, or the portrait alone. */
export function CreatorMedia({ actor, className }: { actor: Pick<UgcActor, "name" | "portrait_url" | "preview_video_url">; className?: string }) {
  if (actor.preview_video_url) return <LazyVideo src={actor.preview_video_url} poster={actor.portrait_url ?? undefined} className={className} label={`${actor.name}, AI creator`} />;
  if (!actor.portrait_url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={actor.portrait_url} alt={`${actor.name}, AI creator`} loading="lazy" className={className} />;
}
