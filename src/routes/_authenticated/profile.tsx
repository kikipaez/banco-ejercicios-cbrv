import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pill } from "@/components/drill-ui";
import { PracticeListItems } from "@/components/PracticeListItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AGE_GROUPS, profileQuery, t } from "@/lib/drills";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mi perfil — C.B.R.V" },
      { name: "description", content: "Tu perfil de entrenador y tus sesiones guardadas." },
      { property: "og:title", content: "Mi perfil — C.B.R.V" },
      { property: "og:description", content: "Tu perfil de entrenador y tus sesiones guardadas." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useQuery(profileQuery);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.full_name);
      setTeam(profile.team);
      setAge(profile.age_group);
    }
  }, [profile]);

  async function save() {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: profile.id, full_name: name, team, age_group: age });
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil guardado");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="mb-5 text-3xl font-bold">Mi perfil</h1>
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Usuario: <span className="font-semibold text-foreground">{profile?.username}</span></p>
        <div className="space-y-1.5">
          <Label>Nombre del entrenador</Label>
          <Input className="h-12" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Equipo</Label>
          <Input className="h-12" placeholder="ej. Infantil Femenino A" value={team} onChange={(e) => setTeam(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Categoría que entrenas</Label>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((a) => (
              <Pill key={a} active={age === a} onClick={() => setAge(a)}>{t(a)}</Pill>
            ))}
          </div>
        </div>
        <Button className="h-12 w-full font-semibold" onClick={save}>Guardar perfil</Button>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-semibold">Sesiones guardadas</h2>
      <PracticeListItems />

      <Button variant="secondary" className="mt-8 h-12 w-full" onClick={signOut}>Cerrar sesión</Button>
    </div>
  );
}
