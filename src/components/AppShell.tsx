import { Link, Outlet } from "@tanstack/react-router";
import { BookOpen, ClipboardList, LayoutGrid, UserRound } from "lucide-react";

const NAV = [
  { to: "/drills", label: "Ejercicios", long: "Banco de ejercicios", icon: LayoutGrid },
  { to: "/practice", label: "Sesiones", long: "Crear sesión", icon: ClipboardList },
  { to: "/club", label: "Club", long: "Filosofía del club", icon: BookOpen },
  { to: "/profile", label: "Perfil", long: "Mi perfil", icon: UserRound },
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img src="/icon-512.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="font-display text-lg font-bold uppercase tracking-wide">C.B.R.V</span>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-primary" }}
            >
              <n.icon className="h-5 w-5" />
              {n.long}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-8">
        <Outlet />
      </main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center gap-1 py-3 text-xs font-semibold text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <n.icon className="h-6 w-6" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
