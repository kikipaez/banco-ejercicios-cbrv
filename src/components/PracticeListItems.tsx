import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import { practicesQuery, sharedPracticesQuery } from "@/lib/drills";

type Item = { id: string; name: string; target_minutes: number; is_shared_with_club: boolean; practice_blocks: { minutes: number }[]; author?: string };

function Row({ p }: { p: Item }) {
  const total = p.practice_blocks.reduce((s, b) => s + b.minutes, 0);
  return (
    <Link
      to="/practice/$id"
      params={{ id: p.id }}
      className="flex items-center justify-between rounded-xl border bg-card px-4 py-4 hover:border-primary"
    >
      <div>
        <p className="font-semibold">{p.name}</p>
        <p className="text-sm text-muted-foreground">
          {p.author ? `${p.author} · ` : ""}
          {p.practice_blocks.length} bloques · {total} / {p.target_minutes} min
          {!p.author && p.is_shared_with_club && " · Compartida"}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

export function PracticeListItems() {
  const { data = [], isLoading } = useQuery(practicesQuery);
  if (isLoading) return <p className="text-muted-foreground">Cargando…</p>;
  if (!data.length) return <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Aún no hay sesiones.</p>;
  return (
    <div className="space-y-2">
      {data.map((p) => <Row key={p.id} p={p} />)}
    </div>
  );
}

export function SharedPracticeListItems() {
  const { data = [], isLoading } = useQuery(sharedPracticesQuery);
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-primary" /> Compartidas por el club</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : !data.length ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Ningún entrenador ha compartido sesiones todavía.</p>
      ) : (
        <div className="space-y-2">{data.map((p) => <Row key={p.id} p={p} />)}</div>
      )}
    </section>
  );
}

