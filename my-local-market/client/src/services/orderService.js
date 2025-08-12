import api from './api';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

/**
 * Place order with Razorpay payment
 * @param {Object} orderData - { cart (array) or single product array, totalAmount, shippingAddress, customerInfo, paymentMethod }
 * @param {string} token - Customer token for authorization
 * @returns {Promise<void>}
 */
export async function placeOrderWithRazorpay(orderData, token) {
  if (!token) throw new Error('User not authenticated');

  // Step 1: Create order on backend
  const createOrderRes = await api.post(
    '/payments/create-order',
    {
      amount: orderData.totalAmount * 100, // amount in paise
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const { orderId } = createOrderRes.data;

  // Step 2: Open Razorpay payment modal
  const paymentResult = await new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: orderData.totalAmount * 100,
      currency: 'INR',
      name: 'Your Shop Name',
      description: 'Order Payment',
      order_id: orderId,
      handler: function (response) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
      prefill: {
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        contact: orderData.customerInfo.mobile,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });

  // Step 3: Verify payment on backend
  await api.post(
    '/payments/verify',
    {
      ...paymentResult,
      orderData,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

/**
 * Place order with Cash on Delivery
 * @param {Object} orderData - Order data
 * @param {string} token - Customer token
 * @returns {Promise<void>}
 */
export async function placeOrderCOD(orderData, token) {
  if (!token) throw new Error('User not authenticated');

  // Directly place order with paymentMethod = 'Cash on Delivery'
  await api.post('/customers/orders', orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Place an order handling both Razorpay and COD payment methods
 * @param {Object} orderData - { cart, totalAmount, shippingAddress, customerInfo, paymentMethod }
 * @param {string} token - Customer token
 * @returns {Promise<void>}
 */
export async function placeOrder(orderData, token) {
  if (!token) throw new Error('User not authenticated');

  if (orderData.paymentMethod === 'UPI') {
    // Razorpay flow
    await placeOrderWithRazorpay(orderData, token);
  } else if (orderData.paymentMethod === 'Cash on Delivery') {
    // COD flow
    await placeOrderCOD(orderData, token);
  } else {
    throw new Error('Unsupported payment method');
  }
}
