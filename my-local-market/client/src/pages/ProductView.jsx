import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import GoogleLoginModal from '../components/GoogleLoginModal';
import ProductCarousel from './components/ProductCarousel';
import ProductDetails from './components/ProductDetails';
import MissingDetailsModal from './components/MissingDetailsModal';
import ConfirmOrderModal from './components/ConfirmOrderModal';
import ErrorModal from '../components/ErrorModal';
import SuccessModal from '../components/SuccessModal'; // new success modal
import { placeOrder } from '../services/orderService';

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('customerToken');

  const [product, setProduct] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [missingDetailsModal, setMissingDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [missingMobile, setMissingMobile] = useState('');
  const [missingAddress, setMissingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [confirmDetails, setConfirmDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [orderLoading, setOrderLoading] = useState(false);

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
      console.error('Failed to fetch product:', err);
      setProduct(null);
    }
  }, [id, token]);

  const checkIfInCart = useCallback(async () => {
    if (!token) return setIsInCart(false);
    try {
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = res.data?.cart || [];
      setIsInCart(cartItems.some((item) => item?.product?._id === id));
    } catch (err) {
      console.error('Failed to check cart:', err);
      setIsInCart(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchProduct();
    if (token) checkIfInCart();
  }, [id, token, fetchProduct, checkIfInCart]);

  const handleAddToCart = async () => {
    if (!token) {
      setErrorMessage('Please login as customer to add items to cart.');
      setShowError(true);
      return;
    }
    if (!product) return;

    try {
      setLoading(true);
      await api.post(
        '/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      checkIfInCart();
    } catch (err) {
      console.error('Add to cart failed:', err?.response?.data || err);
      setErrorMessage(err?.response?.data?.message || 'Add to cart failed');
      setShowError(true);
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
        phone: customer.phone || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          pincode: customer.address?.pincode || '',
        },
      });

      setShowConfirmModal(true);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setShowError(true);
    }
  };

  const handleConfirmOrder = async (orderData) => {
    try {
      setOrderLoading(true);
      const result = await placeOrder(orderData, token);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccess(true);
        setShowConfirmModal(false);
      } else {
        setErrorMessage(result.message);
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order.');
      setShowError(true);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Please login first.');
      setShowError(true);
      return;
    }

    try {
      await api.patch(
        '/customers/profile',
        { phone: missingMobile, address: missingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMissingDetailsModal(false);
      handleBuyNow();
    } catch (err) {
      console.error('Profile update failed:', err);
      setErrorMessage('Failed to update profile. Please try again.');
      setShowError(true);
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
        phone={missingMobile}
        address={missingAddress}
        onMobileChange={(e) => setMissingMobile(e.target.value)}
        onAddressChange={(key, value) =>
          setMissingAddress((prev) => ({ ...prev, [key]: value }))
        }
        onSaveAndContinue={handleUpdateDetails}
      />

      <ConfirmOrderModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        product={product}
        confirmDetails={confirmDetails}
        onConfirmOrder={handleConfirmOrder}
        totalAmount={product.price * 1}
      />

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
