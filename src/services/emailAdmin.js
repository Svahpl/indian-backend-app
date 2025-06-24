import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({})
const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.NODEMAILER_USER_EMAIL,
        pass: process.env.NODEMAILER_USER_PASSWORD,
    },
});

// Admin message template
const adminMessageTemplate = (name, message, subject) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin: 20px;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .main {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #059669;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message-content {
      background-color: #f8fafc;
      padding: 25px;
      border-radius: 8px;
      border-left: 4px solid #059669;
      margin: 25px 0;
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.7;
    }
    .contact-info {
      background-color: #ecfdf5;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      border: 1px solid #d1fae5;
    }
    .contact-info h3 {
      color: #047857;
      margin: 0 0 15px 0;
      font-size: 16px;
    }
    .contact-info p {
      margin: 5px 0;
      font-size: 14px;
      color: #374151;
    }
    .footer {
      background-color: #1f2937;
      color: #e5e7eb;
      padding: 25px 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 30px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f1f5f9;
      font-style: italic;
      color: #6b7280;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; margin-bottom: 8px;">🌿</div>
      <h1>Sri Venkateswara Agros</h1>
      <p>Natural Products & Wellness Solutions</p>
    </div>

    <div class="main">
      <div class="greeting">
        Hello ${name},
      </div>

      <div class="message-content">
${message}
      </div>

      <div class="divider"></div>

      <div class="contact-info">
        <h3>📞 Need Help? We're Here for You!</h3>
        <p><strong>Customer Support:</strong> support@srivenkateswaraagros.com</p>
        <p><strong>Phone:</strong> +91-XXXXX-XXXXX</p>
        <p><strong>Business Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM</p>
        <p><strong>Website:</strong> www.srivenkateswaraagros.com</p>
      </div>

      <div class="signature">
        <p>Best regards,<br>
        <strong>The Sri Venkateswara Agros Team</strong><br>
        <em>Your trusted partner in natural wellness</em></p>
      </div>
    </div>

    <div class="footer">
      <p>🌱 Committed to Natural Excellence Since 2021 🌱</p>
      <p>© ${new Date().getFullYear()} Sri Venkateswara Agros and Herbs. All rights reserved.</p>
      <p>This email was sent from our admin team. Please do not reply to this email address.</p>
    </div>
  </div>
</body>
</html>`;

// Function to send admin message to user
const sendAdminEmail = async (name, email, subject, message) => {
    try {
        const htmlTemplate = adminMessageTemplate(name, message, subject);

        await transporter.sendMail({
            from: `Sri Venkateswara Agros Admin <${process.env.NODEMAILER_USER_EMAIL}>`,
            to: email,
            subject: `[Sri Venkateswara Agros] ${subject}`,
            html: htmlTemplate,
            replyTo: process.env.NODEMAILER_USER_EMAIL, 
        });

        console.log(`Admin email sent successfully to: ${email}`);
        return { success: true, message: "Email sent successfully" };

    } catch (error) {
        console.error("Error sending admin email:", error);
        throw error;
    }
};

// Export the function
export default sendAdminEmail;