import api from './api';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

/**
 * Place order with Razorpay payment
 * @param {Object} orderData - { cart (array), totalAmount, shippingAddress, customerInfo, paymentMethod }
 * @param {string} token - Customer token for authorization
 * @returns {Promise<void>}
 */
export async function placeOrderWithRazorpay(orderData, token) {
    if (!token) throw new Error('User not authenticated');

    // Step 1: Create a Razorpay order on the backend.
    const createOrderRes = await api.post(
        '/payments/create-razorpay-order', // NEW ENDPOINT
        {
            cart: orderData.cart,
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
            amount: Math.round(orderData.totalAmount * 100), // paise integer
            currency: 'INR',
            name: 'Your Shop Name',
            description: 'Order Payment',
            order_id: orderId,
            handler: function (response) {
                // On payment success, we get the payment details.
                // We resolve the promise with these details.
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

    // Step 3: Call the NEW backend endpoint to create the final order.
    // This only happens if the payment was successful.
    try {
        await api.post(
            '/payments/create-final-order', // NEW ENDPOINT
            {
                ...paymentResult,
                cart: orderData.cart, // Send cart data to recreate the order
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log('Final order created successfully on the backend.');
    } catch (error) {
        console.error('Failed to create final order on backend. The webhook should handle this.', error);
        // Display a message to the user that the order may be delayed but is confirmed.
    }
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
        await placeOrderWithRazorpay(orderData, token);
    } else if (orderData.paymentMethod === 'Cash on Delivery') {
        await placeOrderCOD(orderData, token);
    } else {
        throw new Error('Unsupported payment method');
    }
}
