import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo-villa-forno.png";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("villa-forno-auth");
      if (raw && JSON.parse(raw).state?.user) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("admin@villaforno.com");
  const [password, setPassword] = useState("123");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("Bem-vindo ao Villa Forno");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-secondary px-4">
      <Card className="w-full max-w-md border-border/60 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Villa Forno" className="h-20 w-20 object-contain mb-2" />
            <h1 className="text-2xl font-bold tracking-tight">VILLA FORNO</h1>
            <p className="text-sm text-muted-foreground">Mini ERP para pizzaria</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Mock de autenticação · pronto para Supabase
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}