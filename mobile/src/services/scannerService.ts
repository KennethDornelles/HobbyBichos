import api from "../services/api";
import { MemberData, ProductData } from "../types/scanner.types";

/**
 * Buscar membro pelo ID ou Email no Clube Hobby (endpoint público)
 * Integra com a API de usuários e loyalty
 */
export async function fetchMemberById(identifier: string): Promise<MemberData | null> {
  try {
    // Tentar como email primeiro se parecer um email
    const isEmail = identifier.includes("@");
    const params = isEmail 
      ? { email: identifier }
      : { id: identifier };

    const response = await api.get(`/users/lookup`, { params });
    
    const user = response.data;
    
    // Se não for membro do Clube (sem loyaltyAccount), retornar null
    if (!user.loyaltyAccount) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf || "Não informado",
      discount: user.loyaltyAccount.tier === 'GOLD' ? 25 : 
                user.loyaltyAccount.tier === 'SILVER' ? 15 : 10,
    };
  } catch (error) {
    console.error("Erro ao buscar membro:", error);
    return null;
  }
}

export async function fetchMemberByCode(code: string): Promise<MemberData | null> {
  try {
    const normalized = code.trim().toUpperCase();
    const response = await api.get(`/users/code/${normalized}`);
    const user = response.data;
    if (!user.loyaltyAccount) return null;
    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf || "Não informado",
      discount: user.loyaltyAccount.tier === 'GOLD' ? 25 : 
                user.loyaltyAccount.tier === 'SILVER' ? 15 : 10,
    };
  } catch (error) {
    console.error("Erro ao buscar membro por código:", error);
    return null;
  }
}

/**
 * Buscar produto pelo código de barras (EAN)
 * Integra com a API de produtos
 */
export async function fetchProductByBarcode(barcode: string): Promise<ProductData | null> {
  try {
    // Buscar produto pelo código de barras na API
    const response = await api.get(`/products/barcode/${barcode}`);
    
    const product = response.data;

    return {
      name: product.name,
      price: parseFloat(product.price) || 0,
      stock: product.stock || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

/**
 * Buscar produto pelo ID
 */
export async function fetchProductById(productId: string): Promise<ProductData | null> {
  try {
    const response = await api.get(`/products/${productId}`);
    
    const product = response.data;

    return {
      name: product.name,
      price: parseFloat(product.price) || 0,
      stock: product.stock || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}
