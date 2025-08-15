import api from './api';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export async function placeOrderWithRazorpay(orderData, token) {
    if (!token) throw new Error('User not authenticated');

    let createOrderRes;
    try {
        const payload = {
            cart: orderData.cart,
            productId: orderData.productId,
            quantity: orderData.quantity,
            customerLat: orderData.customerLat,
            customerLon: orderData.customerLon,
        };

        createOrderRes = await api.post(
            '/payments/create-razorpay-order',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    } catch (err) {
        console.error('[ERROR] Failed to create Razorpay order on backend:', err?.response?.data || err.message);
        return { success: false, message: err?.response?.data?.message || err.message };
    }

    const { orderId, amount, currency, orderSummary } = createOrderRes.data;

    let paymentResult;
    try {
        paymentResult = await new Promise((resolve, reject) => {
            const options = {
                key: RAZORPAY_KEY,
                amount: Math.round(amount * 100),
                currency: currency || 'INR',
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
                theme: { color: '#3399cc' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    } catch (err) {
        console.warn('[DEBUG] Razorpay payment failed:', err.message);
        return { success: false, message: err.message };
    }

    try {
        const finalPayload = {
            ...paymentResult,
            orderSummary,
            paymentMethod: orderData.paymentMethod,
        };

        await api.post(
            '/payments/create-final-order',
            finalPayload,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return { success: true, message: 'Order placed successfully' };
    } catch (error) {
        console.error('[ERROR] Failed to create final order on backend:', error?.response?.data || error.message);
        return { success: false, message: error?.response?.data?.message || error.message };
    }
}

export async function placeOrderCOD(orderData, token) {
    if (!token) throw new Error('User not authenticated');
    try {
        console.log('Order Data is Sending to Backend via COD: ',orderData);
        await api.post('/customers/orders', orderData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, message: 'Order placed successfully (COD)' };
    } catch (err) {
        return { success: false, message: err?.response?.data?.message || err.message };
    }
}

export async function placeOrder(orderData, token) {
    if (!token) throw new Error('User not authenticated');

    if (orderData.paymentMethod === 'UPI') {
        return await placeOrderWithRazorpay(orderData, token);
    } else if (orderData.paymentMethod === 'Cash on Delivery') {
        return await placeOrderCOD(orderData, token);
    } else {
        return { success: false, message: 'Unsupported payment method' };
    }
}
