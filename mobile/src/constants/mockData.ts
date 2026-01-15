import { MemberData, ProductData } from "../types/scanner.types";

export const clubeHobbyMembers: Record<string, MemberData> = {
  CH001: { id: "CH001", name: "João Silva", cpf: "123.456.789-00", discount: 15 },
  CH002: { id: "CH002", name: "Maria Santos", cpf: "987.654.321-00", discount: 20 },
  CH003: { id: "CH003", name: "Pedro Oliveira", cpf: "456.789.123-00", discount: 10 },
  CH004: { id: "CH004", name: "Ana Costa", cpf: "321.654.987-00", discount: 25 },
  CH005: { id: "CH005", name: "Carlos Ferreira", cpf: "789.123.456-00", discount: 12 },
};

export const inventoryData: Record<string, ProductData> = {
  "7891234567890": { name: "Ração Premium Cães 15kg", price: 189.9, stock: 45 },
  "7891234567891": { name: "Ração Gatos Filhotes 3kg", price: 79.9, stock: 32 },
  "7891234567892": { name: "Areia Higiênica 4kg", price: 24.9, stock: 120 },
  "7891234567893": { name: "Brinquedo Mordedor", price: 15.9, stock: 78 },
  "7891234567894": { name: "Coleira Antipulgas", price: 42.5, stock: 15 },
  "7891234567895": { name: "Shampoo Pet 500ml", price: 28.9, stock: 8 },
  "7891234567896": { name: "Comedouro Inox Duplo", price: 35.5, stock: 62 },
};
