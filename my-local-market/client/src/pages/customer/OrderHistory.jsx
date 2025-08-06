// src/customer/OrderHistory.jsx
import { useEffect, useState } from 'react';
import { useCustomer } from '../../contexts/CustomerContext';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';

export default function OrderHistory() {
    const { customer } = useCustomer();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/customers/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customer) fetchOrders();
    }, [customer]);

    if (loading) {
        return <div className="container pt-5 mt-4">Loading your orders...</div>;
    }

    if (!orders.length) {
        return <div className="container pt-5 mt-4">You have no previous orders.</div>;
    }

    return (
        <div className="container mt-4">
            <h3>Your Order History</h3>
            {orders.map((order) => (
                <div key={order._id} className="mb-4 p-3 border rounded shadow-sm">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                        {order.products.map((item, idx) => (
                            <div key={`${order._id}-${item.product._id}-${idx}`} className="col">
                                <ProductCard
                                    product={item.product}
                                    quantity={item.quantity}
                                    showQuantity={true}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="mb-1"><strong>Shop:</strong> {order.shop?.name}</p>
                    <p className="mb-1"><strong>Ordered At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="mb-3"><strong>Status:</strong> {order.status}</p>
                    <p className="mb-3"><strong>Total:</strong> ₹{order.totalAmount}</p>
                </div>
            ))}
        </div>
    );
}
