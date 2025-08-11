import { useParams, useNavigate } from 'react-router-dom';
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
  const token = localStorage.getItem('customerToken');

  const [product, setProduct] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [missingDetailsModal, setMissingDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // States for missing info modal (phone/address)
  const [missingMobile, setMissingMobile] = useState('');
  const [missingAddress, setMissingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Store confirmed customer details fetched from backend, to prefill modal form
  const [confirmDetails, setConfirmDetails] = useState({
    name: '',
    email: '',
    mobile: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });

  // Fetch product details and save recently viewed product
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

  // Check if product is already in cart
  const checkIfInCart = useCallback(async () => {
    if (!token) return setIsInCart(false);
    try {
      const res = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = res.data?.cart || [];
      const found = cartItems.find((item) => item?.product?._id === id);
      setIsInCart(!!found);
    } catch (err) {
      console.error('Failed to check cart:', err);
      setIsInCart(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchProduct();
    if (token) {
      checkIfInCart();
    }
  }, [id, token, fetchProduct, checkIfInCart]);

  // Add product to cart (quantity fixed 1 here)
  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login as customer to add items to cart.');
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
      alert('Product added to cart!');
      checkIfInCart();
    } catch (err) {
      console.error('Add to cart failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Add to cart failed');
    } finally {
      setLoading(false);
    }
  };

  // Buy Now clicked: fetch profile, check for missing info, open modal
  const handleBuyNow = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      const { data: customer } = await api.get('/customers/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check missing phone or address
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

      // Prefill confirmDetails for ConfirmOrderModal
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
      console.error('Error fetching customer profile:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Confirm order handler: accepts order data from ConfirmOrderModal
  const [orderLoading, setOrderLoading] = useState(false);

  const handleConfirmOrder = async (orderData) => {
    try {
      setOrderLoading(true);

      console.log("Order payload:", orderData);

      await api.post('/customers/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Order placed successfully!');
      setShowConfirmModal(false);
      navigate('/customer/orders');
    } catch (err) {
      console.error('Order placement failed:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Update missing customer details modal submit
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login first.');
      return;
    }

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
      handleBuyNow(); // retry buy now flow after updating details
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile. Please try again.');
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
        totalAmount={product.price * 1} // initial quantity 1 for single product
      />

      {orderLoading && (
        <div className="position-fixed top-50 start-50 translate-middle p-3 bg-white shadow rounded">
          <span>Placing your order, please wait...</span>
        </div>
      )}
    </div>
  );
}
