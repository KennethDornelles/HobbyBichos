import { useLocalSearchParams } from 'expo-router';
import OrderDetail from '../../src/screens/Orders/OrderDetail';

export default function OrderDetailsRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <OrderDetail orderId={id || ''} />;
}
