import type {
  Ingredient,
  Product,
  StockMovement,
  FinanceEntry,
} from "@/types";

export const mockIngredients: Ingredient[] = [
  { id: "i1", name: "Mussarela", category: "Queijos", unit: "kg", stock: 12, minStock: 5, costPerUnit: 42, supplier: "Laticínios Bella" },
  { id: "i2", name: "Calabresa", category: "Carnes", unit: "kg", stock: 6, minStock: 4, costPerUnit: 38, supplier: "Frigorífico Sul" },
  { id: "i3", name: "Molho de Tomate", category: "Molhos", unit: "litro", stock: 8, minStock: 3, costPerUnit: 14, supplier: "Pomodoro" },
  { id: "i4", name: "Farinha 00", category: "Secos", unit: "kg", stock: 25, minStock: 10, costPerUnit: 9, supplier: "Moinho Italiano" },
  { id: "i5", name: "Manjericão", category: "Hortifruti", unit: "un", stock: 3, minStock: 5, costPerUnit: 2.5, supplier: "Horta Verde" },
  { id: "i6", name: "Azeite Extra Virgem", category: "Óleos", unit: "litro", stock: 4, minStock: 2, costPerUnit: 55, supplier: "Olivar" },
  { id: "i7", name: "Presunto Parma", category: "Carnes", unit: "kg", stock: 2, minStock: 2, costPerUnit: 180, supplier: "Frigorífico Sul" },
];

// quantidades em unidade base menor: kg→g, litro→ml, un→un
export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Calabresa",
    category: "Tradicional",
    size: "Grande",
    price: 59.9,
    ingredients: [
      { ingredientId: "i1", quantity: 120 },
      { ingredientId: "i2", quantity: 80 },
      { ingredientId: "i3", quantity: 30 },
      { ingredientId: "i4", quantity: 180 },
    ],
  },
  {
    id: "p2",
    name: "Margherita",
    category: "Clássica",
    size: "Grande",
    price: 64.9,
    ingredients: [
      { ingredientId: "i1", quantity: 140 },
      { ingredientId: "i3", quantity: 40 },
      { ingredientId: "i4", quantity: 180 },
      { ingredientId: "i5", quantity: 1 },
      { ingredientId: "i6", quantity: 10 },
    ],
  },
  {
    id: "p3",
    name: "Parma",
    category: "Especial",
    size: "Grande",
    price: 89.9,
    ingredients: [
      { ingredientId: "i1", quantity: 120 },
      { ingredientId: "i7", quantity: 80 },
      { ingredientId: "i3", quantity: 30 },
      { ingredientId: "i4", quantity: 180 },
      { ingredientId: "i6", quantity: 10 },
    ],
  },
];

const today = new Date();
const d = (offset: number) =>
  new Date(today.getTime() - offset * 86400000).toISOString();

export const mockMovements: StockMovement[] = [
  { id: "m1", date: d(0), ingredientId: "i1", type: "entrada", quantity: 5, note: "Compra semanal" },
  { id: "m2", date: d(1), ingredientId: "i2", type: "saida", quantity: 1.2, note: "Produção" },
  { id: "m3", date: d(2), ingredientId: "i3", type: "entrada", quantity: 3 },
  { id: "m4", date: d(3), ingredientId: "i4", type: "saida", quantity: 4 },
];

export const mockFinance: FinanceEntry[] = [
  { id: "f1", date: d(1), type: "receita", category: "vendas", description: "Vendas balcão", amount: 3850 },
  { id: "f2", date: d(3), type: "receita", category: "vendas", description: "Vendas delivery", amount: 5200 },
  { id: "f3", date: d(5), type: "despesa", category: "fornecedores", description: "Laticínios Bella", amount: 1200 },
  { id: "f4", date: d(8), type: "despesa", category: "aluguel", description: "Aluguel loja", amount: 4500 },
  { id: "f5", date: d(10), type: "despesa", category: "energia", description: "Conta de luz", amount: 980 },
  { id: "f6", date: d(12), type: "despesa", category: "funcionarios", description: "Folha", amount: 8200 },
  { id: "f7", date: d(15), type: "receita", category: "vendas", description: "Vendas balcão", amount: 4700 },
  { id: "f8", date: d(20), type: "despesa", category: "marketing", description: "Ads Instagram", amount: 600 },
];