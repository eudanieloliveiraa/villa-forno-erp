import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/MetricCard";
import { useErp } from "@/store/erp";
import { brl, inventoryValue, lowStock, productMetrics } from "@/utils/calc";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { ingredients, products, movements, finance } = useErp();

  const month = new Date().getMonth();
  const monthRevenue = finance
    .filter((f) => f.type === "receita" && new Date(f.date).getMonth() === month)
    .reduce((s, f) => s + f.amount, 0);
  const monthExpense = finance
    .filter((f) => f.type === "despesa" && new Date(f.date).getMonth() === month)
    .reduce((s, f) => s + f.amount, 0);
  const monthProfit = monthRevenue - monthExpense;

  const cmvAvg =
    products.length === 0
      ? 0
      : products.reduce(
          (s, p) => s + productMetrics(p, ingredients).cmv,
          0,
        ) / products.length;

  const low = lowStock(ingredients);
  const stockValue = inventoryValue(ingredients);

  // Entradas x Saídas por dia (últimos 7)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const entradas = movements
      .filter((m) => m.type === "entrada" && m.date.startsWith(key))
      .reduce((s, m) => s + m.quantity, 0);
    const saidas = movements
      .filter((m) => m.type === "saida" && m.date.startsWith(key))
      .reduce((s, m) => s + m.quantity, 0);
    return { label, entradas, saidas };
  });

  // Lucro mensal últimos 6 meses
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const inMonth = (iso: string) => {
      const dd = new Date(iso);
      return dd.getMonth() === m && dd.getFullYear() === y;
    };
    const rec = finance.filter((f) => f.type === "receita" && inMonth(f.date)).reduce((s, f) => s + f.amount, 0);
    const des = finance.filter((f) => f.type === "despesa" && inMonth(f.date)).reduce((s, f) => s + f.amount, 0);
    return {
      label: d.toLocaleDateString("pt-BR", { month: "short" }),
      lucro: rec - des,
    };
  });

  const recent = [...movements].slice(0, 6);

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral da operação" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Faturamento (mês)" value={brl(monthRevenue)} icon={DollarSign} tone="success" />
          <MetricCard label="CMV médio" value={`${(cmvAvg * 100).toFixed(1)}%`} icon={Percent} tone="primary" />
          <MetricCard label="Lucro bruto (mês)" value={brl(monthProfit)} icon={TrendingUp} tone="success" />
          <MetricCard label="Valor em estoque" value={brl(stockValue)} icon={Package} />
          <MetricCard label="Estoque baixo" value={`${low.length} itens`} icon={AlertTriangle} tone="warning" hint={low.slice(0, 2).map((i) => i.name).join(", ")} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Entradas x Saídas (7d)</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="entradas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lucro mensal (6m)</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} formatter={(v: number) => brl(v)} />
                  <Line type="monotone" dataKey="lucro" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Últimas movimentações</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Data</th><th>Ingrediente</th><th>Tipo</th><th className="text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => {
                  const ing = ingredients.find((i) => i.id === m.ingredientId);
                  return (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                      <td>{ing?.name ?? "—"}</td>
                      <td>
                        <span className={
                          m.type === "entrada" ? "text-emerald-400" :
                          m.type === "saida" ? "text-red-400" : "text-amber-400"
                        }>{m.type}</span>
                      </td>
                      <td className="text-right">{m.quantity} {ing?.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}