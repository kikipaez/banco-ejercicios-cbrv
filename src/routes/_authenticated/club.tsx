import { createFileRoute } from "@tanstack/react-router";
import { Ban, BookOpen, ClipboardCheck, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/_authenticated/club")({
  head: () => ({
    meta: [
      { title: "Filosofía del club — C.B.R.V" },
      { name: "description", content: "Decálogo de los entrenadores, manual de juego básico y objetivos por categoría del C.B. Rincón de la Victoria." },
      { property: "og:title", content: "Filosofía del club — C.B.R.V" },
      { property: "og:description", content: "Decálogo de los entrenadores, manual de juego básico y objetivos por categoría del C.B. Rincón de la Victoria." },
    ],
  }),
  component: ClubPage,
});

const DECALOGO = [
  { titulo: "Entrena con ilusión", texto: "Y sobre todo, transmítela." },
  { titulo: "Da ejemplo", texto: "A tus jugadores/as con tus actitudes y comportamientos. Sé el primero en llegar y el último en salir." },
  { titulo: "Organiza y planifica", texto: "La temporada con la mayor atención al detalle: esto va a marcar la diferencia." },
  { titulo: "Fórmate", texto: "Para ser el mejor o la mejor entrenador/a que puedan tener es@s chic@s. El aprendizaje es continuo y si un@ lo persigue nunca se para." },
  { titulo: "Implícate al 100% en la sesión", texto: "No cojo el móvil, no me siento, no me ausento… Doy ritmo al entrenamiento, siempre tengo un balón en la mano por si hiciera falta meterlo en juego." },
  { titulo: "La formación y el crecimiento", texto: "De l@s jugadores/as es mucho más importante que cualquier resultado." },
  { titulo: "Acércate a los jugadores", texto: "Escúchales, anímales y trata de ayudarles a solucionar sus frustraciones propias del juego o de lo que traen de casa." },
  { titulo: "Planifica los objetivos", texto: "De la sesión y de cada tarea para conseguir ese nivel de detalle." },
  { titulo: "Lidera el equipo de una forma positiva", texto: "Que todos los miembros del equipo sientan que se les ayuda." },
  { titulo: "Disfruta y vive este deporte con pasión", texto: "Es la única forma de conseguir nuestros objetivos." },
];

const MANUAL = [
  "Enseñar los conceptos básicos de técnica y táctica individual con balón y sin balón.",
  "Defensa individual a todo campo. Si me superan en 1x1 a toda cancha, saltar y cambiar.",
  "Salida de presión por espacios y con conceptos de técnica y táctica individual. Correr abiertos.",
  "Atacar con juego libre por conceptos: abiertos, triple amenaza, tirar, 1x1, si salta ayuda pasar…",
  "Ir a rebote en ambas canastas.",
  "Bajar a defender parando balón.",
];

const MANUAL_NO = [
  "Hacer zonas.",
  "Poner bloqueos.",
  "Querer que mejoren sólo unos pocos: convocatorias de todos los jugadores posibles.",
];

const PREMINI = [
  {
    titulo: "Dinámica de grupo",
    texto: "Que los jugadores se ilusionen y enganchen con l@s entrenadores/as y con el grupo.",
  },
  {
    titulo: "Técnicos",
    texto: "En ataque, aprender mecánica de tiro para tirar a tablero y lanzamientos de media distancia. Entradas y bandejas a canasta con derecha e izquierda. Bote con izquierda y derecha en movimiento. Cambios por delante y por la espalda (corro, freno, cambio, corro cambiando la dirección) y no cambios. Pases al compañero, fuerte directo y picado. Pases a una mano. Agarrar balones sueltos con dos manos (evitar bote para control de balón). Aprender la posición de triple amenaza. Pivotar de forma solvente. Aprender a hacer buenas paradas en un tiempo. En defensa, buen posicionamiento defensivo (la espalda a la canasta).",
  },
  {
    titulo: "Tácticos",
    texto: "Jugar con solvencia el 1x1. Jugar lo más abierto posible. En saque de banda y fondo jugar con cortes hacia la canasta. Cuando juego sin balón y estoy sólo me sitúo lo más cerca del aro para anotar. Correr contraataques abiertos (jug. sin balón por banda, balón decide carril). Aprender a defender siempre a toda cancha. Si estoy bien colocado, utilización de manos. Si balón entra en la zona, defender con torso. Parar balón (jug más cercano) cuando se pierde la posesión y ajustar los demás compañeros con el resto. Tras saque de fondo o banda ajustar cada jugador con su asignación. NO zonas, zonas press, ni bloqueos.",
  },
  {
    titulo: "Físicos",
    texto: "Mejorar técnica de carrera a través de ejercicios como el skipping, contraskipping, desplazamiento lateral, carrera para atrás… Trabajar CORE a través de las planchas. Reptar, trepar por espalderas (con seguridad), saltar, girar, sentarse y levantarse.",
  },
];

function Section({ icon: Icon, titulo, children }: { icon: typeof BookOpen; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-primary">
        <Icon className="h-5 w-5" />
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function ClubPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Filosofía del club</h1>
        <p className="text-muted-foreground">
          Los principios que compartimos todos los entrenadores del C.B. Rincón de la Victoria.
        </p>
      </header>

      <Section icon={HeartHandshake} titulo="Decálogo de l@s entrenadores">
        <ol className="space-y-3">
          {DECALOGO.map((d, i) => (
            <li key={i} className="flex gap-3 rounded-xl border bg-card p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">
                <strong className="font-semibold">{d.titulo}.</strong> {d.texto}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={BookOpen} titulo="Manual de juego básico · Nivel iniciante">
        <ul className="space-y-2">
          {MANUAL.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-xl border bg-card p-4 text-sm leading-relaxed">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {m}
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
            <Ban className="h-4 w-4" /> No se puede
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {MANUAL_NO.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section icon={ClipboardCheck} titulo="Objetivos por categoría · Premini">
        <div className="grid gap-3 sm:grid-cols-2">
          {PREMINI.map((p) => (
            <div key={p.titulo} className="rounded-xl border bg-card p-4">
              <h3 className="mb-2 font-display text-base font-semibold uppercase tracking-wide text-primary">
                {p.titulo}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
