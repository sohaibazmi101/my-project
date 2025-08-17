// utils/sendShopOrderEmail.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send order email to shop owner
 * @param {Object} order - Populated order object (with customer, shop, products)
 */
async function sendShopOrderEmail(order) {
  try {
    console.log("🛒 Preparing email for shop owner...");
    console.log("Order received:", JSON.stringify(order, null, 2));

    if (!order.shop || !order.shop.sellerId) {
      console.error("❌ Shop or seller not populated in order.");
      return;
    }

    const seller = order.shop.sellerId;
    console.log("✅ Seller found:", seller);

    // Prepare product details
    const productDetails = order.products
      .map(
        (p) =>
          `<li>${p.product.name} - ${p.quantity} x ₹${p.product.price} = ₹${p.quantity * p.product.price
          }</li>`
      )
      .join("");

    console.log("📦 Products formatted for email:", productDetails);

    const lat = order.customerLocation?.lat;
    const lon = order.customerLocation?.lon;
    const mapsUrl = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "#";


    const htmlContent = `
      <h2>New Order Received - ${order.orderNumber}</h2>
      <p>Hello <b>${seller.sellerName}</b>,</p>
      <p>You have received a new order for your shop <b>${order.shop.name}</b>.</p>
      
      <h3>Order Details:</h3>
      <ul>
        ${productDetails}
      </ul>
      
      <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
      <p><b>Payment Method:</b> ${order.paymentMethod}</p>
      <p><b>Status:</b> ${order.status}</p>

      <h3>Customer Details:</h3>
      <p>Name: ${order.customer.name}</p>
      <p>Email: ${order.customer.email}</p>
      <p>Phone: ${order.customer.phone || "Not provided"}</p>
      <p>Address: ${order.customer.address?.street || ""}, ${order.customer.address?.city || ""
      }, ${order.customer.address?.state || ""} - ${order.customer.address?.pincode || ""
      }</p>

      <br/>

      ${lat && lon ? `<p><a href="${mapsUrl}" target="_blank" 
        style="display:inline-block;padding:8px 12px;background:#4285F4;color:#fff;text-decoration:none;border-radius:4px;">
        See Live Location
      </a></p>` : ""}

      <br/>
      <p>Regards,<br/>Hurry Cart Team</p>
    `;

    const emailData = {
      sender: { email: "sohaibazmi101@gmail.com", name: "Hurry Cart Team" },
      to: [{ email: seller.email, name: seller.sellerName }],
      subject: `🛒 New Order Received - ${order.orderNumber}`,
      htmlContent,
    };

    console.log("📧 Email Data Prepared:", emailData);

    const response = await tranEmailApi.sendTransacEmail(emailData);

    console.log("✅ Shop Owner Order Email Sent:", response.messageId || response);
  } catch (error) {
    console.error("❌ Error sending shop owner email:", error);
  }
}

module.exports = sendShopOrderEmail;
