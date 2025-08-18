// utils/sendDeliveryOrderEmail.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendDeliveryOrderEmail(order) {
  try {
    if (!order.shop?.assignedDeliveryBoys || order.shop.assignedDeliveryBoys.length === 0) {
      return;
    }

    const productsHtml = order.products
      .map(
        (p) => `<li>${p.product.name} - ${p.quantity} x ₹${p.product.price} = ₹${p.quantity * p.product.price}</li>`
      )
      .join("");

    for (const deliveryBoy of order.shop.assignedDeliveryBoys) {
      const htmlContent = `
        <h2>New Delivery Assignment - Order ${order.orderNumber}</h2>
        <p>Hello <b>${deliveryBoy.name}</b>,</p>
        <p>You have a new delivery for shop <b>${order.shop.name}</b>.</p>

        <h3>Products to Deliver:</h3>
        <ul>${productsHtml}</ul>

        <h3>Customer Details:</h3>
        <p>Name: ${order.customer.name}</p>
        <p>Email: ${order.customer.email}</p>
        <p>Phone: ${order.customer.phone || "Not provided"}</p>
        <p>Address: ${order.customer.address?.street || ""}, ${order.customer.address?.city || ""}, ${order.customer.address?.state || ""} - ${order.customer.address?.pincode || ""}</p>

        <p>📍 Location: <a href="https://www.google.com/maps?q=${order.customerLocation?.lat},${order.customerLocation?.lon}" target="_blank">See Live Location</a></p>

        <br/>
        <p>Regards,<br/>HurryKart Team</p>
      `;

      const emailData = {
        sender: { email: "sohaibazmi101@gmail.com", name: "Hurry Kart" },
        to: [{ email: deliveryBoy.email, name: deliveryBoy.name }],
        subject: `🛵 New Delivery Assignment - Order ${order.orderNumber}`,
        htmlContent,
      };

      const response = await tranEmailApi.sendTransacEmail(emailData);
    }
  } catch (error) {
    console.error("❌ Error sending delivery email:", error);
  }
}

module.exports = sendDeliveryOrderEmail;
