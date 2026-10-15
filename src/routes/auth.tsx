import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { baseUsernameFromName, isValidPin, normalizeUsername, pinToPassword, usernameToEmail } from "@/lib/pin-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Banco de Ejercicios C.B.R.V" },
      { name: "description", content: "Acceso de entrenadores al Banco de Ejercicios C.B.R.V." },
      { property: "og:title", content: "Iniciar sesión — Banco de Ejercicios C.B.R.V" },
      { property: "og:description", content: "Acceso de entrenadores al Banco de Ejercicios C.B.R.V." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPin(pin)) return void toast.error("El PIN debe tener 4 números");
    setBusy(true);
    try {
      let user = normalizeUsername(username);
      if (mode === "up") {
        const base = baseUsernameFromName(name);
        if (base.length < 2) throw new Error("Escribe tu nombre y apellido");
        const { data: next, error: rpcErr } = await supabase.rpc("next_username", { _base: base });
        if (rpcErr || !next) throw new Error("No se pudo generar el usuario");
        user = next;
      } else if (user.length < 3) {
        throw new Error("El usuario debe tener al menos 3 letras o números");
      }
      const email = usernameToEmail(user);
      const password = pinToPassword(pin);
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Usuario o PIN incorrectos");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, username: user } },
        });
        if (error) {
          throw new Error(/registered|exists/i.test(error.message) ? "Ese usuario ya existe" : error.message);
        }
        if (!data.session) throw new Error("No se pudo crear la cuenta");
        toast.success(`Tu usuario es: ${user}`, { description: "Apúntalo para entrar la próxima vez.", duration: 10000 });
      }
      navigate({ to: "/drills" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo ha fallado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/icon-512.png" alt="" width={64} height={64} className="mx-auto mb-4 h-16 w-16 rounded-2xl shadow-glow" />
          <h1 className="text-3xl font-bold">Banco de Ejercicios C.B.R.V</h1>
          <p className="mt-1 text-muted-foreground">Solo entrenadores</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-6">
          {mode === "up" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre y apellido</Label>
              <Input id="name" className="h-12" required placeholder="ej. Enrique Páez" value={name} onChange={(e) => setName(e.target.value)} />
              {baseUsernameFromName(name).length >= 2 && (
                <p className="text-sm text-muted-foreground">
                  Tu usuario será <span className="font-semibold text-foreground">{baseUsernameFromName(name)}</span> (con un número si ya existe)
                </p>
              )}
            </div>
          )}
          {mode === "in" && (
          <div className="space-y-1.5">
            <Label htmlFor="user">Usuario</Label>
            <Input
              id="user"
              className="h-12"
              required
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="ej. jlopez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="pin">PIN (4 números)</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              className="h-12 text-center text-2xl tracking-[0.6em]"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
          <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={busy}>
            {mode === "in" ? "Entrar" : "Crear cuenta"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "¿Entrenador nuevo? Crea una cuenta" : "¿Ya tienes cuenta? Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}
