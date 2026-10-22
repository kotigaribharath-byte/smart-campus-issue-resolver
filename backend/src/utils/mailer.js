import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user,
        pass,
      },
    });
  }

  // Default to gmail service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

const getFromHeader = () => {
  const fromName = process.env.SMTP_FROM_NAME || 'CampusFix';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@campusfix.edu';
  return `"${fromName}" <${fromEmail}>`;
};

/**
 * Send 6-digit OTP email for account registration verification
 */
export const sendVerificationOtpEmail = async (toEmail, otp, name = 'Student') => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your CampusFix Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { text-align: center; margin: 28px 0; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
        .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; margin: 0; }
        .info-pill { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .security-note { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; paddingTop: 20px; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>CampusFix</h1>
          <p>Smart Campus Issue Resolver</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p class="message">
            Thank you for registering with <strong>CampusFix</strong>. To complete your registration and secure your campus account, please verify your email address using the code below.
          </p>
          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="info-pill">⏱ Valid for 10 minutes</div>
          </div>
          <p class="message">
            Enter this 6-digit code on the verification screen to activate your account.
          </p>
          <div class="security-note">
            If you did not attempt to sign up for CampusFix, please disregard this email or report it to your campus IT administrator.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CampusFix System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: toEmail,
      subject: `[CampusFix] ${otp} is your verification code`,
      html,
    });
    console.log(`✉️ Verification OTP email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${toEmail}:`, error.message);
    // Dev fallback output in console for immediate testing
    console.log(`\n======================================================`);
    console.log(`🔑 [CAMPUSFIX DEV OTP FALLBACK]`);
    console.log(`📧 Target Email: ${toEmail}`);
    console.log(`🔢 6-Digit OTP:  ${otp}`);
    console.log(`======================================================\n`);
    return { success: false, error: error.message };
  }
};

/**
 * Send 6-digit OTP for password reset
 */
export const sendPasswordResetOtpEmail = async (toEmail, otp, name = 'User') => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your CampusFix Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { text-align: center; margin: 28px 0; background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; padding: 20px; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #991b1b; font-weight: 700; margin-bottom: 8px; }
        .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #dc2626; margin: 0; }
        .info-pill { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .security-note { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>CampusFix</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p class="message">
            We received a request to reset your password for your <strong>CampusFix</strong> account. Use the authorization code below to proceed with setting a new password:
          </p>
          <div class="otp-box">
            <div class="otp-label">Password Reset Code</div>
            <div class="otp-code">${otp}</div>
            <div class="info-pill">⏱ Valid for 10 minutes</div>
          </div>
          <p class="message">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <div class="security-note">
            Never share this code with anyone. CampusFix staff will never ask for your verification code.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CampusFix Security. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: toEmail,
      subject: `[CampusFix] ${otp} is your password reset code`,
      html,
    });
    console.log(`✉️ Password reset OTP email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${toEmail}:`, error.message);
    console.log(`\n======================================================`);
    console.log(`🔑 [CAMPUSFIX DEV PASSWORD RESET OTP FALLBACK]`);
    console.log(`📧 Target Email: ${toEmail}`);
    console.log(`🔢 6-Digit OTP:  ${otp}`);
    console.log(`======================================================\n`);
    return { success: false, error: error.message };
  }
};
