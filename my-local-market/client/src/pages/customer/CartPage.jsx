import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('customerToken');

  useEffect(() => {
    if (!token) {
      navigate('/customer/login');
    } else {
      fetchCart();
    }
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.cart || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  const updateQuantity = async (productId, qty) => {
    try {
      await api.patch('/cart/update', {
        productId,
        quantity: qty,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(); // refresh UI
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
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
    try {
      const grouped = Object.values(groupByShop());
      for (const group of grouped) {
        await api.post('/orders', {
          cart: group.items.map(({ product, quantity }) => ({
            product: product._id,
            quantity,
          })),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

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
            {group.items.map((item) => (
              <div key={item.product._id} className="d-flex align-items-center justify-content-between border-bottom py-2">
                <div>{item.product.name}</div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.product._id, parseInt(e.target.value))
                  }
                  style={{ width: 60 }}
                />
                <div>₹{item.product.price * item.quantity}</div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemove(item.product._id)}
                >
                  Remove
                </button>
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
