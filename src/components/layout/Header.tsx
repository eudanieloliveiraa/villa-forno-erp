import { useAuth } from "@/store/auth";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuth((s) => s.user);
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-bold text-primary-foreground">
          {user?.name?.[0]?.toUpperCase() ?? "V"}
        </div>
      </div>
    </header>
  );
}