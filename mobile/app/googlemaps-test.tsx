import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyPetShops } from '../src/hooks/useNearbyPetShops';
import { useDeliveryLocation } from '../src/hooks/useDeliveryLocation';
import DeliveryTracking from '../src/components/DeliveryTracking';
import { getGoogleMapsService } from '../src/services/googleMapsService';
import { useThemeColors } from '../src/hooks/useThemeColors';

type Tab = 'nearby' | 'delivery';

/**
 * Tela de teste para funcionalidades de Google Maps
 * - Busca de pet shops próximos
 * - Rastreamento de entrega em tempo real
 */
export default function MapsTestScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<Tab>('nearby');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Hook para buscar pet shops próximos
    const { shops, loading, error, userLocation, refetch } = useNearbyPetShops(5000, true);

    // Estado para teste de rastreamento
    const [selectedShop, setSelectedShop] = useState<typeof shops[0] | null>(shops[0] || null);
    const [deliveryRoute, setDeliveryRoute] = useState<any>(null);
    const [deliveryLoading, setDeliveryLoading] = useState(false);

    // Hook para simular movimento do entregador
    const { driverLocation, isSimulating, progress, startSimulation, stopSimulation } =
        useDeliveryLocation(deliveryRoute);

    /**
     * Handle refresh
     */
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    /**
     * Obtém rota de entrega para um shop selecionado
     */
    const fetchDeliveryRoute = async (shopId: string) => {
        const shop = shops.find((s) => s.id === shopId);
        if (!shop || !userLocation) {
            Alert.alert('Erro', 'Selecione uma loja válida');
            return;
        }

        setDeliveryLoading(true);
        try {
            const mapsService = await getGoogleMapsService();

            // Chama Directions API para obter a rota
            const route = await mapsService.processDeliveryRoute(
                `${userLocation.lat},${userLocation.lng}`,
                `${shop.latitude},${shop.longitude}`,
                shop.name,
            );

            setDeliveryRoute(route);
            setSelectedShop(shop);

            // Inicia simulação
            setTimeout(() => {
                startSimulation();
            }, 500);
        } catch (err) {
            const error = err as any;
            Alert.alert('Erro', error.error_message || 'Erro ao obter rota de entrega');
        } finally {
            setDeliveryLoading(false);
        }
    };

    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bgCard} />

            {/* Header com SafeAreaView */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bgCard }}>
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'nearby' && styles.tabActive]}
                        onPress={() => setActiveTab('nearby')}
                    >
                        <Text style={[styles.tabText, activeTab === 'nearby' && styles.tabTextActive]}>
                            🔍 Lojas Próximas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'delivery' && styles.tabActive]}
                        onPress={() => setActiveTab('delivery')}
                    >
                        <Text style={[styles.tabText, activeTab === 'delivery' && styles.tabTextActive]}>
                            🚗 Rastreamento
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Tab Content */}
            {activeTab === 'nearby' ? (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                >
                    {/* Localização do usuário */}
                    {userLocation && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📍 Sua Localização</Text>
                            <Text style={styles.locationText}>
                                Latitude: {userLocation.lat.toFixed(4)}
                            </Text>
                            <Text style={styles.locationText}>
                                Longitude: {userLocation.lng.toFixed(4)}
                            </Text>
                        </View>
                    )}

                    {/* Estado de carregamento */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.accentYellow} />
                            <Text style={styles.loadingText}>Buscando lojas próximas...</Text>
                        </View>
                    )}

                    {/* Erros */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorTitle}>⚠ Erro</Text>
                            <Text style={styles.errorText}>{error.error_message}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Lista de lojas */}
                    {!loading && shops.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏪 Top 3 Lojas Mais Próximas</Text>
                            {shops.map((shop, index) => (
                                <TouchableOpacity
                                    key={shop.id}
                                    style={styles.shopCard}
                                    onPress={() => fetchDeliveryRoute(shop.id)}
                                    disabled={deliveryLoading}
                                >
                                    <View style={styles.shopHeader}>
                                        <View>
                                            <Text style={styles.shopRank}>#{index + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.shopName}>{shop.name}</Text>
                                            <Text style={styles.shopAddress} numberOfLines={1}>
                                                {shop.address}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.shopDetails}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>📏 Distância</Text>
                                            <Text style={styles.detailValue}>{shop.distance}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>⏱️ Tempo</Text>
                                            <Text style={styles.detailValue}>{shop.duration}</Text>
                                        </View>
                                        {shop.rating && (
                                            <View style={styles.detailItem}>
                                                <Text style={styles.detailLabel}>⭐ Avaliação</Text>
                                                <Text style={styles.detailValue}>{shop.rating.toFixed(1)}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.shopAction}>
                                        <Text style={styles.shopActionText}>
                                            {deliveryLoading ? 'Carregando...' : '→ Rastrear Entrega'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {!loading && shops.length === 0 && !error && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhuma loja encontrada próxima a você</Text>
                        </View>
                    )}
                </ScrollView>
            ) : (
                /* Tab Delivery */
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>)
                    {deliveryRoute && selectedShop ? (
                        <View style={styles.deliveryContainer}>
                            {/* Informações da loja selecionada */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>🏪 Entrega de: {selectedShop.name}</Text>
                                <Text style={styles.shopAddress}>{deliveryRoute.destination_address}</Text>
                            </View>

                            {/* Mapa de rastreamento */}
                            <View style={styles.mapContainer}>
                                <DeliveryTracking
                                    route={deliveryRoute}
                                    driverLocation={driverLocation}
                                    progress={progress}
                                    driverName="João Silva (Entregador)"
                                    height={400}
                                    autoCenter={true}
                                />
                            </View>

                            {/* Controles de simulação */}
                            <View style={styles.section}>
                                <View style={styles.controlsContainer}>
                                    {!isSimulating ? (
                                        <TouchableOpacity
                                            style={styles.buttonPrimary}
                                            onPress={startSimulation}
                                        >
                                            <Text style={styles.buttonText}>▶️ Iniciar Simulação</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.buttonPrimary, styles.buttonDanger]}
                                            onPress={stopSimulation}
                                        >
                                            <Text style={styles.buttonText}>⏹️ Parar Simulação</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.buttonSecondary}
                                        onPress={() => {
                                            setDeliveryRoute(null);
                                            setSelectedShop(null);
                                            stopSimulation();
                                            setActiveTab('nearby');
                                        }}
                                    >
                                        <Text style={styles.buttonSecondaryText}>← Voltar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Informações de rota */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📊 Informações da Rota</Text>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Distância Total:</Text>
                                    <Text style={styles.infoValue}>{deliveryRoute.distance_text}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Tempo Estimado:</Text>
                                    <Text style={styles.infoValue}>{deliveryRoute.duration_text}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Coordenadas de Origem:</Text>
                                    <Text style={styles.infoValueSmall}>
                                        {deliveryRoute.origin_lat.toFixed(4)}, {deliveryRoute.origin_lng.toFixed(4)}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Coordenadas de Destino:</Text>
                                    <Text style={styles.infoValueSmall}>
                                        {deliveryRoute.destination_lat.toFixed(4)}, {deliveryRoute.destination_lng.toFixed(4)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                👈 Selecione uma loja na aba "Lojas Próximas" para rastrear uma entrega
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgMain,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColor,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: colors.accentYellow,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.accentYellow,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMain,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginVertical: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textSecondary,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#DC2626',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#991B1B',
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#DC2626',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 12,
    },
    shopCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.accentYellow,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    shopHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    shopRank: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.accentYellow,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMain,
    },
    shopAddress: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    shopDetails: {
        flexDirection: 'row',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    detailItem: {
        flex: 1,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMain,
    },
    shopAction: {
        backgroundColor: colors.accentYellow + '20',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    shopActionText: {
        color: colors.accentYellow,
        fontWeight: '500',
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    deliveryContainer: {
        marginBottom: 20,
    },
    mapContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.bgCard,
    },
    controlsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonPrimary: {
        flex: 1,
        backgroundColor: colors.accentYellow,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDanger: {
        backgroundColor: '#EF4444',
    },
    buttonSecondary: {
        flex: 1,
        backgroundColor: colors.bgCard,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.bgMain,
        fontWeight: '600',
        fontSize: 12,
    },
    buttonSecondaryText: {
        color: colors.textMain,
        fontWeight: '600',
        fontSize: 12,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderColor,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMain,
    },
    infoValueSmall: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.accentYellow,
        textAlign: 'right',
        flex: 1,
    },
});