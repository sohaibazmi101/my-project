const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmailOtp(toEmail, otp) {
  try {
    const sendSmtpEmail = {
      sender: { email: "sohaibazmi101@gmail.com", name: "HurryCart" },
      to: [{ email: toEmail }],
      subject: "Your HurryCart Order OTP Code",
      htmlContent: `<p>Hello,</p>
        <p>Your order OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>
        <p>Thank you,<br/>HurryCart Team</p>`,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (err) {
    console.error("Error sending email OTP:", err);
    return false;
  }
}

module.exports = sendEmailOtp;
