import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CustomerProfile() {
    const { customer, logout, token } = useContext(CustomerContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (token) {
            api.get('/customer/orders', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => setOrders(res.data))
                .catch(err => console.error('Failed to load orders', err));
        }
    }, [token]);

    // ... profile UI above here

    return (
        <div className="container mt-5 mb-5">
            {/* Profile Section */}
            <h2 className="mb-4">👤 My Profile</h2>
            <div className="card shadow p-4 mb-4">
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <button onClick={logout} className="btn btn-danger mt-3">Logout</button>
                <Link to="/customer/update-profile" className="btn btn-outline-primary mt-2">
                    Edit Profile
                </Link>
            </div>


            {/* Order History Section */}
            <h4 className="mb-3">📦 My Orders</h4>
            {orders.length === 0 ? (
                <div className="alert alert-info">You have not placed any orders yet.</div>
            ) : (
                <div className="list-group">
                    {orders.map(order => (
                        <div key={order._id} className="list-group-item mb-3 border rounded shadow-sm">
                            <div><strong>Order ID:</strong> {order._id}</div>
                            <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                            <div><strong>Shop:</strong> {order.shop?.name}</div>
                            <div><strong>Total:</strong> ₹{order.totalAmount}</div>
                            <div><strong>Status:</strong> {order.status}</div>
                            <ul className="mt-2">
                                {order.products.map(item => (
                                    <li key={item.product._id}>
                                        {item.product.name} × {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
