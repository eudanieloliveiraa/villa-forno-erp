import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useErp } from "@/store/erp";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { MovementType } from "@/types";

export const Route = createFileRoute("/_app/estoque")({
  component: StockPage,
});

function StockPage() {
  const { ingredients, movements, addMovement } = useErp();
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");
  const [type, setType] = useState<MovementType>("entrada");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!ingredientId) return toast.error("Selecione um ingrediente");
    if (type !== "ajuste" && quantity <= 0)
      return toast.error("Informe a quantidade");
    if (type === "ajuste" && quantity < 0)
      return toast.error("Estoque final inválido");
    addMovement(ingredientId, type, quantity, note || undefined);
    toast.success(
      type === "ajuste"
        ? `Estoque ajustado para ${quantity}`
        : "Movimentação registrada",
    );
    setQuantity(0); setNote("");
  };

  return (
    <>
      <Header title="Estoque" subtitle="Entradas, saídas e ajustes" />
      <div className="flex-1 overflow-auto p-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold">Nova movimentação</h2>
            <div>
              <Label>Ingrediente</Label>
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ingredients.map((i) => (<SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as MovementType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste (definir estoque)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {type === "ajuste" ? "Estoque final (definir para)" : "Quantidade"}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
              />
              {type === "ajuste" && ingredientId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Atual:{" "}
                  {ingredients.find((i) => i.id === ingredientId)?.stock ?? 0}{" "}
                  {ingredients.find((i) => i.id === ingredientId)?.unit}
                </p>
              )}
            </div>
            <div><Label>Observação</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
            <Button className="w-full" onClick={submit}>Registrar</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Data</th><th>Ingrediente</th><th>Tipo</th>
                  <th className="text-right">Quantidade</th><th className="pr-4">Obs</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const ing = ingredients.find((i) => i.id === m.ingredientId);
                  return (
                    <tr key={m.id} className="border-b border-border/40">
                      <td className="px-4 py-2">{new Date(m.date).toLocaleString("pt-BR")}</td>
                      <td>{ing?.name ?? "—"}</td>
                      <td><span className={
                        m.type === "entrada" ? "text-emerald-400" :
                        m.type === "saida" ? "text-red-400" : "text-amber-400"
                      }>{m.type}</span></td>
                      <td className="text-right">{m.quantity} {ing?.unit}</td>
                      <td className="pr-4 text-muted-foreground">{m.note ?? "—"}</td>
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