import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER || 'kunamsanthosh992@gmail.com';
  const rawPass = process.env.SMTP_PASS || 'mptutegromskcuvd';
  const pass = rawPass.replace(/\s+/g, '');

  if (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('gmail')) {
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

  // Gmail direct service with app password
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

/**
 * Send 6-digit OTP for official SRMIST login code
 */
export const sendLoginCodeEmail = async (toEmail, otp, name = 'SRMIST Member') => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your CampusFix Login Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { text-align: center; margin: 28px 0; background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 12px; padding: 20px; }
        .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1e40af; font-weight: 700; margin-bottom: 8px; }
        .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; margin: 0; }
        .info-pill { display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .security-note { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>CampusFix</h1>
          <p>Official SRMIST Portal Authentication</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p class="message">
            Use the following 6-digit one-time security code to log in to your official SRMIST account on <strong>CampusFix</strong>:
          </p>
          <div class="otp-box">
            <div class="otp-label">One-Time Login Code</div>
            <div class="otp-code">${otp}</div>
            <div class="info-pill">⏱ Valid for 10 minutes</div>
          </div>
          <p class="message">
            If you did not initiate this login request, please make sure your account is secure.
          </p>
          <div class="security-note">
            This verification code is strictly intended for <strong>${toEmail}</strong>. Do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CampusFix & SRMIST Campus Portal. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: toEmail,
      subject: `[CampusFix] ${otp} is your SRMIST login code`,
      html,
    });
    console.log(`✉️ Login Code email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending login code email to ${toEmail}:`, error.message);
    console.log(`\n======================================================`);
    console.log(`🔑 [CAMPUSFIX SRMIST LOGIN CODE FALLBACK]`);
    console.log(`📧 Target Email: ${toEmail}`);
    console.log(`🔢 6-Digit Code: ${otp}`);
    console.log(`======================================================\n`);
    return { success: false, error: error.message };
  }
};

/**
 * Send email to student when their reported campus issue is marked as RESOLVED
 */
export const sendIssueResolvedEmail = async (toEmail, studentName = 'Student', issueData = {}) => {
  const transporter = createTransporter();

  const {
    complaintId = 'SRM-ISSUE',
    title = 'Campus Facility Issue',
    category = 'General Maintenance',
    location = 'SRMIST Campus',
    resolutionNote = 'The technician has finished repairing the issue and verified normal operational status.',
    resolvedAt = new Date(),
    technicianName = 'Campus Maintenance Team',
  } = issueData;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const myIssuesUrl = `${clientUrl}/student/my-issues`;

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(resolvedAt));

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Campus Issue Has Been Resolved</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .wrapper { width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .check-badge { width: 56px; height: 56px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; line-height: 56px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.95; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0; }
        .ticket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
        .ticket-id { font-family: monospace; font-size: 14px; font-weight: 700; color: #059669; }
        .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-row { margin-bottom: 10px; font-size: 13px; }
        .field-label { color: #64748b; font-weight: 600; width: 110px; display: inline-block; }
        .field-value { color: #0f172a; font-weight: 600; }
        .note-box { background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; padding: 12px 16px; margin: 18px 0; font-size: 13px; color: #065f46; }
        .cta-container { text-align: center; margin: 32px 0 20px; }
        .btn-cta { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); }
        .footer { background: #f8fafc; padding: 22px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="check-badge">&#10003;</div>
          <h1>Issue Marked as Resolved!</h1>
          <p>SRMIST Smart Campus Maintenance Notification</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${studentName},</div>
          <p class="message">
            Good news! The campus maintenance ticket you reported has been inspected, repaired, and verified as operational by our facility team.
          </p>

          <div class="ticket-card">
            <div class="ticket-header">
              <span class="ticket-id">Ticket #${complaintId}</span>
              <span class="status-badge">RESOLVED</span>
            </div>
            <div class="field-row">
              <span class="field-label">Issue:</span>
              <span class="field-value">${title}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Category:</span>
              <span class="field-value">${category}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Location:</span>
              <span class="field-value">${location}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Resolved On:</span>
              <span class="field-value">${formattedDate}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Technician:</span>
              <span class="field-value">${technicianName}</span>
            </div>
            
            ${resolutionNote ? `
              <div class="note-box">
                <strong>Technician Remark:</strong> ${resolutionNote}
              </div>
            ` : ''}
          </div>

          <div class="cta-container">
            <a href="${myIssuesUrl}" class="btn-cta" target="_blank">
              Rate Resolution & View Evidence &#8594;
            </a>
          </div>

          <p class="message" style="font-size: 12px; text-align: center; color: #64748b; margin-top: 20px;">
            Your feedback directly impacts campus service SLA ratings. If the problem persists or is incomplete, you can also reopen this ticket from your dashboard.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CampusFix SRMIST. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: toEmail,
      subject: `[Resolved] Ticket #${complaintId}: ${title}`,
      html,
    });
    console.log(`✉️ Issue resolution email successfully sent to ${toEmail} (Ticket ${complaintId}): ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending issue resolved email to ${toEmail}:`, error.message);
    console.log(`\n======================================================`);
    console.log(`🎉 [CAMPUSFIX DEV RESOLUTION NOTIFICATION FALLBACK]`);
    console.log(`📧 Student Email:    ${toEmail}`);
    console.log(`🎫 Complaint ID:     ${complaintId}`);
    console.log(`📋 Issue:            ${title}`);
    console.log(`✅ Status:           RESOLVED`);
    console.log(`======================================================\n`);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome & credential email when a maintenance technician is onboarded
 */
export const sendTechnicianWelcomeEmail = async ({
  toEmail,
  name = 'Technician',
  staffId = 'STF-GEN',
  departmentName = 'General Maintenance',
  temporaryPassword = 'Staff@123',
  phone = '',
}) => {
  const transporter = createTransporter();
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CampusFix Maintenance Fleet</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .wrapper { width: 100%; max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .badge { display: inline-block; background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(147, 197, 253, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .field-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .field-row:last-child { border-bottom: none; }
        .field-label { color: #64748b; font-weight: 600; }
        .field-value { color: #0f172a; font-weight: 700; }
        .cred-highlight { font-family: monospace; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 6px; }
        .btn-cta { display: block; text-align: center; background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 28px 0 16px; }
        .notice-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #1e40af; line-height: 1.5; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="badge">SRMIST Campus Operations</div>
          <h1>CampusFix</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Technician Fleet Onboarding Confirmation</p>
        </div>
        <div class="content">
          <div class="greeting">Welcome to the Team, ${name}!</div>
          <p class="message">
            You have been officially onboarded as a <strong>Maintenance Technician</strong> in the CampusFix facility dispatch system. Your account has been provisioned and is ready for automated work order assignments.
          </p>

          <div class="details-card">
            <div class="field-row">
              <span class="field-label">Staff ID:</span>
              <span class="field-value">${staffId}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Department / Trade:</span>
              <span class="field-value">${departmentName}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Official Email:</span>
              <span class="field-value">${toEmail}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Initial Password:</span>
              <span class="field-value"><code class="cred-highlight">${temporaryPassword}</code></span>
            </div>
            ${phone ? `
            <div class="field-row">
              <span class="field-label">Contact Phone:</span>
              <span class="field-value">${phone}</span>
            </div>
            ` : ''}
            <div class="field-row">
              <span class="field-label">Duty Status:</span>
              <span class="field-value" style="color: #059669;">Active On-Duty</span>
            </div>
          </div>

          <a href="${loginUrl}" class="btn-cta" target="_blank">
            Access Technician Work Order Portal &#8594;
          </a>

          <div class="notice-box">
            <strong>Next Steps:</strong>
            <ul style="margin: 6px 0 0; padding-left: 18px;">
              <li>Log in using your official email and temporary password above.</li>
              <li>View your live assigned tasks under <strong>Assigned Work Orders</strong>.</li>
              <li>Upload photographic resolution proof when repairs are completed.</li>
              <li>For security, please update your password after your initial login.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CampusFix &bull; SRM Institute of Science and Technology
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: toEmail,
      subject: `[CampusFix] Welcome to Maintenance Fleet - Staff Account Created (${staffId})`,
      html,
    });
    console.log(`✉️ Technician onboarding email successfully sent to ${toEmail} (${staffId}): ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending technician onboarding email to ${toEmail}:`, error.message);
    console.log(`\n======================================================`);
    console.log(`🔧 [CAMPUSFIX TECHNICIAN ONBOARDING NOTIFICATION FALLBACK]`);
    console.log(`📧 Technician Email: ${toEmail}`);
    console.log(`👤 Name:             ${name}`);
    console.log(`🏷️ Staff ID:         ${staffId}`);
    console.log(`🏢 Department:       ${departmentName}`);
    console.log(`🔑 Initial Password: ${temporaryPassword}`);
    console.log(`======================================================\n`);
    return { success: false, error: error.message };
  }
};


