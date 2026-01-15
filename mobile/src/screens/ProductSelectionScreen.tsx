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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { HomeHeader } from '@/components/HomeHeader';
import { SideMenu } from '@/components/SideMenu';
import { Product, ProductCategory } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { useCartStore } from '@/store/cartStore';
import { useThemeColors } from '@/hooks/useThemeColors';

/**
 * Props da interface CategoryChip
 */
interface CategoryChipProps {
    label: ProductCategory;
    isSelected: boolean;
    onPress: (category: string) => void;
    colors: ReturnType<typeof useThemeColors>;
}

/**
 * Componente CategoryChip com otimização
 */
const CategoryChip = React.memo(
    ({ label, isSelected, onPress, colors }: CategoryChipProps) => (
        <TouchableOpacity
            onPress={() => onPress(label)}
            accessible={true}
            accessibilityLabel={`Categoria ${label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={{
                backgroundColor: isSelected ? colors.bgCard : colors.bgInput,
                borderColor: isSelected ? colors.textMain : colors.borderColor,
                borderWidth: isSelected ? 2 : 1
            }}
            className="rounded-full px-6 py-2.5 mr-2"
        >
            <Text
                style={{
                    color: isSelected ? colors.textMain : colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400'
                }}
                className="text-sm"
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
    colors: ReturnType<typeof useThemeColors>;
}

/**
 * Componente ProductCard com otimização
 */
const ProductCard = React.memo(({ product, onAddPress, colors }: ProductCardProps) => {
    const price = Number(product.price) || 0;
    return (
        <TouchableOpacity
            accessible={true}
            accessibilityLabel={`Produto ${product.name}, preço R$ ${price.toFixed(2)}`}
            accessibilityRole="button"
            className="w-full"
        >
            <View style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }} className="rounded-2xl overflow-hidden">
                {/* Container da Imagem */}
                <View className="relative" style={{ height: 140 }}>
                    <Image
                        source={{ uri: product.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    {/* Badge de Preço */}
                    <View style={{ backgroundColor: colors.accentYellow }} className="absolute top-2 left-2 rounded-lg px-2.5 py-1">
                        <Text style={{ color: colors.bgMain }} className="font-bold text-xs">
                            R$ {price.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Info do Produto */}
                <View className="p-3">
                    <Text
                        style={{ color: colors.textMain }}
                        className="font-semibold text-sm mb-2"
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>

                    {/* Botão de Adicionar */}
                    <TouchableOpacity
                        onPress={() => onAddPress(product)}
                        style={{ backgroundColor: colors.accentYellow }}
                        className="rounded-lg py-2 px-3 flex-row items-center justify-center"
                        accessible={true}
                        accessibilityLabel={`Adicionar ${product.name} ao carrinho`}
                        accessibilityRole="button"
                    >
                        <Ionicons name="cart-outline" size={16} color={colors.bgMain} />
                        <Text style={{ color: colors.bgMain }} className="font-semibold text-xs ml-1.5">
                            Adicionar
                        </Text>
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
    const colors = useThemeColors();
    const { addItem, totalItems } = useCartStore();
    const insets = useSafeAreaInsets();

    // Estados
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    // Mock data para seções
    const scheduledPurchaseProducts = products.slice(0, 2);
    const promotionalProducts = products.slice(2, 4);
    const fastDeliveryProducts = products.slice(4, 6);
    const repeatPurchaseHistory = products.slice(0, 2).map((p, idx) => ({
        ...p,
        lastPurchaseDate: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000),
        quantity: idx + 1
    }));

    // Carregar produtos da API
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get<any[]>('/products');
                const apiProducts: Product[] = response.data.map((p) => ({
                    id: p.id,
                    name: p.name || 'Produto sem nome',
                    category: (p.category || 'Todos') as ProductCategory,
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
            colors={colors}
        />
    );

    const renderProductCard: ListRenderItem<Product> = ({ item }) => (
        <ProductCard product={item} onAddPress={handleAddToCart} colors={colors} />
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
        paddingBottom: insets.bottom + 96,
    };

    // TODO: Implementar quando componentes estiverem disponíveis
    // <SideMenu isOpen={menuVisible} onClose={handleMenuClose} />
    // <TopBar onMenuPress={handleMenuPress} />

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bgMain }} edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color={colors.accentYellow} />
                <Text style={{ color: colors.textSecondary }} className="mt-4 font-semibold">
                    Carregando produtos...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.bgMain }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bgMain }}>
                <HomeHeader
                    onMenuPress={() => setMenuVisible(true)}

                    onCartPress={() => router.push('/carrinho')}
                    cartItemsCount={totalItems()}
                    hideCamera={true}
                />
            </SafeAreaView>

            {/* Side Menu */}
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={handleMenuSelect}
            />

            {/* Scroll com seções */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: colors.bgMain }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            >
                {/* Seção de Categorias */}
                <View className="pt-4 pb-2">
                    <Text style={{ color: colors.textMain }} className="px-4 text-lg font-bold mb-3">
                        Categorias
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-4"
                    >
                        {PRODUCT_CATEGORIES.map(renderCategoryChip)}
                    </ScrollView>
                </View>

                {/* Seção: Produtos em Destaque */}
                <View className="px-4 mt-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text style={{ color: colors.textMain }} className="text-lg font-bold">
                            Produtos em Destaque
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedCategory('Todos')}>
                            <Text style={{ color: colors.accentYellow }} className="text-xs font-semibold">
                                Ver todos
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        scrollEnabled={false}
                        data={filteredProducts.slice(0, 4)}
                        renderItem={renderProductCard}
                        keyExtractor={keyExtractor}
                        numColumns={2}
                        columnWrapperStyle={{
                            gap: 12,
                            marginBottom: 12,
                        }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-8">
                                <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
                                <Text style={{ color: colors.textSecondary }} className="mt-4 font-semibold">
                                    Nenhum produto encontrado
                                </Text>
                            </View>
                        }
                    />
                </View>

                {/* Seção de Destaque - Entrega Rápida */}
                <View className="mt-4 px-4 py-3 rounded-2xl" style={{ backgroundColor: colors.accentGreen + '20', borderLeftWidth: 4, borderLeftColor: colors.accentGreen }}>
                    <View className="flex-row items-center">
                        <Ionicons name="flash" size={20} color={colors.accentGreen} />
                        <Text style={{ color: colors.textMain }} className="ml-3 flex-1 font-semibold text-sm">
                            Entrega expressa em até 1 hora
                        </Text>
                    </View>
                </View>

                {/* Seção: Compra Programada */}
                {scheduledPurchaseProducts.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text style={{ color: colors.textMain }} className="text-lg font-bold">
                                🔄 Compra Programada
                            </Text>
                            <Text style={{ color: colors.accentYellow }} className="text-xs font-semibold">
                                Saiba mais
                            </Text>
                        </View>
                        <Text style={{ color: colors.textSecondary }} className="text-xs mb-3">
                            Programe suas compras recorrentes e economize
                        </Text>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduledPurchaseProducts}
                            renderItem={renderProductCard}
                            keyExtractor={keyExtractor}
                            numColumns={2}
                            columnWrapperStyle={{
                                gap: 12,
                                marginBottom: 12,
                            }}
                        />
                    </View>
                )}

                {/* Seção: Entrega em até 1h */}
                {fastDeliveryProducts.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text style={{ color: colors.textMain }} className="text-lg font-bold">
                                ⚡ Entrega em até 1h
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedCategory('Todos')}>
                                <Text style={{ color: colors.accentYellow }} className="text-xs font-semibold">
                                    Ver todos
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            scrollEnabled={false}
                            data={fastDeliveryProducts}
                            renderItem={renderProductCard}
                            keyExtractor={keyExtractor}
                            numColumns={2}
                            columnWrapperStyle={{
                                gap: 12,
                                marginBottom: 12,
                            }}
                        />
                    </View>
                )}

                {/* Seção: Super Ofertas */}
                {promotionalProducts.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text style={{ color: colors.textMain }} className="text-lg font-bold">
                                💰 Super Ofertas
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedCategory('Todos')}>
                                <Text style={{ color: colors.accentYellow }} className="text-xs font-semibold">
                                    Ver todos
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            scrollEnabled={false}
                            data={promotionalProducts}
                            renderItem={({ item }) => (
                                <View className="flex-1">
                                    <ProductCard product={item} onAddPress={handleAddToCart} colors={colors} />
                                    <View style={{ backgroundColor: colors.accentRed }} className="absolute top-16 right-2 rounded-lg px-2 py-1">
                                        <Text style={{ color: colors.bgMain }} className="font-bold text-xs">
                                            -30%
                                        </Text>
                                    </View>
                                </View>
                            )}
                            keyExtractor={keyExtractor}
                            numColumns={2}
                            columnWrapperStyle={{
                                gap: 12,
                                marginBottom: 12,
                            }}
                        />
                    </View>
                )}

                {/* Seção: Repetir Compra */}
                {repeatPurchaseHistory.length > 0 && (
                    <View className="mt-6 px-4">
                        <Text style={{ color: colors.textMain }} className="text-lg font-bold mb-4">
                            🔁 Repetir Compra
                        </Text>
                        {repeatPurchaseHistory.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="flex-row rounded-2xl p-4 mb-3"
                                style={{ backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.borderColor }}
                                onPress={() => handleAddToCart(item)}
                            >
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    className="w-16 h-16 rounded-lg mr-3"
                                    resizeMode="cover"
                                />
                                <View className="flex-1">
                                    <Text style={{ color: colors.textMain }} className="font-semibold text-sm mb-1" numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ color: colors.textSecondary }} className="text-xs mb-2">
                                        Comprado há {Math.floor((Date.now() - item.lastPurchaseDate.getTime()) / (24 * 60 * 60 * 1000))} dias
                                    </Text>
                                    <Text style={{ color: colors.accentYellow }} className="font-bold text-sm">
                                        R$ {item.price.toFixed(2)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleAddToCart(item)}
                                    style={{ backgroundColor: colors.accentYellow }}
                                    className="rounded-full w-10 h-10 items-center justify-center"
                                >
                                    <Ionicons name="add" size={18} color={colors.bgMain} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Seção: Últimos Vistos */}
                {recentlyViewed.length > 0 && (
                    <View className="mt-6 px-4">
                        <Text style={{ color: colors.textMain }} className="text-lg font-bold mb-4">
                            👁️ Últimos Vistos
                        </Text>
                        <FlatList
                            scrollEnabled={false}
                            data={recentlyViewed}
                            renderItem={renderProductCard}
                            keyExtractor={keyExtractor}
                            numColumns={2}
                            columnWrapperStyle={{
                                gap: 12,
                                marginBottom: 12,
                            }}
                        />
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

export default ProductSelectionScreen;
