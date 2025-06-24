import nodemailer from "nodemailer"; // no curly braces

const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.NODEMAILER_USER_EMAIL,
        pass: process.env.NODEMAILER_USER_PASSWORD,
    },
});

const welcomeTemplate = (name, email) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Sri Venkateswara Agros</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
      color: white;
    }
    .main {
      background-color: white;
      padding: 40px 30px;
    }
    .card {
      background-color: #f1f5f9;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-bottom: 30px;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      text-align: center;
      margin-bottom: 30px;
    }
    .feature-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .cta {
      text-align: center;
      margin-bottom: 30px;
    }
    .cta a {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 35px;
      text-decoration: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }
    .footer {
      background-color: #1e293b;
      color: white;
      padding: 25px 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
      font-size: 12px;
    }
    .quote {
      border-top: 2px solid #e2e8f0;
      padding-top: 25px;
      text-align: center;
      font-style: italic;
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 32px; margin-bottom: 10px;">🌿</div>
    <h1>Welcome to Sri Venkateswara Agros</h1>
    <p>Your Trusted Partner for Natural Products</p>
  </div>

  <div class="main">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2>Welcome, ${name}! 🎉</h2>
      <p>We're absolutely thrilled to have you join our community of health-conscious individuals who trust in the power of natural products.</p>
    </div>

    <div class="card">
      <h3>Your Account Details:</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="features">
      <div>
        <div class="feature-icon">🌱</div>
        <strong style="color: #059669;">100% Natural</strong>
        <p style="font-size: 12px; color: #6b7280;">Pure & Organic Products</p>
      </div>
      <div>
        <div class="feature-icon">🌍</div>
        <strong style="color: #059669;">Eco-Friendly</strong>
        <p style="font-size: 12px; color: #6b7280;">Sustainable Practices</p>
      </div>
      <div>
        <div class="feature-icon">🚚</div>
        <strong style="color: #059669;">Fast Delivery</strong>
        <p style="font-size: 12px; color: #6b7280;">Pan India Shipping</p>
      </div>
      <div>
        <div class="feature-icon">🔒</div>
        <strong style="color: #059669;">Secure Payment</strong>
        <p style="font-size: 12px; color: #6b7280;">Multiple Safe Options</p>
      </div>
    </div>

    <div class="cta">
      <a href="#">🛍️ Start Shopping Now</a>
    </div>

    <div class="quote">
      <p>"We believe that nature holds the key to wellness, and we're here to bring those natural treasures directly to your doorstep. Thank you for choosing us on your wellness journey!"</p>
      <p style="margin-top: 15px; font-weight: 600;">- The Sri Venkateswara Agros Team</p>
    </div>
  </div>

  <div class="footer">
    <p>Follow us for health tips and product updates: 📱 📧 🌐</p>
    <p>© 2024 Sri Venkateswara Agros and Herbs. All rights reserved.</p>
    <p>Natural Products • Since 2021 • Trusted by thousands</p>
  </div>
</body>
</html>`;


const welcomeEmail = async (name, to, subject) => {
    try {
        const htmlTemplate = welcomeTemplate(name, to);
        await transporter.sendMail({
            from: `Sri Venkateswara Agros and Herbs <${process.env.NODEMAILER_USER_EMAIL}>`,
            to,
            subject,
            html: htmlTemplate,
        });
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.log("Error sending email:", error);
        throw error;
    }
};

export default welcomeEmail;
