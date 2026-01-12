/**
 * ANIMAÇÕES E MELHORIAS FUTURAS - ProductSelectionScreen
 * 
 * Este arquivo contém exemplos de como adicionar animações e
 * funcionalidades adicionais ao componente ProductSelectionScreen
 */

// ========================================
// 1. ANIMAÇÃO AO MUDAR CATEGORIA
// ========================================

/*
import { useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const handleCategoryPress = useCallback((category: string) => {
  const animatedOpacity = useSharedValue(1);
  
  animatedOpacity.value = withTiming(0, { duration: 200 }, () => {
    setSelectedCategory(category);
    animatedOpacity.value = withTiming(1, { duration: 200 });
  });
}, []);

// Na renderização:
<Animated.View style={{ opacity: animatedOpacity }}>
  <FlatList {...} />
</Animated.View>
*/

// ========================================
// 2. ANIMAÇÃO AO ADICIONAR AO CARRINHO
// ========================================

/*
import { Animated, TouchableOpacity } from 'react-native';

const scaleAnim = new Animated.Value(1);

const handleAddToCart = useCallback((product: Product) => {
  // Animação de scale
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();
  
  // Adicionar ao carrinho...
}, []);

// Na renderização do botão:
<Animated.View
  style={{
    transform: [{ scale: scaleAnim }],
  }}
>
  <TouchableOpacity onPress={() => handleAddToCart(product)}>
    {/* conteúdo */}
  </TouchableOpacity>
</Animated.View>
*/

// ========================================
// 3. PULL TO REFRESH
// ========================================

/*
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    // Simular fetch de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Dados atualizados');
  } catch (error) {
    console.error('Erro ao atualizar:', error);
  } finally {
    setRefreshing(false);
  }
}, []);

// Na FlatList:
<FlatList
  {...}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#1A1B2E"
    />
  }
/>
*/

// ========================================
// 4. SKELETON LOADER
// ========================================

/*
const SkeletonCard = () => (
  <View className="bg-gray-200 rounded-[32px] animate-pulse">
    <View className="h-[65%] bg-gray-300" />
    <View className="p-3 space-y-2">
      <View className="h-4 bg-gray-300 rounded" />
      <View className="h-4 bg-gray-300 rounded w-3/4" />
    </View>
  </View>
);

const LoadingSkeleton = () => (
  <FlatList
    data={Array(12).fill(null)}
    renderItem={() => <SkeletonCard />}
    numColumns={2}
    // ...
  />
);
*/

// ========================================
// 5. BUSCA/FILTRO POR TEXTO
// ========================================

/*
const [searchQuery, setSearchQuery] = useState('');

const filteredBySearchAndCategory = useMemo<Product[]>(() => {
  let filtered = selectedCategory === 'Todos'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);
  
  if (searchQuery.trim()) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filtered;
}, [selectedCategory, searchQuery]);

// Adicionar SearchBar acima das categorias:
<TextInput
  placeholder="Buscar produtos..."
  className="mx-4 mb-3 px-4 py-2 bg-white rounded-full border border-gray-300"
  placeholderTextColor="#9CA3AF"
  value={searchQuery}
  onChangeText={setSearchQuery}
/>
*/

// ========================================
// 6. ORDENAÇÃO (PREÇO, NOME)
// ========================================

/*
const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

const sortedProducts = useMemo(() => {
  const sorted = [...filteredProducts];
  
  if (sortBy === 'price') {
    sorted.sort((a, b) => a.price - b.price);
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return sorted;
}, [filteredProducts, sortBy]);

// Adicionar dropdown de sort:
<Picker
  selectedValue={sortBy}
  onValueChange={(value) => setSortBy(value)}
  style={{ width: 200 }}
>
  <Picker.Item label="Nome" value="name" />
  <Picker.Item label="Menor Preço" value="price" />
</Picker>
*/

// ========================================
// 7. FAVORITOS (HEART ICON)
// ========================================

/*
import AsyncStorage from '@react-native-async-storage/async-storage';

const [favorites, setFavorites] = useState<Set<string>>(new Set());

const loadFavorites = useCallback(async () => {
  try {
    const favs = await AsyncStorage.getItem('favorites');
    if (favs) setFavorites(new Set(JSON.parse(favs)));
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
  }
}, []);

const toggleFavorite = useCallback(async (productId: string) => {
  const newFavorites = new Set(favorites);
  
  if (newFavorites.has(productId)) {
    newFavorites.delete(productId);
  } else {
    newFavorites.add(productId);
  }
  
  setFavorites(newFavorites);
  await AsyncStorage.setItem(
    'favorites',
    JSON.stringify(Array.from(newFavorites))
  );
}, [favorites]);

useEffect(() => {
  loadFavorites();
}, []);

// No ProductCard:
<TouchableOpacity
  onPress={() => toggleFavorite(product.id)}
  className="absolute top-3 right-3"
>
  <Ionicons
    name={favorites.has(product.id) ? 'heart' : 'heart-outline'}
    size={20}
    color={favorites.has(product.id) ? '#FFD25D' : '#1A1B2E'}
  />
</TouchableOpacity>
*/

// ========================================
// 8. INFINITE SCROLL / PAGINATION
// ========================================

/*
const [page, setPage] = useState(1);
const [allProducts, setAllProducts] = useState<Product[]>([]);
const itemsPerPage = 12;

const loadMoreProducts = useCallback(async () => {
  try {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    
    // Em produção: const response = await api.get('/products', { page });
    const newProducts = MOCK_PRODUCTS.slice(start, end);
    
    setAllProducts(prev => [...prev, ...newProducts]);
    setPage(prev => prev + 1);
  } catch (error) {
    console.error('Erro ao carregar mais produtos:', error);
  }
}, [page]);

// Na FlatList:
<FlatList
  {...}
  onEndReached={loadMoreProducts}
  onEndReachedThreshold={0.1}
  ListFooterComponent={
    loading ? <ActivityIndicator size="large" color="#1A1B2E" /> : null
  }
/>
*/

// ========================================
// 9. MODAL DE DETALHES DO PRODUTO
// ========================================

/*
import { Modal } from 'react-native';

const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

const ProductDetailModal = ({ product, onClose }: {
  product: Product | null;
  onClose: () => void;
}) => (
  <Modal
    visible={!!product}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity onPress={onClose} className="absolute top-4 right-4">
        <Ionicons name="close" size={24} color="#1A1B2E" />
      </TouchableOpacity>
      
      {product && (
        <ScrollView className="p-4">
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-80 rounded-[32px] mb-4"
            resizeMode="cover"
          />
          <Text className="text-2xl font-quicksand-bold text-[#1A1B2E] mb-2">
            {product.name}
          </Text>
          <Text className="text-xl font-quicksand-semibold text-[#FFD25D] mb-4">
            R$ {product.price.toFixed(2)}
          </Text>
          <Text className="text-gray-600 mb-6">
            Categoria: {product.category}
          </Text>
          
          <TouchableOpacity className="bg-[#1A1B2E] rounded-full py-3 items-center">
            <Text className="text-white font-quicksand-semibold">
              Adicionar ao Carrinho
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  </Modal>
);

// Usar no ProductSelectionScreen:
const handleProductPress = useCallback((product: Product) => {
  setSelectedProductDetail(product);
}, []);

// Renderizar modal:
<ProductDetailModal
  product={selectedProductDetail}
  onClose={() => setSelectedProductDetail(null)}
/>
*/

// ========================================
// 10. REVIEWS / RATING
// ========================================

/*
interface ProductWithReviews extends Product {
  rating: number; // 0-5
  reviewCount: number;
}

const renderStars = (rating: number) => (
  <View className="flex-row">
    {[1, 2, 3, 4, 5].map(i => (
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={14}
        color="#FFD25D"
      />
    ))}
  </View>
);

// No card do produto:
<View className="mt-2">
  {renderStars(4)}
  <Text className="text-xs text-gray-500 mt-1">(128 avaliações)</Text>
</View>
*/

// ========================================
// 11. CONEXÃO COM API
// ========================================

/*
import axios from 'axios';

const API_URL = 'https://api.example.com';

const ProductSelectionScreen = (): React.ReactElement => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Product[]>(
          `${API_URL}/products?category=${selectedCategory}`
        );
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar produtos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorComponent message={error} />;

  // ... resto do componente
};
*/

// ========================================
// 12. DARK MODE SUPPORT
// ========================================

/*
import { useColorScheme } from 'react-native';
import { useContext, createContext } from 'react';

const ThemeContext = createContext({ isDark: false });

const colors = {
  light: {
    bg: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1A1B2E',
    accent: '#FFD25D',
  },
  dark: {
    bg: '#1A1B2E',
    card: '#2B2D42',
    text: '#FFFFFF',
    accent: '#FFD25D',
  },
};

// Usar no componente:
const { isDark } = useContext(ThemeContext);
const currentColors = isDark ? colors.dark : colors.light;

<View style={{ backgroundColor: currentColors.bg }} className="flex-1">
  {/* conteúdo */}
</View>
*/

export const ANIMATIONS_AND_IMPROVEMENTS = {
  description: 'Exemplos de animações e melhorias futuras',
  implemented: 0,
  available: 12,
  versions: [
    'v1.0.0 - Base (atual)',
    'v1.1.0 - Animações',
    'v1.2.0 - Busca e filtro',
    'v1.3.0 - API integration',
    'v2.0.0 - Full features',
  ],
};
