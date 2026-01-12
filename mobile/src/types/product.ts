/**
 * Tipos relacionados a produtos
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

export type ProductCategory = 
  | 'Todos'
  | 'Higiene'
  | 'Ração'
  | 'Brinquedos'
  | 'Acessórios'
  | 'Medicamentos';
