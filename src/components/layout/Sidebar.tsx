import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Pizza,
  ArrowLeftRight,
  Wallet,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo-villa-forno.png";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ingredientes", label: "Ingredientes", icon: Package },
  { to: "/produtos", label: "Produtos", icon: Pizza },
  { to: "/estoque", label: "Estoque", icon: ArrowLeftRight },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  const logout = useAuth((s) => s.logout);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <img src={logo} alt="Villa Forno" className="h-10 w-10 object-contain" />
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide">VILLA FORNO</div>
          <div className="text-[10px] uppercase text-muted-foreground">Mini ERP</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </aside>
  );
}