import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

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
      await api.patch(
        '/cart/update',
        { productId, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`, {
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
        await api.post(
          '/customers/orders',
          {
            cart: group.items.map(({ product, quantity }) => ({
              product: product._id,
              quantity,
            })),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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

  // 💰 Calculate total cart value
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        Object.entries(groupedItems).map(([shopId, group]) => (
          <div key={shopId} className="mb-4">
            <h5 className="mb-3">{group.shop.name}</h5>
            <div className="row">
              {group.items.map((item) => (
                <div
                  key={item.product._id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                >
                  <div className="card w-100 h-100 d-flex flex-column justify-content-between">
                    <div className="p-2">
                      <ProductCard product={item.product} />
                    </div>
                    <div className="p-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="me-2 mb-0">Qty:</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.product._id, parseInt(e.target.value))
                          }
                          className="form-control form-control-sm"
                          style={{ width: 70 }}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">
                          ₹{item.product.price * item.quantity}
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemove(item.product._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {cartItems.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <h5>Total: ₹{calculateTotal()}</h5>
          <button className="btn btn-primary" onClick={handleCheckout}>
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
