import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import GoogleLoginModal from '../components/GoogleLoginModal';

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

  // New state for item quantity
  const [quantity, setQuantity] = useState(1);

  // New states for payment method and total amount
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to 'cod'
  const totalAmount = product ? product.price * quantity : 0;

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
    fetchProduct();
    if (token) {
      checkIfInCart();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);

      if (token) {
        try {
          await api.post(
            '/customers/recently-viewed',
            { productId: res.data._id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (err) {
          console.error('Failed to save recently viewed:', err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfInCart = async () => {
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
  };

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please login as customer to add items to cart.');
      return;
    }

    try {
      setLoading(true);
      await api.post(
        '/cart/add',
        {
          productId: product._id,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      setShowLoginModal(true); // Show login popup
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

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const images = product.images?.filter(Boolean) || [];

  return (
    <div className="container-fluid mt-3">
      <div className="card mx-auto shadow-sm" style={{ maxWidth: '800px' }}>
        {/* Carousel */}
        {images.length > 0 && (
          <div id={`product-carousel-${product._id}`} className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {images.map((img, idx) => (
                <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                  <img
                    src={img}
                    alt={`Product Image ${idx + 1}`}
                    className="d-block w-100"
                    style={{ objectFit: 'cover', maxHeight: '400px' }}
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target={`#product-carousel-${product._id}`} data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target={`#product-carousel-${product._id}`} data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        )}
        {/* Product Info */}
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-text">{product.description}</p>
          <h5 className="text-primary">₹{product.price}</h5>
          <p className="text-muted">
            Availability: {product.availability ? "✅ In stock" : "Out of stock"}
          </p>

          {/* Buttons */}
          <div className="d-flex gap-3 mt-3">
            <button onClick={handleBuyNow} className="btn btn-primary">Buy Now</button>
            <button
              onClick={handleAddToCart}
              className="btn btn-warning"
              disabled={isInCart || loading}
            >
              {loading ? 'Adding...' : isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          {/* View Shop Button */}
          {product.shop && (
            <Link
              to={`/shops/${typeof product.shop === 'object' ? product.shop._id : product.shop}`}
              className="btn btn-outline-primary mt-3"
            >
              Visit Seller’s Shop
            </Link>
          )}

          {/* WhatsApp Contact */}
          {product?.sellerId?.whatsapp && (
            <a
              href={`https://wa.me/${product.sellerId.whatsapp}`}
              className="btn btn-success w-100 mt-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact via WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Modals */}
      <GoogleLoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {missingDetailsModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h4 className="mb-3">Please Complete Your Details</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api.patch(
                      '/customers/profile',
                      {
                        mobile: missingMobile,
                        address: missingAddress,
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    setMissingDetailsModal(false);
                    handleBuyNow(); // retry flow
                  } catch (err) {
                    console.error('Profile update failed', err);
                    alert('Failed to update profile. Try again.');
                  }
                }}
              >
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Mobile Number"
                  value={missingMobile}
                  onChange={(e) => setMissingMobile(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Street"
                  value={missingAddress.street}
                  onChange={(e) =>
                    setMissingAddress((prev) => ({ ...prev, street: e.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="City"
                  value={missingAddress.city}
                  onChange={(e) =>
                    setMissingAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="State"
                  value={missingAddress.state}
                  onChange={(e) =>
                    setMissingAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Pincode"
                  value={missingAddress.pincode}
                  onChange={(e) =>
                    setMissingAddress((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                  required
                />
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-primary">
                    Save & Continue
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setMissingDetailsModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h4 className="mb-3">Confirm Shipping Details & Payment</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
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
                      // This is a placeholder for actual UPI payment integration.
                      // In a real application, you'd send a request to your backend to initiate the payment.
                      const res = await api.post(
                        '/customers/create-payment',
                        {
                          amount: totalAmount,
                          orderItems: [{ productId: product._id, quantity }],
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      alert('Redirecting to UPI payment gateway...');
                      window.location.href = res.data.paymentUrl;
                    }
                  } catch (err) {
                    console.error('Order placement failed', err);
                    alert('Failed to place order. Please try again.');
                  }
                }}
              >
                <input
                  type="text"
                  className="form-control mb-2"
                  value={confirmDetails.name}
                  disabled
                />
                <input
                  type="email"
                  className="form-control mb-2"
                  value={confirmDetails.email}
                  disabled
                />
                {/* Quantity Input Field */}
                <label className="form-label mt-2">Quantity</label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(parseInt(value, 10))) {
                      setQuantity(value);
                    } else {
                      const num = parseInt(value, 10);
                      setQuantity(Math.max(1, num));
                    }
                  }}
                  min="1"
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  value={confirmDetails.mobile}
                  onChange={(e) =>
                    setConfirmDetails((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Street"
                  value={confirmDetails.address.street}
                  onChange={(e) =>
                    setConfirmDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="City"
                  value={confirmDetails.address.city}
                  onChange={(e) =>
                    setConfirmDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="State"
                  value={confirmDetails.address.state}
                  onChange={(e) =>
                    setConfirmDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value },
                    }))
                  }
                  required
                />
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Pincode"
                  value={confirmDetails.address.pincode}
                  onChange={(e) =>
                    setConfirmDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, pincode: e.target.value },
                    }))
                  }
                  required
                />

                {/* Order Summary Section */}
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Order Summary</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Product Price:</span>
                        <span>₹{product.price.toFixed(2)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                        <span>Total Amount:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mt-3">
                  <label className="form-label">Select Payment Method</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="codRadio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="codRadio">
                      Cash on Delivery (COD)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="upiRadio"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="upiRadio">
                      UPI
                    </label>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between mt-3">
                  <button type="submit" className="btn btn-success">
                    Confirm & Buy
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}