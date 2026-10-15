import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Monitor, PlayCircle, Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { addDrillToPractice } from "@/components/AddToPracticeDialog";
import { DiagramLink } from "@/components/drill-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { drillsQuery, practiceQuery } from "@/lib/drills";
import { getYouTubeId, youTubeWatchUrl } from "@/lib/youtube";

export const Route = createFileRoute("/_authenticated/practice/$id")({
  head: () => ({
    meta: [
      { title: "Sesión de entrenamiento — C.B.R.V" },
      { name: "description", content: "Sesión cronometrada con ejercicios, minutos y notas." },
      { property: "og:title", content: "Sesión de entrenamiento — C.B.R.V" },
      { property: "og:description", content: "Sesión cronometrada con ejercicios, minutos y notas." },
    ],
  }),
  component: PracticeEditor,
});

type Block = { id: string; drill_id: string | null; title: string; minutes: number; notes: string; position: number; drills: { id: string; title: string; youtube_url: string; diagram_path: string | null } | null };

function PracticeEditor() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(practiceQuery(id));
  const [name, setName] = useState("");
  const [target, setTarget] = useState(90);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [courtside, setCourtside] = useState(false);
  const [picker, setPicker] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data: u }) => setUid(u.user?.id ?? null)); }, []);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setTarget(data.target_minutes);
      setBlocks(data.practice_blocks as Block[]);
    }
  }, [data]);

  const total = useMemo(() => blocks.reduce((s, b) => s + (b.minutes || 0), 0), [blocks]);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["practice", id] });
    qc.invalidateQueries({ queryKey: ["practices"] });
  };

  async function saveMeta(patch: { name?: string; target_minutes?: number }) {
    await supabase.from("practices").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["practices"] });
  }

  async function saveBlock(b: Block, patch: Partial<Block>) {
    setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, ...patch } : x)));
    const { drills: _d, ...rest } = patch as Block;
    await supabase.from("practice_blocks").update(rest).eq("id", b.id);
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
    const withPos = next.map((b, k) => ({ ...b, position: k }));
    setBlocks(withPos);
    await Promise.all(
      [withPos[i]!, withPos[j]!].map((b) => supabase.from("practice_blocks").update({ position: b.position }).eq("id", b.id)),
    );
  }

  async function remove(b: Block) {
    setBlocks((bs) => bs.filter((x) => x.id !== b.id));
    await supabase.from("practice_blocks").delete().eq("id", b.id);
    refresh();
  }

  async function addCustom() {
    const { error } = await supabase.from("practice_blocks").insert({ practice_id: id, title: "Bloque libre", minutes: 5, position: blocks.length });
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function deletePractice() {
    if (!confirm("¿Eliminar esta sesión?")) return;
    await supabase.from("practices").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["practices"] });
    navigate({ to: "/practice" });
  }

  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando…</p>;
  if (!data) return <p className="p-8 text-muted-foreground">Sesión no encontrada.</p>;
  const isOwner = !!uid && data.user_id === uid;

  async function toggleShare(v: boolean) {
    const { error } = await supabase.from("practices").update({ is_shared_with_club: v }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(v ? "Sesión compartida con el club" : "Sesión privada");
    refresh();
  }

  const over = total > target;
  const pct = Math.min(100, (total / Math.max(1, target)) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
      <div className="no-print mb-3 flex items-center justify-between">
        <Link to="/practice" className="inline-flex h-10 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Sesiones
        </Link>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Monitor className="h-4 w-4 text-primary" /> Modo pista / Imprimir
          <Switch checked={courtside} onCheckedChange={setCourtside} />
        </label>
      </div>

      {/* Running total */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 border-b bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Tiempo total de la sesión</span>
          <span className={cn("font-display text-2xl font-bold", over ? "text-destructive" : "text-primary")}>
            {total} / {target} min
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isOwner && (
        <label className="no-print mb-4 flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
          <span>
            <span className="block font-semibold">Compartir con el club</span>
            <span className="text-sm text-muted-foreground">Otros entrenadores podrán verla (no editarla).</span>
          </span>
          <Switch checked={data.is_shared_with_club} onCheckedChange={toggleShare} />
        </label>
      )}

      {courtside || !isOwner ? (
        <CourtsideView name={name} blocks={blocks} total={total} />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-[1fr_auto] gap-3">
            <Input className="h-12 text-lg font-semibold" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveMeta({ name })} />
            <div className="flex items-center gap-2">
              <Input type="number" min={1} className="h-12 w-20 text-center" value={target} onChange={(e) => setTarget(Number(e.target.value))} onBlur={() => saveMeta({ target_minutes: target })} />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>

          <div className="space-y-3">
            {blocks.map((b, i) => (
              <div key={b.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display font-bold text-primary">{i + 1}</span>
                  {b.drill_id ? (
                    <Link to="/drills/$id" params={{ id: b.drill_id }} className="min-w-0 flex-1 truncate font-semibold hover:text-primary">{b.title}</Link>
                  ) : (
                    <Input className="h-10 flex-1" value={b.title} onChange={(e) => setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, title: e.target.value } : x)))} onBlur={(e) => saveBlock(b, { title: e.target.value })} />
                  )}
                  <Input type="number" min={0} className="h-10 w-16 text-center" value={b.minutes} onChange={(e) => saveBlock(b, { minutes: Number(e.target.value) })} />
                  <span className="text-xs text-muted-foreground">m</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input className="h-10 flex-1 text-sm" placeholder="Notas para este bloque…" value={b.notes} onChange={(e) => setBlocks((bs) => bs.map((x) => (x.id === b.id ? { ...x, notes: e.target.value } : x)))} onBlur={(e) => saveBlock(b, { notes: e.target.value })} />
                  <IconBtn label="Subir" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Bajar" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}><ArrowDown className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Quitar" onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </div>
            ))}
            {!blocks.length && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Añade ejercicios para empezar tu sesión.</p>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button className="h-12 font-semibold" onClick={() => setPicker(true)}><Plus className="h-5 w-5" /> Añadir ejercicio</Button>
            <Button variant="secondary" className="h-12 font-semibold" onClick={addCustom}><Plus className="h-5 w-5" /> Bloque libre</Button>
          </div>
          <button onClick={deletePractice} className="mt-8 text-sm text-destructive">Eliminar sesión</button>
        </>
      )}

      <DrillPicker open={picker} onOpenChange={setPicker} onPick={async (d) => { await addDrillToPractice(id, d); refresh(); toast.success(`Añadido ${d.title}`); }} />
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button aria-label={label} onClick={onClick} disabled={disabled} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground disabled:opacity-30">
      {children}
    </button>
  );
}

function CourtsideView({ name, blocks, total }: { name: string; blocks: Block[]; total: number }) {
  let clock = 0;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{name}</h1>
        <Button variant="secondary" className="no-print h-11" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir
        </Button>
      </div>
      <ol className="divide-y rounded-xl border bg-card">
        {blocks.map((b, i) => {
          const start = clock;
          clock += b.minutes;
          const vid = b.drills ? getYouTubeId(b.drills.youtube_url) : null;
          return (
            <li key={b.id} className="flex gap-4 p-4">
              <div className="w-16 shrink-0 text-center">
                <div className="font-display text-2xl font-bold text-primary">{b.minutes}m</div>
                <div className="text-xs text-muted-foreground">{start}–{clock}</div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{i + 1}. {b.title}</p>
                {b.notes && <p className="text-muted-foreground">{b.notes}</p>}
                <div className="mt-1 flex flex-wrap gap-4">
                  {vid && (
                    <a href={youTubeWatchUrl(vid)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1 text-sm font-semibold text-primary">
                      <PlayCircle className="h-4 w-4" /> Vídeo
                    </a>
                  )}
                  {b.drills?.diagram_path && <DiagramLink path={b.drills.diagram_path} />}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-right font-semibold">Total: {total} min</p>
    </div>
  );
}

function DrillPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (d: import("@/lib/drills").Drill) => Promise<void> }) {
  const { data: drills = [] } = useQuery({ ...drillsQuery, enabled: open });
  const [q, setQ] = useState("");
  const list = drills.filter((d) => d.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Elige un ejercicio</DialogTitle></DialogHeader>
        <Input className="h-11" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-2">
          {list.map((d) => (
            <button key={d.id} onClick={() => onPick(d)} className="flex w-full items-center justify-between rounded-lg border bg-secondary px-4 py-3 text-left hover:border-primary">
              <span className="font-semibold">{d.title}</span>
              <span className="text-sm text-muted-foreground">{d.duration_minutes}m</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
