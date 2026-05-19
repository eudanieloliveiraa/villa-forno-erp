export type Unit = "kg" | "g" | "litro" | "ml" | "un";

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: Unit;
  stock: number;
  minStock: number;
  costPerUnit: number; // custo por unidade base (kg, l, un)
  supplier: string;
}

export interface ProductIngredient {
  ingredientId: string;
  quantity: number; // em g/ml/un — sempre em unidade base do ingrediente menor
}

export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  ingredients: ProductIngredient[];
}

export type MovementType = "entrada" | "saida" | "ajuste";

export interface StockMovement {
  id: string;
  date: string; // ISO
  ingredientId: string;
  type: MovementType;
  quantity: number;
  note?: string;
}

export type FinanceType = "receita" | "despesa";
export type FinanceCategory =
  | "vendas"
  | "fornecedores"
  | "aluguel"
  | "energia"
  | "funcionarios"
  | "marketing"
  | "outros";

export interface FinanceEntry {
  id: string;
  date: string; // ISO
  type: FinanceType;
  category: FinanceCategory;
  description: string;
  amount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}