import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    ListRenderItem,
    ViewStyle,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { HomeHeader } from '@/components/HomeHeader';
import { SideMenu } from '@/components/SideMenu';
import { Product, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { useCartStore } from '@/store/cartStore';

/**
 * Props da interface CategoryChip
 */
interface CategoryChipProps {
    label: ProductCategory;
    isSelected: boolean;
    onPress: (category: string) => void;
}

/**
 * Componente CategoryChip com otimização
 */
const CategoryChip = React.memo(
    ({ label, isSelected, onPress }: CategoryChipProps) => (
        <TouchableOpacity
            onPress={() => onPress(label)}
            accessible={true}
            accessibilityLabel={`Categoria ${label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={`rounded-full px-6 py-2.5 mr-2 ${isSelected
                ? 'bg-white border-2 border-[#1A1B2E]'
                : 'bg-white border border-gray-300'
                }`}
        >
            <Text
                className={`font-quicksand-semibold text-sm ${isSelected ? 'text-[#1A1B2E]' : 'text-gray-700'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    )
);

CategoryChip.displayName = 'CategoryChip';

/**
 * Props da interface ProductCard
 */
interface ProductCardProps {
    product: Product;
    onAddPress: (product: Product) => void;
}

/**
 * Componente ProductCard com otimização
 */
const ProductCard = React.memo(({ product, onAddPress }: ProductCardProps) => {
    const price = Number(product.price) || 0;
    return (
        <TouchableOpacity
            accessible={true}
            accessibilityLabel={`Produto ${product.name}, preço R$ ${price.toFixed(2)}`}
            accessibilityRole="button"
            className="w-full"
            style={{ aspectRatio: 0.75 } as ViewStyle}
        >
            <View className="bg-white rounded-[32px] overflow-hidden shadow-sm flex-1 justify-between">
                {/* Container da Imagem */}
                <View className="relative h-[65%]">
                    <Image
                        source={{ uri: product.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    {/* Gradient Overlay (simulado) */}
                    <View className="absolute bottom-0 w-full h-16 bg-black/10" />

                    {/* Badge de Preço */}
                    <View className="absolute top-3 left-3 bg-[#FFD25D] rounded-full px-3 py-1.5">
                        <Text className="font-quicksand-bold text-xs text-[#1A1B2E]">
                            R$ {price.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Info do Produto */}
                <View className="p-3 flex-1 justify-between">
                    <Text
                        className="font-quicksand-semibold text-sm text-[#1A1B2E]"
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>

                    {/* Botão de Ação */}
                    <TouchableOpacity
                        onPress={() => onAddPress(product)}
                        className="absolute bottom-2 right-2 bg-[#1A1B2E] rounded-full w-8 h-8 items-center justify-center"
                        accessible={true}
                        accessibilityLabel={`Adicionar ${product.name} ao carrinho`}
                        accessibilityRole="button"
                    >
                        <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});

ProductCard.displayName = 'ProductCard';

/**
 * Componente principal ProductSelectionScreen
 * 
 * Exibe uma grade de produtos com filtro por categoria.
 * 
 * Features:
 * - Grid de 2 colunas com produtos
 * - Scroll horizontal de categorias
 * - Otimização de performance com useMemo e useCallback
 * - Suporte a acessibilidade
 * - Design com NativeWind/Tailwind
 * - Adicionar produtos ao carrinho
 * - Busca produtos da API
 */
const ProductSelectionScreen = (): React.ReactElement => {
    const router = useRouter();
    const { addItem, totalItems } = useCartStore();

    // Estados
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar produtos da API
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get<any[]>('/products');
                const apiProducts: Product[] = response.data.map((p) => ({
                    id: p.id,
                    name: p.name || 'Produto sem nome',
                    category: 'Todos' as ProductCategory, // TODO: atualizar com categoria real
                    price: Number(p.basePrice) || 0,
                    imageUrl: p.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
                }));
                setProducts(apiProducts);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                Alert.alert('Erro', 'Não foi possível carregar os produtos');
            } finally {
                setLoading(false);
            }
        };
        void loadProducts();
    }, []);

    // Produtos filtrados com useMemo para performance
    const filteredProducts = useMemo<Product[]>(() => {
        return selectedCategory === 'Todos'
            ? products
            : products.filter((p) => p.category === selectedCategory);
    }, [selectedCategory, products]);

    // Handlers com useCallback para estabilidade de referência
    const handleMenuPress = useCallback(() => {
        setMenuVisible(true);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuVisible(false);
    }, []);

    const handleCategoryPress = useCallback((category: string) => {
        setSelectedCategory(category as ProductCategory);
    }, []);

    const handleAddToCart = useCallback((product: Product) => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl,
            quantity: 1,
        });

        Alert.alert(
            '✅ Sucesso',
            `${product.name} foi adicionado ao carrinho!`,
            [{ text: 'OK', onPress: () => { } }]
        );
    }, [addItem]);

    const handleFabPress = useCallback(() => {
        router.push('/carrinho');
    }, [router]);

    const handleMenuSelect = useCallback((label: string) => {
        setMenuVisible(false);
        console.log('Menu item selected:', label);
        // Implementar navegação baseada no label
    }, []);

    // Render functions
    const renderCategoryChip = (category: ProductCategory) => (
        <CategoryChip
            key={category}
            label={category}
            isSelected={selectedCategory === category}
            onPress={handleCategoryPress}
        />
    );

    const renderProductCard: ListRenderItem<Product> = ({ item }) => (
        <ProductCard product={item} onAddPress={handleAddToCart} />
    );

    const keyExtractor = (item: Product): string => item.id;

    // Estilos dinamicamente criados
    const columnWrapperStyle: ViewStyle = {
        gap: 12,
        marginBottom: 12,
    };

    const contentContainerStyle: ViewStyle = {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 96,
    };

    // TODO: Implementar quando componentes estiverem disponíveis
    // <SideMenu isOpen={menuVisible} onClose={handleMenuClose} />
    // <TopBar onMenuPress={handleMenuPress} />

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F5F5F5] items-center justify-center" edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color="#1A1B2E" />
                <Text className="mt-4 text-gray-600 font-quicksand-semibold">
                    Carregando produtos...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-[#F5F5F5]">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-[#1A1B2E]">
                <HomeHeader
                    onMenuPress={() => setMenuVisible(true)}
                    onCameraPress={() => console.log('Camera pressed')}
                    onCartPress={() => router.push('/carrinho')}
                    cartItemsCount={totalItems()}
                />
            </SafeAreaView>

            {/* Side Menu */}
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={handleMenuSelect}
            />

            {/* Scroll horizontal de categorias */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-4 pt-4 pb-3 bg-[#F5F5F5]"
            >
                {PRODUCT_CATEGORIES.map(renderCategoryChip)}
            </ScrollView>

            {/* Grid de Produtos */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={keyExtractor}
                numColumns={2}
                contentContainerStyle={contentContainerStyle}
                columnWrapperStyle={columnWrapperStyle}
                initialNumToRender={6}
                maxToRenderPerBatch={4}
                updateCellsBatchingPeriod={50}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-8">
                        <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                        <Text className="mt-4 text-gray-500 font-quicksand-semibold">
                            Nenhum produto encontrado
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export default ProductSelectionScreen;
