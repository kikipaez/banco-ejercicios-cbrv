import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Drill = Tables<"drills">;
export type Practice = Tables<"practices">;
export type PracticeBlock = Tables<"practice_blocks">;
export type Profile = Tables<"profiles">;

export const AGE_GROUPS = ["Babybasket", "Premini", "Benjamín", "Alevín", "Infantil", "Cadete", "Júnior", "Sénior"] as const;
export const CATEGORIES = [
  "Offense",
  "Defense",
  "Transition",
  "Warmup",
  "Shooting",
  "Ball Handling",
  "Footwork",
  "Press Break",
] as const;
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

const LABELS: Record<string, string> = {
  All: "Todos", Senior: "Sénior",
  Offense: "Ataque", Defense: "Defensa", Transition: "Transición", Warmup: "Calentamiento",
  Shooting: "Tiro", "Ball Handling": "Manejo de balón", Footwork: "Juego de pies", "Press Break": "Romper presión",
  Beginner: "Iniciación", Intermediate: "Intermedio", Advanced: "Avanzado",
};
/** Spanish display label for stored filter values. */
export const t = (v: string) => LABELS[v] ?? v;

export const lines = (text: string | null | undefined) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

export const drillsQuery = queryOptions({
  queryKey: ["drills"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("drills")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const drillQuery = (id: string) =>
  queryOptions({
    queryKey: ["drill", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("drills").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const commentsQuery = (drillId: string) =>
  queryOptions({
    queryKey: ["comments", drillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drill_comments")
        .select("*")
        .eq("drill_id", drillId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const practicesQuery = queryOptions({
  queryKey: ["practices"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("practices")
      .select("*, practice_blocks(minutes)")
      .eq("user_id", u.user?.id ?? "")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const sharedPracticesQuery = queryOptions({
  queryKey: ["practices", "shared"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("practices")
      .select("*, practice_blocks(minutes)")
      .eq("is_shared_with_club", true)
      .neq("user_id", u.user?.id ?? "")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const ids = [...new Set(data.map((p) => p.user_id))];
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, full_name").in("id", ids)
      : { data: [] as { id: string; full_name: string }[] };
    const names = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
    return data.map((p) => ({ ...p, author: names.get(p.user_id) || "Entrenador/a" }));
  },
});

export async function diagramDownloadUrl(path: string) {
  const name = path.split("/").pop() ?? "diagrama";
  const { data, error } = await supabase.storage.from("diagrams").createSignedUrl(path, 60, { download: `diagrama-${name}` });
  if (error) throw error;
  return data.signedUrl;
}

export const MAX_DIAGRAM_BYTES = 5 * 1024 * 1024;

export const practiceQuery = (id: string) =>
  queryOptions({
    queryKey: ["practice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select("*, practice_blocks(*, drills(id, title, youtube_url, diagram_path))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (data) data.practice_blocks.sort((a, b) => a.position - b.position);
      return data;
    },
  });

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.user.id)
      .maybeSingle();
    if (error) throw error;
    return { ...(data ?? { id: u.user.id, full_name: "", team: "", age_group: "", created_at: "", username: "" }), email: u.user.email ?? "" };
  },
});

export async function diagramUrl(path: string) {
  const { data, error } = await supabase.storage.from("diagrams").createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export const isPdf = (path: string) => path.toLowerCase().endsWith(".pdf");
