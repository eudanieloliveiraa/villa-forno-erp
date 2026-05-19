import type { Ingredient, Product } from "@/types";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const pct = (n: number) =>
  `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/**
 * Custo por unidade BASE menor:
 * - kg → custo por grama  = costPerUnit / 1000
 * - litro → por ml         = costPerUnit / 1000
 * - g, ml, un → mantém
 */
export function unitCostBase(ing: Ingredient): number {
  switch (ing.unit) {
    case "kg":
    case "litro":
      return ing.costPerUnit / 1000;
    default:
      return ing.costPerUnit;
  }
}

export function productCost(product: Product, ingredients: Ingredient[]) {
  return product.ingredients.reduce((sum, pi) => {
    const ing = ingredients.find((i) => i.id === pi.ingredientId);
    if (!ing) return sum;
    return sum + unitCostBase(ing) * pi.quantity;
  }, 0);
}

export function productMetrics(product: Product, ingredients: Ingredient[]) {
  const cost = productCost(product, ingredients);
  const profit = product.price - cost;
  const cmv = product.price > 0 ? cost / product.price : 0;
  const margin = product.price > 0 ? profit / product.price : 0;
  return { cost, profit, cmv, margin };
}

export function inventoryValue(ingredients: Ingredient[]) {
  return ingredients.reduce((s, i) => s + i.stock * i.costPerUnit, 0);
}

export function lowStock(ingredients: Ingredient[]) {
  return ingredients.filter((i) => i.stock <= i.minStock);
}

export function marginColor(margin: number) {
  if (margin >= 0.6) return "text-emerald-400";
  if (margin >= 0.4) return "text-amber-400";
  return "text-red-400";
}