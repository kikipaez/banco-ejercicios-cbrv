import { Link } from "@tanstack/react-router";
import { Clock, FileText, Plus, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getYouTubeId, youTubeEmbedUrl, youTubeThumbUrl } from "@/lib/youtube";
import { diagramUrl, t, type Drill } from "@/lib/drills";

export function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary text-secondary-foreground hover:border-primary/60",
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-semibold",
        tone === "primary" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const id = getYouTubeId(url);
  if (!id)
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">
        Sin vídeo
      </div>
    );
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-muted">
      <iframe
        src={youTubeEmbedUrl(id)}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function DrillCard({ drill, onAdd }: { drill: Drill; onAdd: (d: Drill) => void }) {
  const id = getYouTubeId(drill.youtube_url);
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/60">
      <Link to="/drills/$id" params={{ id: drill.id }} className="block">
        <div className="relative aspect-video bg-muted">
          {id ? (
            <>
              <img src={youTubeThumbUrl(id)} alt="" loading="lazy" className="h-full w-full object-cover" />
              <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-foreground/80 drop-shadow" />
            </>
          ) : (
            <div className="h-full w-full bg-slate-950" />
          )}
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-xs font-semibold">
            <Clock className="h-3 w-3" /> {drill.duration_minutes} min
          </span>
        </div>
        <div className="space-y-2 p-4 pb-2">
          <h3 className="text-lg font-semibold leading-tight">{drill.title}</h3>
          <div className="flex flex-wrap gap-1">
            {drill.age_groups.map((a) => (
              <Tag key={a} tone="primary">{t(a)}</Tag>
            ))}
            {drill.categories.map((c) => (
              <Tag key={c}>{t(c)}</Tag>
            ))}
          </div>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-2 p-4 pt-2">
        <span className="truncate text-sm text-muted-foreground">por {drill.author_name}</span>
        <button
          type="button"
          onClick={() => onAdd(drill)}
          className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-primary/15 px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Añadir a sesión
        </button>
      </div>
    </div>
  );
}

export function DiagramLink({ path }: { path: string }) {
  return (
    <button
      type="button"
      onClick={async () => window.open(await diagramUrl(path), "_blank")}
      className="inline-flex h-10 items-center gap-1 text-sm font-semibold text-primary"
    >
      <FileText className="h-4 w-4" /> Diagrama
    </button>
  );
}
