import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Ingredient,
  Product,
  StockMovement,
  FinanceEntry,
  MovementType,
} from "@/types";
import {
  mockIngredients,
  mockProducts,
  mockMovements,
  mockFinance,
} from "@/mock/data";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ErpState {
  ingredients: Ingredient[];
  products: Product[];
  movements: StockMovement[];
  finance: FinanceEntry[];

  // ingredients
  addIngredient: (i: Omit<Ingredient, "id">) => void;
  updateIngredient: (id: string, i: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;

  // products
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  // stock
  addMovement: (
    ingredientId: string,
    type: MovementType,
    quantity: number,
    note?: string,
  ) => void;

  // finance
  addFinance: (f: Omit<FinanceEntry, "id">) => void;
  removeFinance: (id: string) => void;

  resetMock: () => void;
}

export const useErp = create<ErpState>()(
  persist(
    (set) => ({
      ingredients: mockIngredients,
      products: mockProducts,
      movements: mockMovements,
      finance: mockFinance,

      addIngredient: (i) =>
        set((s) => ({ ingredients: [...s.ingredients, { ...i, id: uid() }] })),
      updateIngredient: (id, i) =>
        set((s) => ({
          ingredients: s.ingredients.map((x) =>
            x.id === id ? { ...x, ...i } : x,
          ),
        })),
      removeIngredient: (id) =>
        set((s) => ({
          ingredients: s.ingredients.filter((x) => x.id !== id),
        })),

      addProduct: (p) =>
        set((s) => ({ products: [...s.products, { ...p, id: uid() }] })),
      updateProduct: (id, p) =>
        set((s) => ({
          products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      addMovement: (ingredientId, type, quantity, note) =>
        set((s) => {
          const ing = s.ingredients.find((i) => i.id === ingredientId);
          if (!ing) return s;
          const delta =
            type === "entrada"
              ? quantity
              : type === "saida"
                ? -quantity
                : quantity - ing.stock; // ajuste = setar para X
          return {
            ingredients: s.ingredients.map((i) =>
              i.id === ingredientId
                ? { ...i, stock: Math.max(0, i.stock + delta) }
                : i,
            ),
            movements: [
              {
                id: uid(),
                date: new Date().toISOString(),
                ingredientId,
                type,
                quantity,
                note,
              },
              ...s.movements,
            ],
          };
        }),

      addFinance: (f) =>
        set((s) => ({ finance: [{ ...f, id: uid() }, ...s.finance] })),
      removeFinance: (id) =>
        set((s) => ({ finance: s.finance.filter((x) => x.id !== id) })),

      resetMock: () =>
        set({
          ingredients: mockIngredients,
          products: mockProducts,
          movements: mockMovements,
          finance: mockFinance,
        }),
    }),
    { name: "villa-forno-erp" },
  ),
);