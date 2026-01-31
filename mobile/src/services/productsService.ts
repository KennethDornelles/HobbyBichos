import api from './api';
import { Product, ProductCategory } from '@/types/product';

export const productsService = {
  /**
   * Busca todos os produtos da loja atual (baseado no token/usuário logado)
   */
  async getProducts(): Promise<Product[]> {
    try {
      // Endpoint que lista produtos da loja do usuário autenticado
      // Se necessário, ajustar para '/products' se for listagem pública
      const response = await api.get<any[]>('/products');
      
      return response.data.map((p) => ({
        id: p.id,
        name: p.name || 'Produto sem nome',
        category: (p.category || 'Todos') as ProductCategory,
        // API retorna basePrice string/number, garantimos number aqui
        price: Number(p.basePrice) || 0,
        // API retorna array de imagens, pegamos a primeira ou um placeholder
        imageUrl: p.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
      }));
    } catch (error) {
      console.error('ProductsService: Erro ao buscar produtos', error);
      throw error;
    }
  },
};
