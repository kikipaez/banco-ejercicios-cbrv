import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AGE_GROUPS, CATEGORIES, DIFFICULTIES, t } from "@/lib/drills";
import { getYouTubeId } from "@/lib/youtube";
import { Pill, VideoEmbed } from "./drill-ui";

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/**
 * Automatically compresses large phone photos (whiteboards/court diagrams) to ~120KB WebP
 * so coaches never hit the 5MB limit and Supabase's 1GB free storage lasts for thousands of drills.
 */
async function compressImageIfNeeded(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (file.type === "application/pdf") {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("El PDF no puede superar 5 MB");
    }
    return { blob: file, ext: "pdf", contentType: "application/pdf" };
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("El diagrama debe ser PDF o imagen");
  }

  // If image is already tiny (< 300 KB), keep as-is
  if (file.size <= 300 * 1024) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    return { blob: file, ext, contentType: file.type };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ blob: file, ext: "jpg", contentType: file.type });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo procesar la imagen"));
            return;
          }
          resolve({ blob, ext: "webp", contentType: "image/webp" });
        },
        "image/webp",
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen seleccionada"));
    };

    img.src = objectUrl;
  });
}

export function UploadDrillDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [ages, setAges] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("Beginner");
  const [durationInput, setDurationInput] = useState("10");
  const [players, setPlayers] = useState("");
  const [setup, setSetup] = useState("");
  const [execution, setExecution] = useState("");
  const [points, setPoints] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const videoId = getYouTubeId(url);

  function reset() {
    setTitle("");
    setUrl("");
    setAges([]);
    setCats([]);
    setDifficulty("Beginner");
    setDurationInput("10");
    setPlayers("");
    setSetup("");
    setExecution("");
    setPoints("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoId) {
      toast.error("Pega un enlace de YouTube válido");
      return;
    }
    if (!ages.length || !cats.length) {
      toast.error("Elige al menos una categoría de edad y un tipo");
      return;
    }
    const parsedDuration = Math.max(1, parseInt(durationInput, 10) || 10);

    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
      let diagram_path: string | null = null;

      if (file) {
        const { blob, ext, contentType } = await compressImageIfNeeded(file);
        diagram_path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("diagrams").upload(diagram_path, blob, { contentType });
        if (error) throw error;
      }

      const { error } = await supabase.from("drills").insert({
        title: title.trim(),
        youtube_url: url.trim(),
        age_groups: ages,
        categories: cats,
        difficulty,
        duration_minutes: parsedDuration,
        players_needed: players.trim(),
        setup,
        execution,
        coaching_points: points,
        diagram_path,
        author_id: uid,
        author_name: prof?.full_name || "Entrenador",
      });
      if (error) throw error;

      toast.success("Ejercicio subido correctamente");
      qc.invalidateQueries({ queryKey: ["drills"] });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Subir nuevo ejercicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título del ejercicio">
            <Input className="h-11" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Enlace de YouTube (oculto o Shorts)">
            <Input
              className="h-11"
              required
              placeholder="https://youtu.be/... o youtube.com/shorts/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {url &&
              (videoId ? (
                <div className="mt-2">
                  <VideoEmbed url={url} title="Vista previa" />
                </div>
              ) : (
                <p className="mt-1 text-sm text-destructive">Eso no parece un enlace de YouTube válido.</p>
              ))}
          </Field>
          <Field label="Categorías de edad">
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((a) => (
                <Pill key={a} active={ages.includes(a)} onClick={() => setAges(toggle(ages, a))}>
                  {t(a)}
                </Pill>
              ))}
            </div>
          </Field>
          <Field label="Tipo de ejercicio">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Pill key={c} active={cats.includes(c)} onClick={() => setCats(toggle(cats, c))}>
                  {t(c)}
                </Pill>
              ))}
            </div>
          </Field>
          <Field label="Dificultad">
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                  {t(d)}
                </Pill>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duración (min)">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={120}
                className="h-11"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
              />
            </Field>
            <Field label="Jugadores necesarios">
              <Input
                className="h-11"
                placeholder="ej. 8 (4c4)"
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
              />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">Un punto por línea: cada línea será una viñeta.</p>
          <Field label="Organización">
            <Textarea rows={3} value={setup} onChange={(e) => setSetup(e.target.value)} />
          </Field>
          <Field label="Desarrollo">
            <Textarea rows={3} value={execution} onChange={(e) => setExecution(e.target.value)} />
          </Field>
          <Field label="Puntos clave">
            <Textarea rows={3} value={points} onChange={(e) => setPoints(e.target.value)} />
          </Field>
          <Field label="Diagrama de pista (PDF o foto de pizarra)">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 justify-start truncate font-normal"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? file.name : "Elegir PDF o hacer foto…"}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 px-3 text-destructive"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Quitar
                </Button>
              )}
            </div>
          </Field>
          <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={busy}>
            {busy ? "Subiendo…" : "Subir ejercicio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}