import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import MissingDetailsModal from '../components/MissingDetailsModal';
import ConfirmOrderModal from '../components/ConfirmOrderModal';
import { placeOrder } from '../../services/orderService';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('customerToken');

  const [showMissingDetailsModal, setShowMissingDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState({
    name: '',
    email: '',
    mobile: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  const [missingMobile, setMissingMobile] = useState('');
  const [missingAddress, setMissingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

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
    if (!token) {
      navigate('/customer/login');
      return;
    }
    try {
      const { data: customer } = await api.get('/customers/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        !customer.phone ||
        !customer.address?.street ||
        !customer.address?.city ||
        !customer.address?.state ||
        !customer.address?.pincode
      ) {
        setMissingMobile(customer.phone || '');
        setMissingAddress({
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          pincode: customer.address?.pincode || '',
        });
        setShowMissingDetailsModal(true);
        return;
      }
      setConfirmDetails({
        name: customer.name || '',
        email: customer.email || '',
        mobile: customer.phone || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          pincode: customer.address?.pincode || '',
        },
      });
      setShowConfirmModal(true);
    } catch (err) {
      console.error('Error fetching customer profile', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        '/customers/profile',
        {
          mobile: missingMobile,
          address: missingAddress,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowMissingDetailsModal(false);
      handleCheckout();
    } catch (err) {
      console.error('Profile update failed', err);
      alert('Failed to update profile. Try again.');
    }
  };

  // inside CartPage component...

  const handleConfirmOrder = async (orderData) => {
    try {
      setOrderLoading(true);
      await placeOrder(orderData, token);
      alert('Order placed successfully!');
      setShowConfirmModal(false);
      navigate('/customer/orders');
    } catch (err) {
      console.error('Order placement failed:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };



  const groupedItems = groupByShop();

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
                <div key={item.product._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
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
                          onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                          className="form-control form-control-sm"
                          style={{ width: 70 }}
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">
                          ₹{item.product.price * item.quantity}
                        </span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRemove(item.product._id)}>
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

      {/* Modals */}
      <MissingDetailsModal
        show={showMissingDetailsModal}
        onClose={() => setShowMissingDetailsModal(false)}
        mobile={missingMobile}
        address={missingAddress}
        onMobileChange={(e) => setMissingMobile(e.target.value)}
        onAddressChange={(key, value) => setMissingAddress((prev) => ({ ...prev, [key]: value }))}
        onSaveAndContinue={handleUpdateDetails}
      />

      <ConfirmOrderModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        cartItems={cartItems}
        confirmDetails={confirmDetails}
        onConfirmOrder={handleConfirmOrder}
        totalAmount={calculateTotal()}
      />
      {orderLoading && (
        <div className="position-fixed top-50 start-50 translate-middle p-3 bg-white shadow rounded">
          <span>Placing your order, please wait...</span>
        </div>
      )}
    </div>
  );
}