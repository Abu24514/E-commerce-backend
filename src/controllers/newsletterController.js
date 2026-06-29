import transporter from "../config/mailer.js";

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    // User ko welcome email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Wearly Community! 🎉",
      html: `
        <h2>Welcome to Wearly! 🛍️</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive exclusive offers, early access to new collections, and style updates.</p>
        <br/>
        <p>— Team Wearly</p>
      `,
    });

    // Aapko notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Wearly Subscriber!",
      html: `<p>New subscriber: <b>${email}</b></p>`,
    });

    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default subscribeNewsletter;