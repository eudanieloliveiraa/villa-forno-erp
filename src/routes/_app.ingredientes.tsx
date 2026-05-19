import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { useErp } from "@/store/erp";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/utils/calc";
import type { Ingredient, Unit } from "@/types";

export const Route = createFileRoute("/_app/ingredientes")({
  component: IngredientsPage,
});

const units: Unit[] = ["kg", "g", "litro", "ml", "un"];

const empty: Omit<Ingredient, "id"> = {
  name: "", category: "", unit: "kg", stock: 0, minStock: 0, costPerUnit: 0, supplier: "",
};

function IngredientsPage() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } = useErp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<Omit<Ingredient, "id">>(empty);

  const categories = useMemo(
    () => Array.from(new Set(ingredients.map((i) => i.category))),
    [ingredients],
  );

  const filtered = ingredients.filter(
    (i) =>
      (cat === "all" || i.category === cat) &&
      i.name.toLowerCase().includes(q.toLowerCase()),
  );

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (i: Ingredient) => { setEditing(i); const { id: _id, ...rest } = i; void _id; setForm(rest); setOpen(true); };

  const save = () => {
    if (!form.name) return toast.error("Nome obrigatório");
    if (editing) {
      updateIngredient(editing.id, form);
      toast.success("Ingrediente atualizado");
    } else {
      addIngredient(form);
      toast.success("Ingrediente criado");
    }
    setOpen(false);
  };

  return (
    <>
      <Header title="Ingredientes" subtitle="Estoque de insumos" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Buscar ingrediente..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Editar" : "Novo"} ingrediente</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                  <div><Label>Unidade</Label>
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as Unit })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{units.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Estoque</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
                  <div><Label>Estoque mínimo</Label><Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} /></div>
                  <div><Label>Custo por {form.unit}</Label><Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: +e.target.value })} /></div>
                  <div><Label>Fornecedor</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={save}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Nome</th>
                  <th>Categoria</th><th>Unid.</th>
                  <th className="text-right">Estoque</th>
                  <th className="text-right">Mínimo</th>
                  <th className="text-right">Custo</th>
                  <th>Fornecedor</th>
                  <th className="text-right pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const low = i.stock <= i.minStock;
                  return (
                    <tr key={i.id} className="border-b border-border/40 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="text-muted-foreground">{i.category}</td>
                      <td className="text-muted-foreground">{i.unit}</td>
                      <td className="text-right">
                        <span className={low ? "text-amber-400 inline-flex items-center gap-1" : ""}>
                          {low && <AlertTriangle className="h-3 w-3" />} {i.stock}
                        </span>
                      </td>
                      <td className="text-right text-muted-foreground">{i.minStock}</td>
                      <td className="text-right">{brl(i.costPerUnit)}</td>
                      <td className="text-muted-foreground">{i.supplier}</td>
                      <td className="text-right pr-4">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { removeIngredient(i.id); toast.success("Removido"); }}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Nenhum ingrediente</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}