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
