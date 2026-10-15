import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { practicesQuery, type Drill } from "@/lib/drills";

export async function addDrillToPractice(practiceId: string, drill: Drill) {
  const { count } = await supabase
    .from("practice_blocks")
    .select("id", { count: "exact", head: true })
    .eq("practice_id", practiceId);
  const { error } = await supabase.from("practice_blocks").insert({
    practice_id: practiceId,
    drill_id: drill.id,
    title: drill.title,
    minutes: drill.duration_minutes,
    position: count ?? 0,
  });
  if (error) throw error;
  await supabase.from("practices").update({ updated_at: new Date().toISOString() }).eq("id", practiceId);
}

export async function createPractice(name: string, target = 90) {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("practices")
    .insert({ user_id: u.user!.id, name, target_minutes: target })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function AddToPracticeDialog({ drill, onClose }: { drill: Drill | null; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: practices = [] } = useQuery({ ...practicesQuery, enabled: !!drill });

  async function add(practiceId: string) {
    if (!drill) return;
    try {
      await addDrillToPractice(practiceId, drill);
      qc.invalidateQueries({ queryKey: ["practices"] });
      qc.invalidateQueries({ queryKey: ["practice", practiceId] });
      toast.success(`Añadido "${drill.title}"`, {
        action: { label: "Abrir", onClick: () => navigate({ to: "/practice/$id", params: { id: practiceId } }) },
      });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo añadir el ejercicio");
    }
  }

  async function addNew() {
    const p = await createPractice("Nueva sesión");
    await add(p.id);
  }

  return (
    <Dialog open={!!drill} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir a sesión</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {practices.map((p) => {
            const total = p.practice_blocks.reduce((s, b) => s + b.minutes, 0);
            return (
              <button
                key={p.id}
                onClick={() => add(p.id)}
                className="flex w-full items-center justify-between rounded-lg border bg-secondary px-4 py-3 text-left hover:border-primary"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-muted-foreground">
                  {total} / {p.target_minutes} min
                </span>
              </button>
            );
          })}
          <button
            onClick={addNew}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary px-4 py-3 font-semibold text-primary"
          >
            <Plus className="h-4 w-4" /> Nueva sesión
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
