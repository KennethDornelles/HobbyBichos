/**
 * Tipos relacionados a produtos
 */

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  imageUrl: string;
  description?: string;
  sku?: string;
  quantity?: number;
}

export type ProductCategory = 
  | 'Todos'
  | 'Higiene'
  | 'Rações'
  | 'Brinquedos'
  | 'Acessórios'
  | 'Medicamentos';
