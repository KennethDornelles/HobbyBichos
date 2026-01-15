// @copilot: Implemente um scanner híbrido para React Native/Expo que:
// - Use CameraView do expo-camera com suporte a QR Code e códigos de barras
// - Inclua sistema de permissões completo
// - Tenha overlay visual com moldura centralizada (280x280) e cantos verdes
// - Diferencie QR Codes (membros) de Barcodes (produtos) automaticamente
// - Implemente lock anti-múltiplas-leituras com useRef
// - Adicione feedback háptico (Haptics + Vibration)
// - Crie 2 modais: um para membros (Clube Hobby) e outro para produtos
// - Inclua botão de Flash/Torch
// - Use os mock data fornecidos acima
// - TypeScript com tipagem estrita

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Linking, Modal, Pressable, StyleSheet, Text, View, Vibration, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { MemberData, ProductData } from "../types/scanner.types";
import { fetchMemberById, fetchMemberByCode, fetchProductByBarcode } from "../services/scannerService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCAN_SIZE = 280;
const CORNER_SIZE = 40;
const CORNER_THICKNESS = 3;

function formatCurrency(value: number): string {
    try {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    } catch {
        return `R$ ${value.toFixed(2)}`;
    }
}

function isEmail(data: string): boolean {
    return /@/.test(data.trim());
}

function isMemberCode(data: string): boolean {
    return /^USER\d+$/i.test(data.trim());
}

function isNumericBarcode(data: string): boolean {
    return /^\d+$/.test(data.trim());
}

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [torchOn, setTorchOn] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(true);

    const scanLockRef = useRef<boolean>(false);
    const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScanRef = useRef<number>(0);

    const [memberModalVisible, setMemberModalVisible] = useState<boolean>(false);
    const [productModalVisible, setProductModalVisible] = useState<boolean>(false);
    const [memberResult, setMemberResult] = useState<MemberData | null>(null);
    const [productResult, setProductResult] = useState<{ barcode: string; data: ProductData } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            if (lockTimerRef.current) {
                clearTimeout(lockTimerRef.current);
                lockTimerRef.current = null;
            }
        };
    }, []);

    const topMaskHeight = useMemo(() => Math.max(0, (SCREEN_HEIGHT - SCAN_SIZE) / 2), []);
    const sideMaskWidth = useMemo(() => Math.max(0, (SCREEN_WIDTH - SCAN_SIZE) / 2), []);

    const triggerFeedback = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
            // Fallback silencioso se Haptics não disponível
        }
        try {
            Vibration.vibrate(100);
        } catch {
            // Ignorar possíveis erros de vibração
        }
    }, []);

    const handleQRCode = useCallback(async (payloadRaw: string) => {
        const payload = payloadRaw.trim();
        setIsLoading(true);
        try {
            let member: MemberData | null = null;
            if (isEmail(payload)) {
                member = await fetchMemberById(payload);
            } else if (isMemberCode(payload)) {
                member = await fetchMemberByCode(payload);
            } else {
                // tenta como ID (uuid)
                member = await fetchMemberById(payload);
            }
            if (!member) {
                Alert.alert(
                    "Membro não encontrado",
                    `Nenhum membro encontrado para: ${payload}\n\nVerifique se o código está correto ou se o cliente é membro do Clube Hobby.`
                );
                return;
            }
            setMemberResult(member);
            setIsScanning(false);
            setMemberModalVisible(true);
        } catch (error) {
            Alert.alert("Erro", "Falha ao buscar dados do membro.");
            console.error("Erro ao buscar membro:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleBarcode = useCallback(async (barcodeRaw: string) => {
        const barcode = barcodeRaw.trim();
        if (!isNumericBarcode(barcode)) {
            Alert.alert("Formato inválido", "Código de barras deve ser numérico.");
            return;
        }
        setIsLoading(true);
        try {
            const product = await fetchProductByBarcode(barcode);
            if (!product) {
                Alert.alert("Produto não encontrado", "Não há produto com este código de barras.");
                return;
            }
            setProductResult({ barcode, data: product });
            setIsScanning(false);
            setProductModalVisible(true);
        } catch (error) {
            Alert.alert("Erro", "Falha ao buscar dados do produto.");
            console.error("Erro ao buscar produto:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleOnBarcodeScanned = useCallback(
        async (result: BarcodeScanningResult) => {
            if (scanLockRef.current || !isScanning) return;

            const now = Date.now();
            if (now - lastScanRef.current < 600) return; // throttle simples
            lastScanRef.current = now;

            try {
                const data = (result?.data ?? "").trim();
                if (!data) return;

                scanLockRef.current = true;
                await triggerFeedback();

                if (result.type === "qr" || isEmail(data) || isMemberCode(data)) {
                    handleQRCode(data);
                } else {
                    handleBarcode(data);
                }
            } catch (err) {
                Alert.alert("Erro", "Falha ao processar o código escaneado.");
            } finally {
                if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
                lockTimerRef.current = setTimeout(() => {
                    scanLockRef.current = false;
                }, 1500);
            }
        },
        [isScanning, triggerFeedback, handleQRCode, handleBarcode]
    );

    const closeMemberModal = useCallback(() => {
        setMemberModalVisible(false);
        setMemberResult(null);
        setIsScanning(true);
    }, []);

    const applyMemberDiscount = useCallback(() => {
        // Aqui poderia integrar com o carrinho/checkout para aplicar desconto
        closeMemberModal();
    }, [closeMemberModal]);

    const closeProductModal = useCallback(() => {
        setProductModalVisible(false);
        setProductResult(null);
        setIsScanning(true);
    }, []);

    const addProduct = useCallback(() => {
        // Aqui poderia integrar com o carrinho para adicionar o produto
        closeProductModal();
    }, [closeProductModal]);

    // Fluxo de permissões
    if (!permission) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.infoText}>Verificando permissões da câmera…</Text>
            </View>
        );
    }

    if (!permission.granted) {
        if (permission.canAskAgain) {
            return (
                <View style={styles.centeredContainer}>
                    <Text style={styles.permissionTitle}>Permitir acesso à câmera</Text>
                    <Text style={styles.permissionText}>
                        Precisamos da câmera para escanear QR Codes e códigos de barras.
                    </Text>
                    <Pressable style={styles.primaryButton} onPress={() => requestPermission()}>
                        <Text style={styles.primaryButtonText}>Permitir Câmera</Text>
                    </Pressable>
                </View>
            );
        }
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.permissionTitle}>Permissão negada permanentemente</Text>
                <Text style={styles.permissionText}>
                    Abra as configurações do sistema para conceder acesso à câmera.
                </Text>
                <Pressable style={styles.primaryButton} onPress={() => Linking.openSettings()}>
                    <Text style={styles.primaryButtonText}>Abrir Configurações</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={isScanning ? handleOnBarcodeScanned : undefined}
                enableTorch={torchOn}
            />

            {/* Overlay de Scanner */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {/* Máscaras superior e inferior */}
                <View style={[styles.mask, { height: topMaskHeight }]} />
                <View style={[styles.centerRow]}>
                    <View style={[styles.mask, { width: sideMaskWidth }]} />

                    {/* Área de scan */}
                    <View style={styles.scanArea}>
                        {/* Cantos verdes */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>

                    <View style={[styles.mask, { width: sideMaskWidth }]} />
                </View>
                <View style={[styles.mask, { height: topMaskHeight }]} />
            </View>

            {/* Texto instrucional */}
            <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>Aponte para QR Code ou código de barras</Text>
            </View>

            {/* Botão Torch */}
            <View style={styles.bottomControls}>
                <Pressable
                    style={[styles.torchButton, torchOn ? styles.torchOn : styles.torchOff]}
                    onPress={() => setTorchOn((t) => !t)}
                >
                    <Text style={styles.torchButtonText}>{torchOn ? "💡" : "🔦"}</Text>
                </Pressable>
            </View>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFD25D" />
                        <Text style={styles.loadingText}>Buscando dados...</Text>
                    </View>
                </View>
            )}

            {/* Modal de Membro */}
            <Modal visible={memberModalVisible} transparent animationType="fade" onRequestClose={closeMemberModal}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>👥 Clube Hobby</Text>
                        {memberResult && (
                            <View style={styles.modalContent}>
                                <Text style={styles.memberName}>{memberResult.name}</Text>
                                <Text style={styles.modalText}>ID: {memberResult.id}</Text>
                                <Text style={styles.modalText}>CPF: {memberResult.cpf}</Text>
                                <View style={styles.badgeDiscount}>
                                    <Text style={styles.badgeText}>{memberResult.discount}% de desconto</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.modalButtonsRow}>
                            <Pressable style={styles.secondaryButton} onPress={closeMemberModal}>
                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.primaryButton} onPress={applyMemberDiscount}>
                                <Text style={styles.primaryButtonText}>Aplicar Desconto</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Produto */}
            <Modal visible={productModalVisible} transparent animationType="fade" onRequestClose={closeProductModal}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>📦 Produto Encontrado</Text>
                        {productResult && (
                            <View style={styles.modalContent}>
                                <Text style={styles.productName}>{productResult.data.name}</Text>
                                <Text style={styles.modalText}>Código de Barras: {productResult.barcode}</Text>
                                <View style={styles.gridRow}>
                                    <View style={styles.gridCell}>
                                        <Text style={styles.gridLabel}>Preço</Text>
                                        <Text style={styles.gridValue}>{formatCurrency(productResult.data.price)}</Text>
                                    </View>
                                    <View style={styles.gridCell}>
                                        <Text style={styles.gridLabel}>Estoque</Text>
                                        <Text style={[styles.gridValue, productResult.data.stock < 20 ? styles.lowStock : undefined]}>
                                            {productResult.data.stock} un.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        <View style={styles.modalButtonsRow}>
                            <Pressable style={styles.secondaryButton} onPress={closeProductModal}>
                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.primaryButton} onPress={addProduct}>
                                <Text style={styles.primaryButtonText}>Adicionar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Styles extraídos fora do componente
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    centeredContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "#000",
    },
    infoText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    permissionTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
    },
    permissionText: {
        color: "#ddd",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    mask: {
        backgroundColor: "rgba(0,0,0,0.6)",
        width: "100%",
    },
    centerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: SCAN_SIZE,
        width: "100%",
    },
    scanArea: {
        width: SCAN_SIZE,
        height: SCAN_SIZE,
        borderColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    corner: {
        position: "absolute",
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: "#00C853",
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopWidth: CORNER_THICKNESS,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderRightWidth: CORNER_THICKNESS,
        borderTopWidth: CORNER_THICKNESS,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomWidth: CORNER_THICKNESS,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomWidth: CORNER_THICKNESS,
    },
    instructionContainer: {
        position: "absolute",
        bottom: 110,
        width: "100%",
        alignItems: "center",
    },
    instructionText: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        opacity: 0.9,
    },
    bottomControls: {
        position: "absolute",
        bottom: 40,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    torchButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    torchOn: {
        backgroundColor: "#00C853",
    },
    torchOff: {
        backgroundColor: "#333",
    },
    torchButtonText: {
        fontSize: 28,
        color: "#fff",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 12,
        backgroundColor: "#111",
        padding: 16,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    memberName: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    productName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
    },
    modalText: {
        color: "#ccc",
        fontSize: 14,
        marginBottom: 4,
    },
    badgeDiscount: {
        alignSelf: "flex-start",
        backgroundColor: "#00C853",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 8,
    },
    badgeText: {
        color: "#0b1b0f",
        fontWeight: "700",
    },
    gridRow: {
        flexDirection: "row",
        gap: 12,
    },
    gridCell: {
        flex: 1,
    },
    gridLabel: {
        color: "#bbb",
        fontSize: 12,
        marginBottom: 4,
    },
    gridValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    lowStock: {
        color: "#FF5252",
    },
    modalButtonsRow: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#FFD25D",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 200,
    },
    primaryButtonText: {
        color: "#111827",
        fontWeight: "700",
        fontSize: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#333",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
