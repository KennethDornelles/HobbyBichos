import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, MessageCircle, Copy, ArrowLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function OrderCreatedScreen() {
    const router = useRouter();
    const { orderId, whatsappLink, pixKey, total } = useLocalSearchParams<{
        orderId: string;
        whatsappLink: string;
        pixKey: string;
        total: string;
    }>();

    const totalValue = parseFloat(total || '0');

    // Formatar valor monetário em BRL
    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Pegar primeiros 8 caracteres do ID
    const shortOrderId = orderId?.substring(0, 8).toUpperCase() || 'N/A';

    // Copiar chave PIX
    const handleCopyPixKey = async () => {
        if (!pixKey) {
            Alert.alert('Erro', 'Chave PIX não disponível');
            return;
        }
        try {
            await Clipboard.setStringAsync(pixKey);
            Alert.alert('Sucesso', 'Chave PIX copiada para a área de transferência!');
        } catch (error) {
            console.error('Erro ao copiar chave PIX:', error);
            Alert.alert('Erro', 'Não foi possível copiar a chave PIX');
        }
    };

    // Abrir WhatsApp
    const handleOpenWhatsapp = async () => {
        if (!whatsappLink) {
            Alert.alert('Erro', 'Link do WhatsApp não disponível');
            return;
        }

        console.log('🔗 Abrindo WhatsApp com link:', whatsappLink);
        console.log('📝 Mensagem decodificada:', decodeURIComponent(whatsappLink));

        try {
            const supported = await Linking.canOpenURL(whatsappLink);
            if (supported) {
                await Linking.openURL(whatsappLink);
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
            }
        } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
            Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
        }
    };

    // Navegar para detalhes do pedido
    const handleTrackOrder = () => {
        router.push(`/pedidos/${orderId}`);
    };

    // Voltar para home
    const handleGoHome = () => {
        router.replace('/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 p-4 items-center justify-center">
                    {/* Ícone de sucesso celebratório */}
                    <View className="mb-8 mt-12">
                        <CheckCircle size={80} color="#22c55e" strokeWidth={1.5} />
                    </View>

                    {/* Texto principal */}
                    <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">Pedido Criado!</Text>
                    <Text className="text-gray-600 text-center mb-8 text-lg">
                        Seu pedido foi criado com sucesso
                    </Text>

                    {/* Número do pedido - Destaque para Delivery */}
                    <View className="bg-white rounded-xl p-5 w-full mb-6 border-2 border-[#FFD25D] shadow-md">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-gray-700 text-base font-bold">🚚 Rastreamento</Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    await Clipboard.setStringAsync(orderId || '');
                                    Alert.alert('Copiado!', 'Número do pedido copiado');
                                }}
                                className="bg-gray-100 rounded-lg px-3 py-1 flex-row items-center"
                            >
                                <Copy size={14} color="#6b7280" style={{ marginRight: 4 }} />
                                <Text className="text-gray-600 text-xs font-semibold">Copiar</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-[#1A1B2E] text-3xl font-bold tracking-wider">#{shortOrderId}</Text>
                        <Text className="text-xs text-gray-500 mt-2">Use este número para acompanhar seu pedido</Text>
                    </View>

                    {/* Total destacado */}
                    <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 w-full mb-6 border border-blue-200">
                        <Text className="text-gray-600 text-center text-sm font-semibold mb-2">Valor Total</Text>
                        <Text className="text-4xl font-bold text-blue-900 text-center">
                            {formatCurrency(totalValue)}
                        </Text>
                    </View>

                    {/* Card informativo */}
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full mb-6">
                        <Text className="text-amber-900 font-semibold mb-2">Próximos Passos</Text>
                        <Text className="text-amber-800 text-sm leading-5">
                            Agora finalize seu pagamento pelo WhatsApp da loja. Envie a mensagem com os dados do seu pedido e aguarde a confirmação do pagamento para que seu pedido seja processado.
                        </Text>
                    </View>

                    {/* Botões de ação */}
                    {/* Botão principal - Abrir WhatsApp */}
                    <TouchableOpacity
                        onPress={handleOpenWhatsapp}
                        className="bg-green-500 rounded-xl p-4 w-full flex-row items-center justify-center mb-3 shadow-lg"
                    >
                        <MessageCircle size={22} color="white" style={{ marginRight: 10 }} />
                        <Text className="text-white font-bold text-lg text-center">Abrir WhatsApp</Text>
                    </TouchableOpacity>

                    {/* Botão secundário - Copiar PIX */}
                    {pixKey && (
                        <TouchableOpacity
                            onPress={handleCopyPixKey}
                            className="bg-blue-500 rounded-xl p-4 w-full flex-row items-center justify-center mb-3"
                        >
                            <Copy size={22} color="white" style={{ marginRight: 10 }} />
                            <Text className="text-white font-bold text-lg text-center">Copiar Chave PIX</Text>
                        </TouchableOpacity>
                    )}

                    {/* Botão terciário - Acompanhar pedido */}
                    <TouchableOpacity
                        onPress={handleTrackOrder}
                        className="bg-white border-2 border-gray-300 rounded-xl p-4 w-full"
                    >
                        <Text className="text-gray-800 font-bold text-lg text-center">Acompanhar Pedido</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Link para voltar ao home no rodapé */}
            <View className="p-4 border-t border-gray-200 bg-white">
                <TouchableOpacity onPress={handleGoHome} className="flex-row items-center justify-center">
                    <ArrowLeft size={18} color="#6b7280" style={{ marginRight: 8 }} />
                    <Text className="text-gray-600 text-sm font-semibold">Voltar para Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
