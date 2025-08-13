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
  const [userDetails, setUserDetails] = useState(null); // For passing to modal
  const navigate = useNavigate();

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get('/cart');
        setCart(data.cart);

        // Fetch user details for ConfirmOrderModal
        const userRes = await api.get('/customers/profile');
        setUserDetails(userRes.data);
      } catch (err) {
        console.error('Error fetching cart or user details:', err);
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
    const missingDetails =
      !userDetails?.address?.street ||
      !userDetails?.address?.city ||
      !userDetails?.address?.state ||
      !userDetails?.address?.pincode ||
      !userDetails?.phone;

    if (missingDetails) {
      setShowMissingModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmOrder = async (orderData) => {
    try {
      await placeOrder(orderData);
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
        <MissingDetailsModal
          show={showMissingModal}
          onClose={() => setShowMissingModal(false)}
          phone={userDetails?.phone || ''}
          address={userDetails?.address || { street: '', city: '', state: '', pincode: '' }}
          onMobileChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
          onAddressChange={(field, value) =>
            setUserDetails({
              ...userDetails,
              address: { ...userDetails.address, [field]: value },
            })
          }
          onSaveAndContinue={(e) => {
            e.preventDefault();
            setShowMissingModal(false);
            setShowConfirmModal(true);
          }}
        />
      )}

      {showConfirmModal && selectedSection && (
        <ConfirmOrderModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          cartItems={groupedCart[selectedSection].items}
          confirmDetails={userDetails}
          onConfirmOrder={confirmOrder}
        />
      )}
    </div>
  );
}
