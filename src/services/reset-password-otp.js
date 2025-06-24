import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.NODEMAILER_USER_EMAIL,
        pass: process.env.NODEMAILER_USER_PASSWORD,
    },
});

// Template 1: Modern Gradient Design
const otpEmailTemplateModern = (email, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code - Shree Venkateswara Agros</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .email-container {
            background-color: white;
            margin: 20px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        .header-subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px 30px;
            background-color: #fafafa;
        }
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            text-align: center;
        }
        .description {
            font-size: 16px;
            color: #4a5568;
            text-align: center;
            margin-bottom: 30px;
        }
        .otp-container {
            text-align: center;
            margin: 40px 0;
        }
        .otp-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .otp-code {
            font-size: 36px;
            letter-spacing: 12px;
            font-weight: 800;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            display: inline-block;
            box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
            font-family: 'Courier New', monospace;
        }
        .expiry-info {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: center;
            border-left: 4px solid #ed8936;
        }
        .expiry-info h3 {
            margin: 0 0 8px 0;
            color: #c05621;
            font-size: 16px;
        }
        .expiry-info p {
            margin: 0;
            color: #744210;
            font-size: 14px;
        }
        .security-section {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
            border-left: 4px solid #38b2ac;
        }
        .security-section h3 {
            margin: 0 0 12px 0;
            color: #234e52;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .security-section p {
            margin: 0;
            color: #2c7a7b;
            font-size: 14px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #2d3748;
            color: #cbd5e0;
            padding: 30px;
            text-align: center;
            font-size: 12px;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer-email {
            color: #059669;
        }
        @media (max-width: 480px) {
            .email-container {
                margin: 10px;
            }
            .header, .content {
                padding: 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 8px;
                padding: 15px 20px;
            }
            .cta-button {
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🌿 Shree Venkateswara Agros</div>
            <div class="header-subtitle">Natural Products & Wellness Solutions</div>
        </div>
        
        <div class="content">
            <div class="welcome-text">Verification Required</div>
            <div class="description">
                We've sent you a secure verification code to complete your wellness account setup.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-info">
                <h3>⏰ Time Sensitive</h3>
                <p>This verification code will expire in 30 minutes for your security.</p>
            </div>
            
            <div class="security-section">
                <h3>🔒 Security Notice</h3>
                <p>This code is confidential and should never be shared. If you didn't request this verification, please contact our support team immediately.</p>
            </div>
                        
            <p style="text-align: center; margin-top: 30px; color: #4a5568;">
                Once verified, you'll have complete access to browse and purchase from our premium collection of natural wellness products and herbs.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>🌿 Shree Venkateswara Agros and Herbs</strong></p>
            <p>This email was sent to <span class="footer-email">${email}</span></p>
            <p>Need help? Contact us at <span class="footer-email">support@srivenkateswaraagros.com</span></p>
            <p>© 2025 Shree Venkateswara Agros and Herbs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export const passwordOtpEmail = async (to, otp) => {
    try {
        const subject = "Your Verification Code - MotoLab PitShop";
        const htmlContent = otpEmailTemplateModern(to, otp);

        await transporter.sendMail({
            from: `SVAH<${process.env.NODEMAILER_USER_EMAIL}>`,
            to,
            subject,
            html: htmlContent,
        });
        console.log("OTP email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw error;
    }
};
  