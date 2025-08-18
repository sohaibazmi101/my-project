const axios = require("axios");
const BREVO_API_KEY = process.env.BREVO_API_KEY;

/**
 * Send order confirmation email
 * @param {string} toEmail - customer email
 * @param {Array} orders - createdOrders array (must be populated with shop and product info)
 * @param {Object} customer - customer object
 * @param {Object} shippingAddress - shipping details
 * @param {Object} customerInfo - name, email, phone
 * @param {string} paymentMethod - COD/UPI
 */
async function sendOrderEmail(toEmail, orders, customer, shippingAddress, customerInfo, paymentMethod) {
  try {
    // Build orders HTML
    const ordersHtml = (orders || [])
      .map(order => {
        const productsHtml = (order.products || [])
          .map(p => `
            <li>
              <strong>${p.product?.name || "Unknown"}</strong> 
              (x${p.quantity}) - ₹${p.product?.price ? p.product.price * p.quantity : 0}
            </li>
          `)
          .join("");

        return `
          <div style="margin-bottom:20px;">
            <h3>Shop: ${order.shop?.name || "N/A"}</h3>
            <p><strong>Products:</strong></p>
            <ul>${productsHtml}</ul>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>Delivery Charge:</strong> ₹${order.deliveryCharge || 0}</p>
            <p><strong>Platform Fee:</strong> ₹${order.platformFee || 0}</p>
          </div>
        `;
      })
      .join("");

    const htmlContent = `
      <h2>Hi ${customerInfo?.name || customer?.name || "Customer"},</h2>
      <p>Thank you for your order!</p>

      ${ordersHtml}

      <h3>Payment Method: ${paymentMethod}</h3>

      <h3>Shipping Address:</h3>
      <p>
        ${shippingAddress?.street || ""}, 
        ${shippingAddress?.city || ""}, 
        ${shippingAddress?.state || ""} - 
        ${shippingAddress?.pincode || ""}
      </p>

      <h3>Contact Info:</h3>
      <p>Email: ${customerInfo?.email || customer?.email}</p>
      <p>Phone: ${customerInfo?.phone || customer?.phone}</p>

      <br/>
      <p>We’ll notify you once your order is out for delivery.</p>
      <p>Regards,<br/>Hurry Cart Team</p>
    `;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "sohaibazmi101@gmail.com", name: "Hurry Cart" },
        to: [{ email: toEmail }],
        subject: `Your Order Confirmation`,
        htmlContent,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error sending order email:", error.response?.data || error.message);
  }
}

module.exports = sendOrderEmail;
