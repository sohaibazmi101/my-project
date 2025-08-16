const sendEmailOtp = require('../utils/sendEmailOtp');

// temporary in-memory OTP storage (replace with DB/Redis in prod)
const otpStore = {};

// @desc Send OTP to email
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    const sent = await sendEmailOtp(email, otp);
    if (!sent) return res.status(500).json({ message: "Failed to send OTP" });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Verify OTP
exports.verifyOtp = (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!otpStore[email]) return res.status(400).json({ message: "No OTP requested" });

    const { otp: storedOtp, expires } = otpStore[email];
    if (Date.now() > expires) return res.status(400).json({ message: "OTP expired" });

    if (parseInt(otp) !== storedOtp) return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email]; // OTP used

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
