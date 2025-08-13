import api from './api';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';


export async function placeOrderWithRazorpay(orderData, token) {
    if (!token) throw new Error('User not authenticated');

    console.log('[DEBUG] Starting Razorpay order placement...', orderData);
    console.log('[DEBUG] orderData.cart in frontend:', JSON.stringify(orderData.cart, null, 2));

    let createOrderRes;
    try {
        console.log('[DEBUG] Sending payload to backend to create Razorpay order...');
        const payload = {
            cart: orderData.cart,
            productId: orderData.productId,
            quantity: orderData.quantity,
            paymentMethod: orderData.paymentMethod,
            customerLat: orderData.customerLat,
            customerLon: orderData.customerLon,
        };
        console.log('[DEBUG] Payload to /payments/create-razorpay-order:', JSON.stringify(payload, null, 2));

        createOrderRes = await api.post(
            '/payments/create-razorpay-order',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('[DEBUG] Razorpay order created on backend. Full response:', createOrderRes.data);
    } catch (err) {
        console.error('[ERROR] Failed to create Razorpay order on backend:', err?.response?.data || err.message);
        throw err;
    }

    const { orderId, amount, currency } = createOrderRes.data;

    const paymentResult = await new Promise((resolve, reject) => {
        const options = {
            key: RAZORPAY_KEY,
            amount: Math.round(orderData.totalAmount * 100), // paise integer
            currency: currency || 'INR',
            name: 'Your Shop Name',
            description: 'Order Payment',
            order_id: orderId,
            handler: function (response) {
                console.log('[DEBUG] Razorpay payment success:', response);
                resolve(response);
            },
            modal: {
                ondismiss: function () {
                    console.warn('[DEBUG] Razorpay payment modal dismissed by user');
                    reject(new Error('Payment cancelled by user'));
                },
            },
            prefill: {
                name: orderData.customerInfo.name,
                email: orderData.customerInfo.email,
                contact: orderData.customerInfo.mobile,
            },
            theme: { color: '#3399cc' },
        };

        console.log('[DEBUG] Opening Razorpay modal with options:', options);
        const rzp = new window.Razorpay(options);
        rzp.open();
    });

    try {
        console.log('[DEBUG] Sending payment result to backend to create final DB order...');
        const finalPayload = {
            ...paymentResult,
            cart: orderData.cart,
            productId: orderData.productId,
            quantity: orderData.quantity,
            paymentMethod: orderData.paymentMethod,
            customerLat: orderData.customerLat,
            customerLon: orderData.customerLon,
        };
        console.log('[DEBUG] Payload to /payments/create-final-order:', JSON.stringify(finalPayload, null, 2));

        await api.post(
            '/payments/create-final-order',
            finalPayload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('[DEBUG] Final order successfully created on backend.');
    } catch (error) {
        console.error('[ERROR] Failed to create final order on backend:', error?.response?.data || error.message);
        console.warn('[DEBUG] The webhook should still handle order creation if backend call fails.');
    }
}

export async function placeOrderCOD(orderData, token) {
    if (!token) throw new Error('User not authenticated');
    console.log('[DEBUG] Placing COD order...', orderData);

    await api.post('/customers/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
    });

    console.log('[DEBUG] COD order placed successfully.');
}

export async function placeOrder(orderData, token) {
    if (!token) throw new Error('User not authenticated');
    console.log('[DEBUG] Placing order with method:', orderData.paymentMethod);

    if (orderData.paymentMethod === 'UPI') {
        await placeOrderWithRazorpay(orderData, token);
    } else if (orderData.paymentMethod === 'Cash on Delivery') {
        await placeOrderCOD(orderData, token);
    } else {
        throw new Error('Unsupported payment method');
    }
}