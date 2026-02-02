import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    Alert,
    Modal,
    TextInput,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { productsService, CreateProductDto, UpdateProductDto } from '../../services/productsService';
import { Product, ProductCategory } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/EmptyState';

export default function ProductManagementScreen() {
    const { isDark } = useTheme();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<CreateProductDto>({
        name: '',
        description: '',
        basePrice: 0,
        category: 'Rações' as ProductCategory,
        sku: '',
        images: []
    });

    // Styles
    const textColor = isDark ? '#E0E0E0' : '#1F2937';
    const bgColor = isDark ? '#1A1F3A' : '#FFFFFF';
    const cardBgColor = isDark ? '#252F4D' : '#F9FAFB';
    const borderColor = isDark ? '#3F4558' : '#E5E7EB';
    const inputBgColor = isDark ? '#1A1F3A' : '#FFFFFF';

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productsService.getProducts();
            setProducts(data);
        } catch (error) {
            Alert.alert('Erro', (error as Error).message || 'Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    }, []);

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            basePrice: 0,
            category: 'Rações',
            sku: '',
            images: []
        });
        setModalVisible(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            basePrice: product.price,
            category: product.category,
            sku: product.sku || '',
            images: [product.imageUrl]
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.basePrice) {
            Alert.alert('Erro', 'Nome e Preço são obrigatórios');
            return;
        }

        try {
            if (editingProduct) {
                await productsService.updateProduct(editingProduct.id, {
                    ...formData,
                    basePrice: Number(formData.basePrice)
                });
                Alert.alert('Sucesso', 'Produto atualizado');
            } else {
                await productsService.createProduct({
                    ...formData,
                    basePrice: Number(formData.basePrice)
                });
                Alert.alert('Sucesso', 'Produto criado');
            }
            setModalVisible(false);
            loadProducts();
        } catch (error) {
            Alert.alert('Erro', (error as Error).message || 'Erro ao salvar produto');
        }
    };

    const handleDelete = (product: Product) => {
        Alert.alert(
            'Confirmar',
            `Deseja deletar ${product.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await productsService.deleteProduct(product.id);
                            loadProducts();
                        } catch (error) {
                            Alert.alert('Erro', (error as Error).message);
                        }
                    }
                }
            ]
        );
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            <View style={{ padding: 16, paddingTop: 60, paddingBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>Gestão de Estoque</Text>
                    <Pressable onPress={openCreateModal} style={{ backgroundColor: '#FF6B35', padding: 10, borderRadius: 8 }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </Pressable>
                </View>

                {/* Search Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBgColor, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor }}>
                    <Ionicons name="search" size={20} color="#8B92A9" />
                    <TextInput
                        placeholder="Buscar produto..."
                        placeholderTextColor="#8B92A9"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ flex: 1, padding: 12, color: textColor }}
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(item => (
                            <View key={item.id} style={{ flexDirection: 'row', backgroundColor: cardBgColor, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor }}>
                                <Image source={{ uri: item.imageUrl }} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#EEE' }} />
                                <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>{item.name}</Text>
                                    <Text style={{ color: '#8B92A9', fontSize: 12 }}>SKU: {item.sku || 'N/A'} | {item.category}</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#10B981', marginTop: 4 }}>
                                        R$ {item.price.toFixed(2)} • {item.quantity || 0} un
                                    </Text>
                                </View>
                                <View style={{ justifyContent: 'space-around' }}>
                                    <Pressable onPress={() => openEditModal(item)}>
                                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                                    </Pressable>
                                    <Pressable onPress={() => handleDelete(item)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            title="Nenhum produto"
                            description="Nenhum produto encontrado no estoque."
                            actionLabel="Adicionar Produto"
                            onAction={openCreateModal}
                        />
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {/* Modal Create/Edit */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: bgColor, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
                            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </Text>
                        <ScrollView>
                            <Input label="Nome" value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} textColor={textColor} borderColor={borderColor} />
                            <Input label="Preço (R$)" value={String(formData.basePrice)} onChangeText={t => setFormData({ ...formData, basePrice: Number(t) })} keyboardType="numeric" textColor={textColor} borderColor={borderColor} />
                            <Input label="SKU" value={formData.sku || ''} onChangeText={t => setFormData({ ...formData, sku: t })} textColor={textColor} borderColor={borderColor} />

                            <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 8 }}>Categoria</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                {['Rações', 'Acessórios', 'Medicamentos', 'Higiene', 'Brinquedos'].map(cat => (
                                    <Pressable
                                        key={cat}
                                        onPress={() => setFormData({ ...formData, category: cat as ProductCategory })}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                            backgroundColor: formData.category === cat ? '#FF6B35' : cardBgColor,
                                            borderWidth: 1, borderColor: formData.category === cat ? '#FF6B35' : borderColor
                                        }}
                                    >
                                        <Text style={{ color: formData.category === cat ? '#FFF' : textColor, fontSize: 12 }}>{cat}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                <Pressable onPress={() => setModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor, alignItems: 'center' }}>
                                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Cancelar</Text>
                                </Pressable>
                                <Pressable onPress={handleSave} style={{ flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#FF6B35', alignItems: 'center' }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Salvar</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    textColor: string;
    borderColor: string;
}

const Input = ({ label, value, onChangeText, keyboardType, textColor, borderColor }: InputProps) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: '#8B92A9', marginBottom: 6 }}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={{
                borderWidth: 1, borderColor, borderRadius: 8, padding: 12,
                color: textColor, fontSize: 16
            }}
        />
    </View>
);
