import { useEffect, useState } from 'react';
import { getCart, saveCart, removeFromCart, clearCart } from '../../utils/cart';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const updateQuantity = (index, qty) => {
    const updated = [...cartItems];
    updated[index].quantity = qty;
    setCartItems(updated);
    saveCart(updated);
  };

  const handleRemove = (productId) => {
    const updated = cartItems.filter(item => item.product._id !== productId);
    setCartItems(updated);
    saveCart(updated);
  };

  const groupByShop = () => {
    const grouped = {};
    for (const item of cartItems) {
      const shopId = item.product.shop._id;
      if (!grouped[shopId]) {
        grouped[shopId] = {
          shop: item.product.shop,
          items: [],
        };
      }
      grouped[shopId].items.push(item);
    }
    return grouped;
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) return navigate('/customer/login');

    try {
      const grouped = Object.values(groupByShop());
      for (const group of grouped) {
        await api.post('/orders', {
          shop: group.shop._id,
          products: group.items.map(({ product, quantity }) => ({
            product: product._id,
            quantity,
          })),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      clearCart();
      setCartItems([]);
      alert('Order placed successfully!');
      navigate('/customer/profile');
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order.');
    }
  };

  const groupedItems = groupByShop();

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        Object.entries(groupedItems).map(([shopId, group]) => (
          <div key={shopId} className="mb-4">
            <h4>{group.shop.name}</h4>
            {group.items.map((item, idx) => (
              <div key={item.product._id} className="d-flex align-items-center justify-content-between border-bottom py-2">
                <div>{item.product.name}</div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(idx, parseInt(e.target.value))}
                  style={{ width: 60 }}
                />
                <div>₹{item.product.price * item.quantity}</div>
                <button className="btn btn-sm btn-danger" onClick={() => handleRemove(item.product._id)}>Remove</button>
              </div>
            ))}
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <button className="btn btn-primary" onClick={handleCheckout}>
          Place Order
        </button>
      )}
    </div>
  );
}
