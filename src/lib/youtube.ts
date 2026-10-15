const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the 11-char YouTube video ID from watch, youtu.be, shorts, embed and live URLs. */
export function getYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (ID_RE.test(raw)) return raw;
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (m) id = m[2] ?? null;
    }
  }
  return id && ID_RE.test(id) ? id : null;
}

export const youTubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

export const youTubeThumbUrl = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const youTubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
