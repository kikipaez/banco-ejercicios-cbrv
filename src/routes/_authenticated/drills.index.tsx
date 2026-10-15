import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToPracticeDialog } from "@/components/AddToPracticeDialog";
import { DrillCard, Pill } from "@/components/drill-ui";
import { UploadDrillDialog } from "@/components/UploadDrillDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGE_GROUPS, CATEGORIES, DIFFICULTIES, drillsQuery, t, type Drill } from "@/lib/drills";

export const Route = createFileRoute("/_authenticated/drills/")({
  head: () => ({
    meta: [
      { title: "Banco de ejercicios — C.B.R.V" },
      { name: "description", content: "Busca y filtra los ejercicios de baloncesto del club." },
      { property: "og:title", content: "Banco de ejercicios — C.B.R.V" },
      { property: "og:description", content: "Busca y filtra los ejercicios de baloncesto del club." },
    ],
  }),
  component: DrillsPage,
});

function DrillsPage() {
  const { data: drills = [], isLoading } = useQuery(drillsQuery);
  const [q, setQ] = useState("");
  const [age, setAge] = useState("All");
  const [cat, setCat] = useState("All");
  const [diff, setDiff] = useState("All");
  const [adding, setAdding] = useState<Drill | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return drills.filter(
      (d) =>
        (!s || d.title.toLowerCase().includes(s) || d.coaching_points.toLowerCase().includes(s)) &&
        (age === "All" || d.age_groups.includes(age)) &&
        (cat === "All" || d.categories.includes(cat)) &&
        (diff === "All" || d.difficulty === diff),
    );
  }, [drills, q, age, cat, diff]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Banco de ejercicios</h1>
        <Button onClick={() => setUploadOpen(true)} className="h-11 font-semibold shadow-glow">
          <Plus className="h-5 w-5" /> <span className="hidden sm:inline">Subir ejercicio</span><span className="sm:hidden">Subir</span>
        </Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar ejercicios o puntos clave"
          className="h-12 pl-10 text-base"
        />
      </div>
      <div className="space-y-2">
        <FilterRow label="Edad" options={["All", ...AGE_GROUPS]} value={age} onChange={setAge} />
        <FilterRow label="Tipo" options={["All", ...CATEGORIES]} value={cat} onChange={setCat} />
        <FilterRow label="Nivel" options={["All", ...DIFFICULTIES]} value={diff} onChange={setDiff} />
      </div>
      <p className="mb-3 mt-5 text-sm text-muted-foreground">
        {isLoading ? "Cargando…" : `${filtered.length} ejercicio${filtered.length === 1 ? "" : "s"}`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <DrillCard key={d.id} drill={d} onAdd={setAdding} />
        ))}
      </div>
      {!isLoading && filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">Ningún ejercicio coincide con estos filtros.</p>
      )}
      <AddToPracticeDialog drill={adding} onClose={() => setAdding(null)} />
      <UploadDrillDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <div className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4">
        {options.map((o) => (
          <Pill key={o} active={value === o} onClick={() => onChange(o)}>
            {t(o)}
          </Pill>
        ))}
      </div>
    </div>
  );
}
