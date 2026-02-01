import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    ArrowLeftRight,
    ArrowLeft,
    Box,
    Store,
    ChevronDown,
    Plus,
    History,
    AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { managerService, StockTransfer, ProductPerformance } from '../../services/managerService';
import { userManagementService, StoreData } from '../../services/userManagementService';
import { EmptyState } from '../../components/EmptyState';

export default function StockTransferScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    const [products, setProducts] = useState<ProductPerformance[]>([]);
    const [stores, setStores] = useState<StoreData[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [fromStore, setFromStore] = useState<string | null>(user.storeId || null);
    const [toStore, setToStore] = useState<string | null>(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    const textColor = isDark ? '#F3F4F6' : '#1F2937';
    const cardBgColor = isDark ? '#1F2937' : '#FFFFFF';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, storesData, transfersData] = await Promise.all([
                managerService.getProductPerformance(
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    new Date().toISOString()
                ),
                userManagementService.getStores(),
                managerService.getStockTransfers()
            ]);

            // Usando product performance para pegar a lista, mas no futuro ideal seria um getProducts simplificado
            setProducts(productsData);
            setStores(storesData);
            setTransfers(transfersData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados para transferência.');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedProduct || !fromStore || !toStore || !quantity) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (fromStore === toStore) {
            Alert.alert('Erro', 'A loja de origem e destino devem ser diferentes.');
            return;
        }

        try {
            setSubmitting(true);
            await managerService.createStockTransfer({
                productId: selectedProduct,
                fromStoreId: fromStore,
                toStoreId: toStore,
                quantity: parseInt(quantity),
                reason: reason || undefined
            });

            Alert.alert('Sucesso', 'Transferência de estoque realizada com sucesso!');

            // Reset form
            setSelectedProduct(null);
            setToStore(null);
            setQuantity('');
            setReason('');

            loadData(); // Refresh list and stock
        } catch (error: any) {
            const message = error.response?.data?.message || 'Falha ao realizar transferência.';
            Alert.alert('Erro', message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Transferência de Estoque</Text>
            </View>

            <View style={[styles.card, { backgroundColor: cardBgColor, borderColor }]}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: textColor }]}>Produto</Text>
                    <View style={[styles.pickerContainer, { borderColor }]}>
                        {/* Simplificado: Idealmente um Modal Picker */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {products.map((p) => (
                                <TouchableOpacity
                                    key={p.productId}
                                    onPress={() => setSelectedProduct(p.productId)}
                                    style={[
                                        styles.chip,
                                        {
                                            backgroundColor: (selectedProduct === p.productId) ? '#8B5CF6' : (isDark ? '#374151' : '#F3F4F6')
                                        }
                                    ]}
                                >
                                    <Text style={{ color: (selectedProduct === p.productId) ? '#FFF' : textColor }}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={[styles.label, { color: textColor }]}>De (Origem)</Text>
                        <View style={[styles.pickerContainer, { borderColor }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {stores.map((s) => (
                                    <TouchableOpacity
                                        key={s.id}
                                        onPress={() => setFromStore(s.id)}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: fromStore === s.id ? '#8B5CF6' : (isDark ? '#374151' : '#F3F4F6')
                                            }
                                        ]}
                                    >
                                        <Text style={{ color: fromStore === s.id ? '#FFF' : textColor }}>{s.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Para (Destino)</Text>
                        <View style={[styles.pickerContainer, { borderColor }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {stores.map((s) => (
                                    <TouchableOpacity
                                        key={s.id}
                                        onPress={() => setToStore(s.id)}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: toStore === s.id ? '#10B981' : (isDark ? '#374151' : '#F3F4F6')
                                            }
                                        ]}
                                    >
                                        <Text style={{ color: toStore === s.id ? '#FFF' : textColor }}>{s.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Quantidade</Text>
                        <TextInput
                            style={[styles.input, { color: textColor, borderColor, backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#6B7280"
                        />
                    </View>
                    <View style={[styles.formGroup, { flex: 2, marginLeft: 8 }]}>
                        <Text style={[styles.label, { color: textColor }]}>Motivo (Opcional)</Text>
                        <TextInput
                            style={[styles.input, { color: textColor, borderColor, backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Ex: Reposição"
                            placeholderTextColor="#6B7280"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleTransfer}
                    disabled={submitting}
                    style={[styles.transferButton, { opacity: submitting ? 0.7 : 1 }]}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <ArrowLeftRight color="#FFF" size={20} />
                            <Text style={styles.transferButtonText}>Realizar Transferência</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.historySection}>
                <View style={styles.sectionHeader}>
                    <History color={textColor} size={20} />
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Histórico Recente</Text>
                </View>

                {transfers.length === 0 ? (
                    <EmptyState
                        icon={Box}
                        title="Nenhuma transferência"
                        description="As movimentações de estoque aparecerão aqui."
                    />
                ) : (
                    transfers.map((item) => (
                        <View key={item.id} style={[styles.historyCard, { backgroundColor: cardBgColor, borderColor }]}>
                            <View style={styles.historyTop}>
                                <Text style={[styles.productName, { color: textColor }]}>
                                    {item.product?.name || 'Produto Removido'}
                                </Text>
                                <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                                    <Text style={styles.badgeText}>{item.quantity} unidades</Text>
                                </View>
                            </View>

                            <View style={styles.transferPath}>
                                <View style={styles.storeLine}>
                                    <Store size={14} color="#6B7280" />
                                    <Text style={styles.storeName}>{item.fromStore?.name}</Text>
                                </View>
                                <ArrowLeftRight size={14} color="#9CA3AF" style={{ marginHorizontal: 8 }} />
                                <View style={styles.storeLine}>
                                    <Store size={14} color="#10B981" />
                                    <Text style={[styles.storeName, { color: '#10B981' }]}>{item.toStore?.name}</Text>
                                </View>
                            </View>

                            <View style={styles.historyFooter}>
                                <Text style={styles.dateText}>
                                    {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                                <Text style={styles.userText}>por {item.requestedBy?.name}</Text>
                            </View>
                            {item.reason && (
                                <Text style={styles.reasonText}>Nota: {item.reason}</Text>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 40,
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 50,
        justifyContent: 'center',
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
    },
    transferButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    transferButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    historySection: {
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    historyCard: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    historyTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    transferPath: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    storeLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeName: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },
    historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    dateText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    userText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    reasonText: {
        fontSize: 12,
        color: '#8B92A9',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        fontStyle: 'italic',
    }
});
