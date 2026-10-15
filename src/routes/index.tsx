import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banco de Ejercicios C.B.R.V" },
      { name: "description", content: "Consulta ejercicios y crea entrenamientos cronometrados para tu equipo." },
      { property: "og:title", content: "Banco de Ejercicios C.B.R.V" },
      { property: "og:description", content: "Consulta ejercicios y crea entrenamientos cronometrados para tu equipo." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/drills" });
  },
});
