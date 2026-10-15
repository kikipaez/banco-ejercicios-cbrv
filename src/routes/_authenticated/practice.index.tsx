import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { createPractice } from "@/components/AddToPracticeDialog";
import { Button } from "@/components/ui/button";
import { PracticeListItems, SharedPracticeListItems } from "@/components/PracticeListItems";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({
    meta: [
      { title: "Sesiones de entrenamiento — C.B.R.V" },
      { name: "description", content: "Crea y gestiona sesiones de entrenamiento cronometradas." },
      { property: "og:title", content: "Sesiones de entrenamiento — C.B.R.V" },
      { property: "og:description", content: "Crea y gestiona sesiones de entrenamiento cronometradas." },
    ],
  }),
  component: PracticeList,
});

function PracticeList() {
  const navigate = useNavigate();
  async function create() {
    const p = await createPractice("Nueva sesión");
    navigate({ to: "/practice/$id", params: { id: p.id } });
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sesiones de entrenamiento</h1>
        <Button className="h-11 font-semibold shadow-glow" onClick={create}>
          <Plus className="h-5 w-5" /> Nueva
        </Button>
      </div>
      <PracticeListItems />
      <SharedPracticeListItems />
    </div>
  );
}
