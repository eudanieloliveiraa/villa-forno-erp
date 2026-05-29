import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useErp } from "@/store/erp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { brl, marginColor, pct, productCostBreakdown, productMetrics } from "@/utils/calc";
import type { Product, ProductIngredient } from "@/types";

export const Route = createFileRoute("/_app/produtos")({
  component: ProductsPage,
});

const empty: Omit<Product, "id"> = {
  name: "", category: "", size: "Grande", price: 0, ingredients: [],
};

function ProductsPage() {
  const { products, ingredients, addProduct, updateProduct, removeProduct } = useErp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(empty);
  const [expanded, setExpanded] = useState<string | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); const { id: _id, ...rest } = p; void _id; setForm({ ...rest, ingredients: [...rest.ingredients] }); setOpen(true); };

  const addIng = () => {
    const first = ingredients[0];
    if (!first) return toast.error("Cadastre ingredientes primeiro");
    setForm({ ...form, ingredients: [...form.ingredients, { ingredientId: first.id, quantity: 0 }] });
  };
  const updIng = (idx: number, patch: Partial<ProductIngredient>) => {
    const copy = [...form.ingredients];
    copy[idx] = { ...copy[idx], ...patch };
    setForm({ ...form, ingredients: copy });
  };
  const rmIng = (idx: number) =>
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });

  const save = () => {
    if (!form.name) return toast.error("Nome obrigatório");
    if (editing) { updateProduct(editing.id, form); toast.success("Produto atualizado"); }
    else { addProduct(form); toast.success("Produto criado"); }
    setOpen(false);
  };

  return (
    <>
      <Header title="Produtos" subtitle="Pizzas e ficha técnica" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova pizza</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} pizza</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>Tamanho</Label><Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></div>
                <div className="col-span-2"><Label>Preço de venda</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Ingredientes</Label>
                  <Button size="sm" variant="outline" onClick={addIng}><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {form.ingredients.map((pi, idx) => {
                    const ing = ingredients.find((i) => i.id === pi.ingredientId);
                    const subUnit = ing?.unit === "kg" ? "g" : ing?.unit === "litro" ? "ml" : ing?.unit ?? "";
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <Select value={pi.ingredientId} onValueChange={(v) => updIng(idx, { ingredientId: v })}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{ingredients.map((i) => (<SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <Input type="number" className="w-24" value={pi.quantity} onChange={(e) => updIng(idx, { quantity: +e.target.value })} />
                        <span className="text-xs text-muted-foreground w-8">{subUnit}</span>
                        <Button size="icon" variant="ghost" onClick={() => rmIng(idx)}><X className="h-4 w-4" /></Button>
                      </div>
                    );
                  })}
                  {form.ingredients.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sem ingredientes</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const { cost, profit, cmv, margin } = productMetrics(p, ingredients);
            const breakdown = productCostBreakdown(p, ingredients);
            const isOpen = expanded === p.id;
            return (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.size}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { removeProduct(p.id); toast.success("Removido"); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-xs text-muted-foreground">Preço</div><div className="font-semibold">{brl(p.price)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Custo</div><div className="font-semibold">{brl(cost)}</div></div>
                    <div><div className="text-xs text-muted-foreground">CMV</div><div className={`font-semibold ${marginColor(1 - cmv)}`}>{pct(cmv)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Margem</div><div className={`font-semibold ${marginColor(margin)}`}>{pct(margin)}</div></div>
                    <div className="col-span-2 pt-2 border-t border-border"><div className="text-xs text-muted-foreground">Lucro bruto</div><div className="font-bold text-emerald-400">{brl(profit)}</div></div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : p.id)}
                      className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <span>
                        {p.ingredients.length} ingrediente
                        {p.ingredients.length !== 1 && "s"} · ver CMV
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                          <span>Custo total</span>
                          <span className="text-center">CMV</span>
                          <span className="text-right">Margem</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                          <span>{brl(cost)}</span>
                          <span className={`text-center ${marginColor(1 - cmv)}`}>{pct(cmv)}</span>
                          <span className={`text-right ${marginColor(margin)}`}>{pct(margin)}</span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {breakdown.map((b) => (
                            <div key={b.ingredientId} className="space-y-0.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {b.name}{" "}
                                  <span className="text-[10px]">
                                    ({b.quantity}
                                    {b.unitLabel})
                                  </span>
                                </span>
                                <span className="font-medium">{brl(b.cost)}</span>
                              </div>
                              <div className="h-1 rounded bg-secondary overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${Math.min(100, b.share * 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          {breakdown.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Sem ficha técnica
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border text-sm">
                          <span className="text-muted-foreground">Lucro bruto</span>
                          <span className="font-bold text-emerald-400">{brl(profit)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}