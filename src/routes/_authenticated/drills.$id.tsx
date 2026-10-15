import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Download, Maximize2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToPracticeDialog } from "@/components/AddToPracticeDialog";
import { Tag, VideoEmbed } from "@/components/drill-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { commentsQuery, diagramDownloadUrl, diagramUrl, drillQuery, isPdf, lines, t, type Drill } from "@/lib/drills";

export const Route = createFileRoute("/_authenticated/drills/$id")({
  head: () => ({
    meta: [
      { title: "Ejercicio — C.B.R.V" },
      { name: "description", content: "Vídeo, organización, puntos clave y comentarios del ejercicio." },
      { property: "og:title", content: "Ejercicio — C.B.R.V" },
      { property: "og:description", content: "Vídeo, organización, puntos clave y comentarios del ejercicio." },
    ],
  }),
  component: DrillDetail,
});

function DrillDetail() {
  const { id } = Route.useParams();
  const { data: drill, isLoading } = useQuery(drillQuery(id));
  const [adding, setAdding] = useState<Drill | null>(null);

  if (isLoading) return <p className="p-8 text-muted-foreground">Cargando…</p>;
  if (!drill) return <p className="p-8 text-muted-foreground">Ejercicio no encontrado.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
      <Link to="/drills" className="mb-4 inline-flex h-10 items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Ejercicios
      </Link>
      <VideoEmbed url={drill.youtube_url} title={drill.title} />
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold leading-tight">{drill.title}</h1>
          <p className="text-sm text-muted-foreground">por {drill.author_name}</p>
        </div>
        <Button className="h-11 font-semibold" onClick={() => setAdding(drill)}>
          <Plus className="h-5 w-5" /> Añadir a sesión
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="flex items-center gap-1 font-semibold"><Clock className="h-4 w-4 text-primary" /> {drill.duration_minutes} min</span>
        {drill.players_needed && <span className="flex items-center gap-1 font-semibold"><Users className="h-4 w-4 text-primary" /> {drill.players_needed}</span>}
        <Tag>{t(drill.difficulty)}</Tag>
        {drill.age_groups.map((a) => <Tag key={a} tone="primary">{t(a)}</Tag>)}
        {drill.categories.map((c) => <Tag key={c}>{t(c)}</Tag>)}
      </div>

      <Section title="Organización" items={lines(drill.setup)} />
      <Section title="Desarrollo" items={lines(drill.execution)} ordered />
      <Section title="Puntos clave" items={lines(drill.coaching_points)} />

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Diagrama de pista</h2>
        {drill.diagram_path ? <Diagram path={drill.diagram_path} /> : (
          <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Sin diagrama adjunto.</p>
        )}
      </section>

      <Comments drillId={drill.id} />
      <AddToPracticeDialog drill={adding} onClose={() => setAdding(null)} />
    </div>
  );
}

function Section({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  if (!items.length) return null;
  const L = ordered ? "ol" : "ul";
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <L className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 rounded-lg bg-card px-4 py-3">
            <span className="font-display font-bold text-primary">{ordered ? `${i + 1}` : "•"}</span>
            <span>{t}</span>
          </li>
        ))}
      </L>
    </section>
  );
}

function Diagram({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    diagramUrl(path).then(setUrl).catch(() => setUrl(null));
  }, [path]);
  if (!url) return <p className="text-sm text-muted-foreground">Cargando diagrama…</p>;
  const pdf = isPdf(path);
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="h-72 bg-muted">
        {pdf ? <iframe src={url} title="Diagrama de pista" className="h-full w-full" /> : <img src={url} alt="Diagrama de pista" className="h-full w-full object-contain" />}
      </div>
      <div className="flex gap-2 p-3">
        <Button variant="secondary" className="h-11 flex-1" onClick={() => setFull(true)}>
          <Maximize2 className="h-4 w-4" /> Pantalla completa
        </Button>
        <Button
          variant="secondary"
          className="h-11 flex-1"
          onClick={async () => {
            try { window.location.href = await diagramDownloadUrl(path); } catch { /* ignore */ }
          }}
        >
          <Download className="h-4 w-4" /> Descargar
        </Button>
      </div>
      <Dialog open={full} onOpenChange={setFull}>
        <DialogContent className="h-[95vh] max-w-[95vw] p-2 sm:max-w-[95vw]">
          <DialogTitle className="sr-only">Diagrama de pista</DialogTitle>
          {pdf ? <iframe src={url} title="Diagrama de pista" className="h-full w-full rounded" /> : <img src={url} alt="Diagrama de pista" className="h-full w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Comments({ drillId }: { drillId: string }) {
  const qc = useQueryClient();
  const { data: comments = [] } = useQuery(commentsQuery(drillId));
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", u.user!.id).maybeSingle();
    const { error } = await supabase.from("drill_comments").insert({
      drill_id: drillId,
      user_id: u.user!.id,
      author_name: prof?.full_name || "Entrenador",
      body: body.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    qc.invalidateQueries({ queryKey: ["comments", drillId] });
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-semibold">Comentarios y variantes</h2>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-card p-4">
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="font-semibold">{c.author_name}</span>
              <span className="text-muted-foreground">
                {new Date(c.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
        {!comments.length && <p className="text-sm text-muted-foreground">Aún no hay comentarios: comparte un consejo o variante.</p>}
      </div>
      <form onSubmit={post} className="mt-4 space-y-2">
        <Textarea rows={3} placeholder="Añade un consejo, variante o pregunta…" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button type="submit" className="h-11" disabled={busy || !body.trim()}>Publicar comentario</Button>
      </form>
    </section>
  );
}
