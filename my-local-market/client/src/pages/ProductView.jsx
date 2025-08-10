import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import GoogleLoginModal from '../components/GoogleLoginModal';
import ProductCarousel from './components/ProductCarousel';
import ProductDetails from './components/ProductDetails';
import MissingDetailsModal from './components/MissingDetailsModal';
import ConfirmOrderModal from './components/ConfirmOrderModal';

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const token = localStorage.getItem('customerToken');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [missingDetailsModal, setMissingDetailsModal] = useState(false);
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

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      if (token) {
        try {
          await api.post(
            '/customers/recently-viewed',
            { productId: res.data._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error('Failed to save recently viewed:', err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  const checkIfInCart = useCallback(async () => {
    try {
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = res.data?.cart || [];
      const found = cartItems.find((item) => {
        const cartProductId = item?.product?._id?.toString?.();
        return cartProductId === id;
      });
      setIsInCart(!!found);
    } catch (err) {
      console.error('Failed to check cart', err);
    }
  }, [token, id]);

  useEffect(() => {
    fetchProduct();
    if (token) {
      checkIfInCart();
    }
  }, [id, token, fetchProduct, checkIfInCart]);

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login as customer to add items to cart.');
      return;
    }
    try {
      setLoading(true);
      await api.post(
        '/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to cart!');
      checkIfInCart();
    } catch (err) {
      console.error('Add to cart failed', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Add to cart failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      setShowLoginModal(true);
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
        setMissingDetailsModal(true);
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

  const handleConfirmOrder = async (quantity, paymentMethod, totalAmount) => {
    try {
      if (paymentMethod === 'cod') {
        const orderData = {
          cart: [{ product: product._id, quantity }],
          paymentMethod: 'Cash on Delivery',
          totalAmount,
        };
        await api.post('/customers/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Order placed successfully!');
        setShowConfirmModal(false);
        navigate('/customer/orders');
      } else if (paymentMethod === 'upi') {
        const { data: { amount, orderId } } = await api.post(
          '/customers/create-payment',
          {
            cart: [{ product: product._id, quantity }],
            totalAmount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: 'INR',
          name: 'Your Store',
          description: 'Payment for your order',
          order_id: orderId,
          handler: async function (response) {
            alert('Payment successful!');
            setShowConfirmModal(false);
            navigate('/customer/orders');
          },
          prefill: {
            name: confirmDetails.name,
            email: confirmDetails.email,
            contact: confirmDetails.mobile,
          },
          theme: { color: '#3399cc' },
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (err) {
      console.error('Order placement failed', err);
      alert('Failed to place order. Please try again.');
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
      setMissingDetailsModal(false);
      handleBuyNow();
    } catch (err) {
      console.error('Profile update failed', err);
      alert('Failed to update profile. Try again.');
    }
  };

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const images = product.images?.filter(Boolean) || [];

  return (
    <div className="container-fluid mt-3">
      <div className="card mx-auto shadow-sm" style={{ maxWidth: '800px' }}>
        <ProductCarousel images={images} productId={product._id} />
        <ProductDetails
          product={product}
          isInCart={isInCart}
          loading={loading}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </div>

      <GoogleLoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <MissingDetailsModal
        show={missingDetailsModal}
        onClose={() => setMissingDetailsModal(false)}
        mobile={missingMobile}
        address={missingAddress}
        onMobileChange={(e) => setMissingMobile(e.target.value)}
        onAddressChange={(key, value) => setMissingAddress((prev) => ({ ...prev, [key]: value }))}
        onSaveAndContinue={handleUpdateDetails}
      />

      <ConfirmOrderModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        product={product}
        confirmDetails={confirmDetails}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  );
}