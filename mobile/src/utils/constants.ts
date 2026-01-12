import { Product, ProductCategory } from '@/types/product';

/**
 * Categorias de produtos disponíveis
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Todos',
  'Higiene',
  'Ração',
  'Brinquedos',
  'Acessórios',
  'Medicamentos',
];

/**
 * Dados mockados de produtos
 * Em produção, estes dados viriam de uma API
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Shampoo Premium para Cães',
    category: 'Higiene',
    price: 34.9,
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
  },
  {
    id: '2',
    name: 'Ração Especial Gatos Adultos 3kg',
    category: 'Ração',
    price: 89.9,
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
  },
  {
    id: '3',
    name: 'Brinquedo Interativo Bola',
    category: 'Brinquedos',
    price: 24.9,
    imageUrl: 'https://images.unsplash.com/photo-1591768575557-5ac2b8f3b9d9?w=400',
  },
  {
    id: '4',
    name: 'Coleira Premium Ajustável',
    category: 'Acessórios',
    price: 45.9,
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
  },
  {
    id: '5',
    name: 'Antipulgas e Carrapatos',
    category: 'Medicamentos',
    price: 67.9,
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  },
  {
    id: '6',
    name: 'Escova Dental Canina',
    category: 'Higiene',
    price: 18.9,
    imageUrl: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=400',
  },
  {
    id: '7',
    name: 'Ração Premium Filhotes 1kg',
    category: 'Ração',
    price: 52.9,
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
  },
  {
    id: '8',
    name: 'Arranhador para Gatos',
    category: 'Brinquedos',
    price: 89.9,
    imageUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
  },
  {
    id: '9',
    name: 'Cama Ortopédica Pet',
    category: 'Acessórios',
    price: 129.9,
    imageUrl: 'https://images.unsplash.com/photo-1617472568578-d9eb3e0e7cc1?w=400',
  },
  {
    id: '10',
    name: 'Vitamina Suplemento',
    category: 'Medicamentos',
    price: 78.9,
    imageUrl: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400',
  },
  {
    id: '11',
    name: 'Perfume Pet Lavanda',
    category: 'Higiene',
    price: 28.9,
    imageUrl: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
  },
  {
    id: '12',
    name: 'Ração Light 2kg',
    category: 'Ração',
    price: 64.9,
    imageUrl: 'https://images.unsplash.com/photo-1585178471295-3f36bc02f0a1?w=400',
  },
];

/**
 * Cores da aplicação
 */
export const COLORS = {
  primary: {
    dark: '#1A1B2E',
    light: '#F5F5F5',
  },
  accent: {
    yellow: '#FFD25D',
  },
  background: '#FFFFFF',
  border: '#E5E5E5',
  overlay: 'rgba(0, 0, 0, 0.1)',
} as const;
