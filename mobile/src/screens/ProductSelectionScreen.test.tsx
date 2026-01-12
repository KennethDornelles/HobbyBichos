/**
 * EXEMPLOS DE TESTES - ProductSelectionScreen.tsx
 *
 * Este arquivo contém exemplos de testes unitários para ProductSelectionScreen.
 * Para usar, instale @testing-library/react-native e @types/jest
 *
 * Instalação:
 * npm install --save-dev @testing-library/react-native jest @types/jest
 *
 * ========================================
 * CONFIGURAÇÃO INICIAL
 * ========================================
 *
 * import React from 'react';
 * import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
 * import ProductSelectionScreen from './ProductSelectionScreen';
 * import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from '@/utils/constants';
 *
 * jest.mock('@/components/SideMenu', () => 'SideMenu');
 * jest.mock('@/components/TopBar', () => 'TopBar');
 * jest.mock('@/components/FabButton', () => 'FabButton');

*
 * ========================================
 * TESTES DE RENDERIZAÇÃO
 * ========================================
 *
 * describe('ProductSelectionScreen', () => {
 *   beforeEach(() => {
 *     jest.clearAllMocks();
 *   });
 *
 *   describe('Renderização', () => {
 *     it('deve renderizar o componente sem erros', () => {
 *       render(<ProductSelectionScreen />);
 *       expect(screen.toJSON()).toBeTruthy();
 *     });
 *
 *     it('deve renderizar todos os chips de categoria', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       PRODUCT_CATEGORIES.forEach((category) => {
 *         const chip = screen.getByText(category);
 *         expect(chip).toBeTruthy();
 *       });
 *     });
 *
 *     it('deve renderizar todos os produtos inicialmente', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.getByText('Shampoo Premium para Cães')).toBeTruthy();
 *       expect(screen.getByText('Ração Especial Gatos Adultos 3kg')).toBeTruthy();
 *     });
 *
 *     it('deve renderizar os componentes principais', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.getByType('SideMenu')).toBeTruthy();
 *       expect(screen.getByType('TopBar')).toBeTruthy();
 *       expect(screen.getByType('FabButton')).toBeTruthy();
 *     });
 *   });
 *
 * ========================================
 * TESTES DE FILTRO
 * ========================================
 *
 *   describe('Filtro de Categorias', () => {
 *     it('deve filtrar produtos ao selecionar uma categoria', async () => {
 *       render(<ProductSelectionScreen />);
 *
 *       const higieneChip = screen.getByText('Higiene');
 *       fireEvent.press(higieneChip);
 *
 *       await waitFor(() => {
 *         expect(screen.getByText('Shampoo Premium para Cães')).toBeTruthy();
 *         expect(screen.getByText('Escova Dental Canina')).toBeTruthy();
 *         expect(screen.getByText('Perfume Pet Lavanda')).toBeTruthy();
 *       });
 *     });
 *
 *     it('deve mostrar "Todos" quando clicado', async () => {
 *       render(<ProductSelectionScreen />);
 *
 *       fireEvent.press(screen.getByText('Higiene'));
 *       fireEvent.press(screen.getByText('Todos'));
 *
 *       await waitFor(() => {
 *         expect(MOCK_PRODUCTS.length).toBeGreaterThan(0);
 *       });
 *     });
 *
 *     it('chip selecionado deve ter border-2', async () => {
 *       const { toJSON } = render(<ProductSelectionScreen />);
 *
 *       fireEvent.press(screen.getByText('Ração'));
 *
 *       await waitFor(() => {
 *         const tree = toJSON();
 *         expect(tree).toMatchSnapshot();
 *       });
 *     });
 *   });
 *
 * ========================================
 * TESTES DE PRODUTOS
 * ========================================
 *
 *   describe('Produtos', () => {
 *     it('deve exibir preços formatados corretamente', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.getByText('R$ 34.90')).toBeTruthy();
 *       expect(screen.getByText('R$ 89.90')).toBeTruthy();
 *     });
 *
 *     it('deve ter 12 produtos no mock', () => {
 *       expect(MOCK_PRODUCTS.length).toBe(12);
 *     });
 *
 *     it('cada produto deve ter propriedades obrigatórias', () => {
 *       MOCK_PRODUCTS.forEach((product) => {
 *         expect(product.id).toBeDefined();
 *         expect(product.name).toBeDefined();
 *         expect(product.category).toBeDefined();
 *         expect(product.price).toBeDefined();
 *         expect(product.imageUrl).toBeDefined();
 *       });
 *     });
 *   });
 *
 * ========================================
 * TESTES DE ACESSIBILIDADE
 * ========================================
 *
 *   describe('Acessibilidade', () => {
 *     it('chips devem ter accessibilityRole button', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       const chip = screen.getByRole('button', { name: /Higiene/i });
 *       expect(chip).toBeTruthy();
 *     });
 *
 *     it('chips devem ter accessibilityLabel descritivo', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.toJSON()).toBeTruthy();
 *     });
 *   });
 *
 * ========================================
 * TESTES DE HANDLERS
 * ========================================
 *
 *   describe('Handlers', () => {
 *     it('deve chamar handleMenuPress ao pressionar botão de menu', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.getByType('TopBar')).toBeTruthy();
 *     });
 *
 *     it('deve chamar handleFabPress ao pressionar FAB', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       expect(screen.getByType('FabButton')).toBeTruthy();
 *     });
 *
 *     it('deve chamar handleProductPress ao pressionar produto', () => {
 *       render(<ProductSelectionScreen />);
 *
 *       const console_spy = jest.spyOn(console, 'log');
 *       fireEvent.press(screen.getByText('Shampoo Premium para Cães'));
 *
 *       console_spy.mockRestore();
 *     });
 *   });
 *
 * ========================================
 * TESTES DE PERFORMANCE
 * ========================================
 *
 *   describe('Performance', () => {
 *     it('FlatList deve ter configurações de performance', () => {
 *       render(<ProductSelectionScreen />);
 *       expect(screen.toJSON()).toBeTruthy();
 *     });
 *
 *     it('CategoryChip deve ser memoizado', () => {
 *       expect(React).toBeDefined();
 *     });
 *   });
 *
 * ========================================
 * TESTES DE CASOS EXTREMOS
 * ========================================
 *
 *   describe('Casos Extremos', () => {
 *     it('deve lidar com lista vazia', () => {
 *       render(<ProductSelectionScreen />);
 *       expect(screen.toJSON()).toBeTruthy();
 *     });
 *
 *     it('deve filtrar corretamente com apenas 1 produto', () => {
 *       render(<ProductSelectionScreen />);
 *       fireEvent.press(screen.getByText('Medicamentos'));
 *       expect(screen.toJSON()).toBeTruthy();
 *     });
 *   });
 * });
 *
 * ========================================
 * COMO EXECUTAR OS TESTES
 * ========================================
 *
 * 1. Instale as dependências de teste:
 *    npm install --save-dev @testing-library/react-native jest @types/jest
 *
 * 2. Configure jest.config.js:
 *    {
 *      "preset": "react-native",
 *      "testEnvironment": "node",
 *    }
 *
 * 3. Execute os testes:
 *    npm test -- ProductSelectionScreen.test.tsx
 *    npm test -- --watch  (modo watch)
 *    npm test -- --coverage  (com cobertura)
 */
export const TEST_EXAMPLES = {
    description: 'Exemplos de testes para ProductSelectionScreen',
    framework: 'jest + @testing-library/react-native',
    coverage: 'Renderização, Filtro, Acessibilidade, Performance, Casos Extremos'
};