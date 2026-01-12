/**
 * EXEMPLOS DE INTEGRAÇÃO - ProductSelectionScreen com React Navigation
 *
 * Este arquivo contém exemplos de como integrar ProductSelectionScreen
 * em diferentes tipos de navegadores React Navigation.
 *
 * ========================================
 * OPÇÃO 1: Stack Navigator
 * ========================================
 *
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 * import { ProductSelectionScreen } from '@/screens';
 * import ProductDetailScreen from '@/screens/ProductDetail/ProductDetailScreen';
 *
 * const Stack = createNativeStackNavigator();
 *
 * export function ProductsStackNavigator() {
 *   return (
 *     <Stack.Navigator screenOptions={{ headerShown: false }}>
 *       <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
 *       <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
 *     </Stack.Navigator>
 *   );
 * }
 *
 * ========================================
 * OPÇÃO 2: Tab Navigator com ProductsStack
 * ========================================
 *
 * import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 * import { Ionicons } from '@expo/vector-icons';
 * import { ProductSelectionScreen } from '@/screens';
 *
 * const Tab = createBottomTabNavigator();
 * const Stack = createNativeStackNavigator();
 *
 * function ProductsStack() {
 *   return (
 *     <Stack.Navigator screenOptions={{ headerShown: false }}>
 *       <Stack.Screen name="ProductSelection" component={ProductSelectionScreen} />
 *     </Stack.Navigator>
 *   );
 * }
 *
 * export function TabNavigator() {
 *   return (
 *     <Tab.Navigator
 *       screenOptions={({ route }) => ({
 *         headerShown: false,
 *         tabBarIcon: ({ focused, color, size }) => {
 *           let iconName = 'home';
 *           if (route.name === 'Products') {
 *             iconName = focused ? 'list' : 'list-outline';
 *           }
 *           return <Ionicons name={iconName} size={size} color={color} />;
 *         },
 *         tabBarActiveTintColor: '#1A1B2E',
 *         tabBarInactiveTintColor: '#9CA3AF',
 *       })}
 *     >
 *       <Tab.Screen name="Products" component={ProductsStack} options={{ title: 'Produtos' }} />
 *     </Tab.Navigator>
 *   );
 * }
// OPÇÃO 3: Modificar ProductSelectionScreen para aceitar props de navegação
// ========================================

/*
// Adicione isso no ProductSelectionScreen.tsx:

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProductSelection: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProductSelectionScreen = (): React.ReactElement => {
  const navigation = useNavigation<NavigationProp>();

  const handleProductPress = useCallback((product: Product) => {
    console.log('Produto selecionado:', product);
    // Navegar para tela de detalhes
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  const handleFabPress = useCallback(() => {
    console.log('Carrinho pressionado');
    // Navegar para carrinho
    navigation.navigate('Cart');
  }, [navigation]);

  // ... resto do código
};
*
 * ========================================
 * OPÇÃO 3: Modificar ProductSelectionScreen para aceitar props de navegação
 * ========================================
 *
 * import { useNavigation } from '@react-navigation/native';
 * import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
 *
 * type RootStackParamList = {
 *   ProductSelection: undefined;
 *   ProductDetail: { productId: string };
 *   Cart: undefined;
 * };
 *
 * type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
 *
 * const ProductSelectionScreen = (): React.ReactElement => {
 *   const navigation = useNavigation<NavigationProp>();
 *
 *   const handleProductPress = useCallback((product: Product) => {
 *     navigation.navigate('ProductDetail', { productId: product.id });
 *   }, [navigation]);
 *
 *   const handleFabPress = useCallback(() => {
 *     navigation.navigate('Cart');
 *   }, [navigation]);
 *
 *   // ... resto do código
 * };
 *
 * ========================================
 * OPÇÃO 4: Uso com Deep Linking
 * ========================================
 *
 * const linking = {
 *   prefixes: ['myapp://', 'https://myapp.com'],
 *   config: {
 *     screens: {
 *       ProductSelection: 'products',
 *       ProductDetail: 'products/:productId',
 *       Cart: 'cart',
 *     },
 *   },
 * };
 *
 * Exemplos:
 * - myapp://products
 * - myapp://products/123
 * - myapp://cart
 *
 * ========================================
 * OPÇÃO 5: Passar dados através do SideMenu
 * ========================================
 *
 * const TopBar = ({
 *   onMenuPress,
 *   onCartPress
 * }: {
 *   onMenuPress: () => void;
 *   onCartPress: () => void;
 * }) => {
 *   return (
 *     <View className="flex-row justify-between items-center px-4 py-3">
 *       <TouchableOpacity onPress={onMenuPress}>
 *         <Ionicons name="menu" size={24} />
 *       </TouchableOpacity>
 *       <TouchableOpacity onPress={onCartPress}>
 *         <Ionicons name="cart" size={24} />
 *       </TouchableOpacity>
 *     </View>
 *   );
 * };
 */

export const INTEGRATION_EXAMPLES = {
  description: 'Veja os exemplos acima para diferentes opções de integração com React Navigation',
  options: [
    'Stack Navigator',
    'Tab Navigator',
    'Props de navegação',
    'Deep Linking',
    'SideMenu integration'
  ]
};
