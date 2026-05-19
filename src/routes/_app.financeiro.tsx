import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/MetricCard";
import { useErp } from "@/store/erp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { brl } from "@/utils/calc";
import { toast } from "sonner";
import type { FinanceCategory, FinanceEntry, FinanceType } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_app/financeiro")({
  component: FinancePage,
});

const categories: FinanceCategory[] = ["vendas", "fornecedores", "aluguel", "energia", "funcionarios", "marketing", "outros"];

const empty: Omit<FinanceEntry, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  type: "receita",
  category: "vendas",
  description: "",
  amount: 0,
};

function FinancePage() {
  const { finance, addFinance, removeFinance } = useErp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<FinanceEntry, "id">>(empty);

  const totalRec = finance.filter((f) => f.type === "receita").reduce((s, f) => s + f.amount, 0);
  const totalDes = finance.filter((f) => f.type === "despesa").reduce((s, f) => s + f.amount, 0);
  const lucro = totalRec - totalDes;

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(); const y = d.getFullYear();
    const inMonth = (iso: string) => { const dd = new Date(iso); return dd.getMonth() === m && dd.getFullYear() === y; };
    const rec = finance.filter((f) => f.type === "receita" && inMonth(f.date)).reduce((s, f) => s + f.amount, 0);
    const des = finance.filter((f) => f.type === "despesa" && inMonth(f.date)).reduce((s, f) => s + f.amount, 0);
    return { label: d.toLocaleDateString("pt-BR", { month: "short" }), receitas: rec, despesas: des };
  });

  const save = () => {
    if (!form.description || form.amount <= 0) return toast.error("Preencha descrição e valor");
    addFinance({ ...form, date: new Date(form.date).toISOString() });
    toast.success("Lançamento criado");
    setForm(empty); setOpen(false);
  };

  return (
    <>
      <Header title="Financeiro" subtitle="Receitas, despesas e lucro" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Receitas" value={brl(totalRec)} icon={TrendingUp} tone="success" />
          <MetricCard label="Despesas" value={brl(totalDes)} icon={TrendingDown} tone="warning" />
          <MetricCard label="Lucro operacional" value={brl(lucro)} icon={Wallet} tone="primary" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Receitas x Despesas (6 meses)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} formatter={(v: number) => brl(v)} />
                <Bar dataKey="receitas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Lançamentos</h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Novo</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Tipo</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as FinanceType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Categoria</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as FinanceCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Label>Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div><Label>Data</Label><Input type="date" value={form.date.slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                    <div><Label>Valor</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={save}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th>
                  <th className="text-right">Valor</th><th></th>
                </tr>
              </thead>
              <tbody>
                {finance.map((f) => (
                  <tr key={f.id} className="border-b border-border/40">
                    <td className="py-2">{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                    <td>{f.description}</td>
                    <td className="text-muted-foreground">{f.category}</td>
                    <td><span className={f.type === "receita" ? "text-emerald-400" : "text-red-400"}>{f.type}</span></td>
                    <td className="text-right">{brl(f.amount)}</td>
                    <td className="text-right"><Button size="icon" variant="ghost" onClick={() => removeFinance(f.id)}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}