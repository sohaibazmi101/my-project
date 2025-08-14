import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ConfirmOrderModal from '../components/ConfirmOrderModal';
import MissingDetailsModal from '../components/MissingDetailsModal';
import ErrorModal from '../../components/ErrorModal';
import SuccessModal from '../../components/SuccessModal';
import { placeOrder } from '../../services/orderService';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch cart & user details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get('/cart');
        setCart(data.cart);

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
    if (!groups[shopId]) groups[shopId] = { shop: item.product.shop, items: [] };
    groups[shopId].items.push(item);
    return groups;
  }, {});

  // Place order handler
  const handlePlaceOrder = (shopId) => {
    setSelectedSection(shopId);
    const missingDetails =
      !userDetails?.address?.street ||
      !userDetails?.address?.city ||
      !userDetails?.address?.state ||
      !userDetails?.address?.pincode ||
      !userDetails?.phone;

    if (missingDetails) setShowMissingModal(true);
    else setShowConfirmModal(true);
  };

  // Confirm order
  const confirmOrder = async (orderData) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('Customer not logged in');

      setOrderLoading(true);
      await placeOrder(orderData, token);

      setShowConfirmModal(false);
      setSuccessMessage('Order placed successfully!');
      setShowSuccess(true);
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order');
      setShowError(true);
    } finally {
      setOrderLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      setCart(cart.filter((item) => item.product._id !== productId));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setErrorMessage('Failed to remove item from cart');
      setShowError(true);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('Not logged in');

      await api.patch('/cart/update', { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(cart.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      ));
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update quantity');
      setShowError(true);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!cart.length) return <p>Your cart is empty.</p>;

  return (
    <div className="cart-page container mt-4">
      {Object.values(groupedCart).map((group) => (
        <div key={group.shop._id} className="card mb-4">
          <div className="card-header">
            <h4>{group.shop.name}</h4>
          </div>
          <div className="card-body">
            {group.items.map((item) => (
              <div key={item.product._id} className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <img src={item.product.images?.[0]} alt={item.product.name} width={80} className="me-3" />
                  <div>
                    <h6>{item.product.name}</h6>
                    <p>₹{item.product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button className="btn btn-danger ms-3" onClick={() => removeItem(item.product._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer d-flex justify-content-between align-items-center">
            <h5>
              Total: ₹
              {group.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)}
            </h5>
            <button className="btn btn-success" onClick={() => handlePlaceOrder(group.shop._id)}>
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
            setUserDetails({ ...userDetails, address: { ...userDetails.address, [field]: value } })
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

      <ErrorModal
        show={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />

      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => {
          setShowSuccess(false);
          navigate('/customer/orders');
        }}
      />


      {orderLoading && (
        <div className="position-fixed top-50 start-50 translate-middle p-3 bg-white shadow rounded">
          <span>Placing your order, please wait...</span>
        </div>
      )}
    </div>
  );
}
