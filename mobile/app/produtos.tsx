import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import api from '../src/services/api';
import { ProductCard } from '../src/components/ProductCard';

interface ProductDto {
    id: string;
    name: string;
    basePrice: number;
    images?: string[];
    sku?: string | null;
    barcode?: string | null;
    stocks?: Array<{ quantity: number }>;
}

export default function ProdutosScreen() {
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get<ProductDto[]>('/products');
            setProducts(res.data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    return (
        <ScrollView className="flex-1 p-4" refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
            <Text className="text-2xl font-semibold mb-4">Produtos</Text>
            {products.map((p) => (
                <ProductCard product={p} key={p.id} />
            ))}
        </ScrollView>
    );
}
