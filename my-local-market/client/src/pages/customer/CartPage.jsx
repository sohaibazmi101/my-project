import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import MissingDetailsModal from '../components/MissingDetailsModal';
import ConfirmOrderModal from '../components/ConfirmOrderModal';
import { placeOrder } from '../../services/orderService';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get('/cart');
        setCart(data.cart);
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Group cart items by shop
  const groupedCart = cart.reduce((groups, item) => {
    const shopId = item.product?.shop?._id;
    if (!shopId) return groups;
    if (!groups[shopId]) {
      groups[shopId] = {
        shop: item.product.shop,
        items: [],
      };
    }
    groups[shopId].items.push(item);
    return groups;
  }, {});

  const handlePlaceOrder = (shopId) => {
    setSelectedSection(shopId);
    // Example check: if user missing address or other info
    const missingDetails = false; // Replace with actual logic
    if (missingDetails) {
      setShowMissingModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmOrder = async () => {
    if (!selectedSection) return;

    const section = groupedCart[selectedSection];
    const orderPayload = {
      shop: section.shop._id,
      products: section.items.map(i => ({
        product: i.product._id,
        quantity: i.quantity
      })),
      totalAmount: section.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ),
      paymentMethod: 'Cash on Delivery', // Or integrate Razorpay
      shippingAddress: {}, // Fill from user profile
    };

    try {
      await placeOrder(orderPayload);
      navigate('/customer/orders');
    } catch (err) {
      console.error('Order placement error:', err);
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!cart.length) return <p>Your cart is empty.</p>;

  return (
    <div className="cart-page">
      {Object.values(groupedCart).map((group) => (
        <div key={group.shop._id} className="cart-section">
          <h2>{group.shop.name}</h2>
          <div className="cart-items">
            {group.items.map((item) => (
              <ProductCard
                key={item.product._id}
                product={item.product}
                quantity={item.quantity}
              />
            ))}
          </div>
          <div className="cart-section-footer">
            <p>
              Total: ₹
              {group.items.reduce(
                (sum, i) => sum + i.product.price * i.quantity,
                0
              )}
            </p>
            <button onClick={() => handlePlaceOrder(group.shop._id)}>
              Place Order
            </button>
          </div>
        </div>
      ))}

      {showMissingModal && (
        <MissingDetailsModal onClose={() => setShowMissingModal(false)} />
      )}

      {showConfirmModal && (
        <ConfirmOrderModal
          onConfirm={confirmOrder}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
