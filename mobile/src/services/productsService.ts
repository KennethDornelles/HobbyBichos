import api from './api';
import { Product, ProductCategory } from '@/types/product';

export interface CreateProductDto {
  name: string;
  description?: string;
  basePrice: number;
  category: ProductCategory;
  sku?: string;
  images?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

interface RawProductResponse {
  id: string;
  name: string;
  category: string;
  basePrice: number | string;
  images: string[];
  sku: string;
  Stock: { quantity: number }[];
}

export const productsService = {
  /**
   * Busca todos os produtos da loja atual (baseado no token/usuário logado)
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<RawProductResponse[]>('/products/store');
      
      return response.data.map((p) => ({
        id: p.id,
        name: p.name || 'Produto sem nome',
        category: (p.category || 'Todos') as ProductCategory,
        price: Number(p.basePrice) || 0,
        imageUrl: p.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
        sku: p.sku,
        quantity: p.Stock?.[0]?.quantity || 0 // Assuming backend returns Stock relation
      }));
    } catch (error) {
      console.error('ProductsService: Erro ao buscar produtos', error);
      throw error;
    }
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
