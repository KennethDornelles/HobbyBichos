import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: __DEV__ // Em desenvolvimento mostra por padrão, em prod esconde
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null, showDetails: __DEV__ };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRestart = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReset = async () => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const SecureStore = require('expo-secure-store');

            await Promise.all([
                AsyncStorage.clear(),
                SecureStore.deleteItemAsync('authToken'),
                SecureStore.deleteItemAsync('refreshToken'),
            ]);

            // Forçar recarregamento/reboot do JS (se expo-updates estiver disponível)
            try {
                const Updates = require('expo-updates');
                await Updates.reloadAsync();
            } catch (e) {
                // Se não houver updates, apenas limpa o estado e tenta reiniciar
                this.handleRestart();
            }
        } catch (e) {
            alert('Erro ao resetar dados. Por favor, limpe os dados do app nas configurações do Android.');
        }
    };

    toggleDetails = () => {
        this.setState(prev => ({ showDetails: !prev.showDetails }));
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 50 }}>🐶</Text>
                        </View>

                        <Text style={styles.title}>Ops! Algo deu errado.</Text>
                        <Text style={styles.subtitle}>
                            Ocorreu um erro inesperado. Você pode tentar reiniciar o aplicativo ou limpar os dados de login se o problema persistir.
                        </Text>

                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <Text style={styles.buttonText}>Tentar Novamente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#444', marginTop: -10 }]}
                            onPress={this.handleReset}
                        >
                            <Text style={styles.buttonText}>Resetar App (Limpar Login)</Text>
                        </TouchableOpacity>

                        {/* Área de Debug - Discreta ou oculta em produção */}
                        <TouchableOpacity onPress={this.toggleDetails} style={styles.detailsButton}>
                            <Text style={styles.detailsButtonText}>
                                {this.state.showDetails ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
                            </Text>
                        </TouchableOpacity>

                        {this.state.showDetails && (
                            <View style={{ width: '100%' }}>
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>
                                        {this.state.error?.toString()}
                                    </Text>
                                </View>

                                {this.state.errorInfo && (
                                    <ScrollView style={styles.stackBox} nestedScrollEnabled>
                                        <Text style={styles.stackText}>
                                            {this.state.errorInfo.componentStack}
                                        </Text>
                                    </ScrollView>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA', // Cor mais amigável (Light) ou use Theme
    },
    content: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#FF6B35',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailsButton: {
        padding: 10,
        marginBottom: 10,
    },
    detailsButtonText: {
        color: '#999',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    errorBox: {
        backgroundColor: '#FEE2E2',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    errorText: {
        color: '#B91C1C',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    stackBox: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#EFF6FF',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    stackText: {
        color: '#1E40AF',
        fontSize: 10,
        fontFamily: 'monospace',
    },
});
