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

const orderConfirmationTemplate = (customerName, orderNumber, orderDate, totalAmount, paymentStatus, items, deliveryAddress, expectedDelivery) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed - Shree Venkateswara Agros and Herbs</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 30px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .header p {
      color: rgba(255,255,255,0.9);
      margin: 10px 0 0 0;
      font-size: 16px;
    }
    .main {
      background-color: white;
      padding: 40px 30px;
    }
    .welcome-section {
      text-align: center;
      margin-bottom: 30px;
    }
    .welcome-section h2 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .welcome-section p {
      color: #64748b;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
    }
    .order-summary {
      background-color: #fef3c7;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 2px solid #fbbf24;
    }
    .order-summary h3 {
      color: #92400e;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .order-row:last-child {
      margin-bottom: 0;
    }
    .order-label {
      color: #78350f;
      font-weight: 600;
    }
    .order-value {
      color: #92400e;
    }
    .order-total {
      font-size: 18px;
      font-weight: bold;
    }
    .payment-paid {
      color: #059669;
      font-weight: bold;
    }
    .items-section {
      margin-bottom: 30px;
    }
    .items-section h3 {
      color: #1e293b;
      font-size: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .item-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 15px;
      overflow: hidden;
    }
    .item-content {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-info h4 {
      margin: 0 0 5px 0;
      color: #1e293b;
      font-size: 16px;
    }
    .item-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    .item-price {
      text-align: right;
    }
    .item-price .price {
      margin: 0;
      color: #1e293b;
      font-weight: bold;
    }
    .item-price .qty {
      margin: 0;
      color: #64748b;
      font-size: 12px;
    }
    .delivery-info {
      background-color: #f0f9ff;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      border: 1px solid #7dd3fc;
    }
    .delivery-info h3 {
      color: #0c4a6e;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .delivery-address {
      margin-bottom: 10px;
    }
    .delivery-address strong {
      color: #0c4a6e;
    }
    .delivery-address p {
      color: #164e63;
      margin: 5px 0;
      font-size: 14px;
    }
    .delivery-date strong {
      color: #0c4a6e;
    }
    .delivery-date p {
      color: #164e63;
      margin: 5px 0;
      font-size: 14px;
      font-weight: 600;
    }
    .next-steps {
      background-color: #f0fdf4;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
      border: 1px solid #86efac;
    }
    .next-steps h3 {
      color: #14532d;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .next-steps .steps {
      color: #166534;
      font-size: 14px;
      line-height: 1.6;
    }
    .next-steps .steps p {
      margin: 0 0 8px 0;
    }
    .next-steps .steps p:last-child {
      margin: 0;
    }
    .action-buttons {
      text-align: center;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      margin: 0 10px 10px 0;
    }
    .btn-primary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }
    .btn-secondary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }
    .footer {
      background-color: #1e293b;
      color: white;
      padding: 25px 20px;
      text-align: center;
      border-radius: 0 0 10px 10px;
    }
    .footer p {
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    .footer p:last-child {
      margin: 0;
      font-size: 12px;
      color: #94a3b8;
    }
    .support-info {
      margin: 0 0 15px 0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Order Confirmed!</h1>
    <p>Thank you for choosing natural wellness</p>
  </div>

  <div class="main">
    <div class="welcome-section">
      <h2>Hi ${customerName}, Your Order is Confirmed! 📦</h2>
      <p>We're excited to prepare your natural products with care. Your wellness journey continues!</p>
    </div>

    <div class="order-summary">
      <h3>📋 Order Summary</h3>
      <div class="order-row">
        <span class="order-label">Order Number:</span>
        <span class="order-value">${orderNumber}</span>
      </div>
      <div class="order-row">
        <span class="order-label">Order Date:</span>
        <span class="order-value">${orderDate}</span>
      </div>
      <div class="order-row">
        <span class="order-label">Total Amount:</span>
        <span class="order-value order-total">₹${totalAmount}</span>
      </div>
      <div class="order-row">
        <span class="order-label">Payment Status:</span>
        <span class="payment-paid">✅ ${paymentStatus}</span>
      </div>
    </div>

    <div class="items-section">
      <h3>🛒 Items Ordered</h3>
      ${items.map(item => `
        <div class="item-card">
          <div class="item-content">
            <div class="item-info">
              <h4>${item.icon} ${item.name}</h4>
              <p>${item.description}</p>
            </div>
            <div class="item-price">
              <p class="price">₹${item.price}</p>
              <p class="qty">Qty: ${item.quantity}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="delivery-info">
      <h3>🚚 Delivery Information</h3>
      <div class="delivery-address">
        <strong>Delivery Address:</strong>
        <p>${deliveryAddress}</p>
      </div>
      <div class="delivery-date">
        <strong>Expected Delivery:</strong>
        <p>📅 ${expectedDelivery} (3-5 business days)</p>
      </div>
    </div>

    <div class="next-steps">
      <h3>⏭️ What Happens Next?</h3>
      <div class="steps">
        <p>✅ <strong>Order Processing:</strong> We're carefully preparing your items</p>
        <p>📦 <strong>Quality Check:</strong> Each product undergoes rigorous quality testing</p>
        <p>🚛 <strong>Dispatch:</strong> Your order will be shipped within 24-48 hours</p>
        <p>📱 <strong>Tracking:</strong> You'll receive tracking details via SMS & email</p>
      </div>
    </div>

    <div class="action-buttons">
      <a href="#" class="btn btn-primary">📱 Track Your Order</a>
      <a href="#" class="btn btn-secondary">🛍️ Shop More</a>
    </div>
  </div>

  <div class="footer">
    <p>Questions about your order? We're here to help! 💬</p>
    <p class="support-info">📞 Customer Support: +91-XXXXXXXXXX | 📧 support@shreevenkateswara.com</p>
    <p>© 2024 Shree Venkateswara Agros and Herbs. Natural wellness delivered with love.</p>
  </div>
</body>
</html>`;

const orderConfirmationEmail = async (customerName, to, subject, orderData) => {
    try {
        const htmlTemplate = orderConfirmationTemplate(
            customerName,
            orderData.orderNumber,
            orderData.orderDate,
            orderData.totalAmount,
            orderData.paymentStatus,
            orderData.items,
            orderData.deliveryAddress,
            orderData.expectedDelivery
        );

        await transporter.sendMail({
            from: `Shree Venkateswara Agros and Herbs <${process.env.NODEMAILER_USER_EMAIL}>`,
            to,
            subject,
            html: htmlTemplate,
        });
        console.log("Order confirmation email sent successfully to:", to);
    } catch (error) {
        console.log("Error sending order confirmation email:", error);
        throw error;
    }
};

export default orderConfirmationEmail;