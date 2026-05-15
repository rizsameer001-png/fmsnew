// const nodemailer = require('nodemailer');
// const { logger } = require('../utils/logger');  // Fixed: use destructuring

// // Create transporter
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT),
//     secure: process.env.SMTP_PORT === '465',
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// // Send email
// const sendEmail = async (to, subject, html, attachments = []) => {
//   try {
//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: `"FMS System" <${process.env.SMTP_USER}>`,
//       to,
//       subject,
//       html,
//       attachments,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     if (logger && logger.info) {
//       logger.info(`Email sent to ${to}: ${info.messageId}`);
//     } else {
//       console.log(`Email sent to ${to}: ${info.messageId}`);
//     }
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     if (logger && logger.error) {
//       logger.error('Email send error:', error);
//     } else {
//       console.error('Email send error:', error);
//     }
//     return { success: false, error: error.message };
//   }
// };

// // Send OTP email
// const sendOTPEmail = async (email, otp) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background: #f9fafb; }
//         .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; letter-spacing: 5px; }
//         .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>FMS - Verify Your Email</h1>
//         </div>
//         <div class="content">
//           <p>Hello,</p>
//           <p>Thank you for registering with Facility Management System. Please use the following OTP to verify your email address:</p>
//           <div class="otp-code">${otp}</div>
//           <p>This OTP is valid for 10 minutes.</p>
//           <p>If you didn't request this, please ignore this email.</p>
//         </div>
//         <div class="footer">
//           <p>&copy; 2024 Facility Management System. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, 'Verify Your Email - FMS', html);
// };

// // Send welcome email
// const sendWelcomeEmail = async (email, name = 'User') => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
//         .content { padding: 20px; background: #f9fafb; }
//         .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
//         .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Welcome to FMS!</h1>
//         </div>
//         <div class="content">
//           <p>Hello ${name},</p>
//           <p>Welcome to the Facility Management System! We're excited to have you on board.</p>
//           <p>With FMS, you can:</p>
//           <ul>
//             <li>Raise and track complaints</li>
//             <li>Request services</li>
//             <li>View and pay invoices online</li>
//             <li>Get real-time updates</li>
//           </ul>
//           <a href="${process.env.WEB_URL}/login" class="button">Login to Your Account</a>
//         </div>
//         <div class="footer">
//           <p>&copy; 2024 Facility Management System. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, 'Welcome to Facility Management System', html);
// };

// // Send invoice email
// const sendInvoiceEmail = async (email, invoiceNumber, amount, dueDate, pdfBuffer) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
//         .amount { font-size: 28px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
//         .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Invoice ${invoiceNumber}</h1>
//         </div>
//         <div class="content">
//           <p>Dear Customer,</p>
//           <p>Your invoice is ready. Please find the details below:</p>
//           <div class="amount">₹${amount.toLocaleString()}</div>
//           <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
//           <p>Please make the payment before the due date to avoid late fees.</p>
//           <a href="${process.env.WEB_URL}/invoices/${invoiceNumber}" class="button">View Invoice</a>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, `Invoice ${invoiceNumber} from FMS`, html, [
//     {
//       filename: `invoice_${invoiceNumber}.pdf`,
//       content: pdfBuffer,
//       contentType: 'application/pdf',
//     },
//   ]);
// };

// // Send payment confirmation email
// const sendPaymentConfirmationEmail = async (email, invoiceNumber, amount, transactionId) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #10B981; color: white; padding: 20px; text-align: center; }
//         .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Payment Received!</h1>
//         </div>
//         <div class="success-icon">✅</div>
//         <div class="content">
//           <p>Dear Customer,</p>
//           <p>We have successfully received your payment.</p>
//           <p><strong>Invoice:</strong> ${invoiceNumber}</p>
//           <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
//           <p><strong>Transaction ID:</strong> ${transactionId}</p>
//           <p>Thank you for your payment!</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, `Payment Confirmation - Invoice ${invoiceNumber}`, html);
// };

// // Send complaint update email
// const sendComplaintUpdateEmail = async (email, complaintNumber, status, message) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
//         .status { display: inline-block; padding: 8px 16px; background: #F59E0B; color: white; border-radius: 20px; margin: 10px 0; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Complaint Update</h1>
//         </div>
//         <div class="content">
//           <p>Regarding your complaint <strong>${complaintNumber}</strong>:</p>
//           <div class="status">Status: ${status.toUpperCase()}</div>
//           <p>${message}</p>
//           <p><a href="${process.env.WEB_URL}/complaints/${complaintNumber}">View Complaint Status</a></p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, `Complaint ${complaintNumber} Update - ${status}`, html);
// };

// // Send reset password email
// const sendResetPasswordEmail = async (email, resetToken) => {
//   const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
//         .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Reset Your Password</h1>
//         </div>
//         <div class="content">
//           <p>Hello,</p>
//           <p>We received a request to reset your password. Click the button below to create a new password:</p>
//           <div style="text-align: center;">
//             <a href="${resetUrl}" class="button">Reset Password</a>
//           </div>
//           <p>This link is valid for 1 hour.</p>
//           <p>If you didn't request this, please ignore this email.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, 'Reset Your Password - FMS', html);
// };

// // Send task assigned email
// const sendTaskAssignedEmail = async (email, taskNumber, title, scheduledDate) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>New Task Assigned</h1>
//         </div>
//         <div class="content">
//           <p>Hello,</p>
//           <p>A new task has been assigned to you:</p>
//           <p><strong>Task Number:</strong> ${taskNumber}</p>
//           <p><strong>Title:</strong> ${title}</p>
//           <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
//           <p><a href="${process.env.WEB_URL}/tasks/${taskNumber}">View Task Details</a></p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   return sendEmail(email, `New Task Assigned - ${taskNumber}`, html);
// };

// module.exports = {
//   sendEmail,
//   sendOTPEmail,
//   sendWelcomeEmail,
//   sendInvoiceEmail,
//   sendPaymentConfirmationEmail,
//   sendComplaintUpdateEmail,
//   sendResetPasswordEmail,
//   sendTaskAssignedEmail,
// };




const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"FMS System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    if (logger && logger.info) {
      logger.info(`Email sent to ${to}: ${info.messageId}`);
    } else {
      console.log(`Email sent to ${to}: ${info.messageId}`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Email send error:', error);
    } else {
      console.error('Email send error:', error);
    }
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; letter-spacing: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FMS - Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with Facility Management System. Please use the following OTP to verify your email address:</p>
          <div class="otp-code">${otp}</div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Facility Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Verify Your Email - FMS', html);
};

// Send welcome email
const sendWelcomeEmail = async (email, name = 'User') => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to FMS!</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Welcome to the Facility Management System! We're excited to have you on board.</p>
          <p>With FMS, you can:</p>
          <ul>
            <li>Raise and track complaints</li>
            <li>Request services</li>
            <li>View and pay invoices online</li>
            <li>Get real-time updates</li>
          </ul>
          <a href="${process.env.WEB_URL}/login" class="button">Login to Your Account</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 Facility Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Welcome to Facility Management System', html);
};

// Send invoice email
const sendInvoiceEmail = async (email, invoiceNumber, amount, dueDate, pdfBuffer) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .amount { font-size: 28px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice ${invoiceNumber}</h1>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your invoice is ready. Please find the details below:</p>
          <div class="amount">₹${amount.toLocaleString()}</div>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          <p>Please make the payment before the due date to avoid late fees.</p>
          <a href="${process.env.WEB_URL}/invoices/${invoiceNumber}" class="button">View Invoice</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Invoice ${invoiceNumber} from FMS`, html, [
    {
      filename: `invoice_${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ]);
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, invoiceNumber, amount, transactionId) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Received!</h1>
        </div>
        <div class="success-icon">✅</div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>We have successfully received your payment.</p>
          <p><strong>Invoice:</strong> ${invoiceNumber}</p>
          <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p>Thank you for your payment!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Payment Confirmation - Invoice ${invoiceNumber}`, html);
};

// Send complaint update email
const sendComplaintUpdateEmail = async (email, complaintNumber, status, message) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
        .status { display: inline-block; padding: 8px 16px; background: #F59E0B; color: white; border-radius: 20px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complaint Update</h1>
        </div>
        <div class="content">
          <p>Regarding your complaint <strong>${complaintNumber}</strong>:</p>
          <div class="status">Status: ${status.toUpperCase()}</div>
          <p>${message}</p>
          <p><a href="${process.env.WEB_URL}/complaints/${complaintNumber}">View Complaint Status</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Complaint ${complaintNumber} Update - ${status}`, html);
};

// Send reset password email
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>This link is valid for 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, 'Reset Your Password - FMS', html);
};

// Send task assigned email
const sendTaskAssignedEmail = async (email, taskNumber, title, scheduledDate) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Task Assigned</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>A new task has been assigned to you:</p>
          <p><strong>Task Number:</strong> ${taskNumber}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
          <p><a href="${process.env.WEB_URL}/tasks/${taskNumber}">View Task Details</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `New Task Assigned - ${taskNumber}`, html);
};

// ==================== NEW: SALARY SLIP EMAIL FUNCTIONS ====================

/**
 * Send salary slip to employee via email
 * @param {string} email - Employee email
 * @param {string} name - Employee name
 * @param {object} salary - Salary object
 * @param {Buffer} pdfBuffer - PDF salary slip buffer
 */
const sendSalarySlipEmail = async (email, name, salary, pdfBuffer) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthName = monthNames[salary.month - 1];
  const year = salary.year;
  const currencySymbol = salary.currencySymbol || (salary.currency === 'USD' ? '$' : salary.currency === 'AED' ? 'د.إ' : '₹');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px; }
        .amount { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Salary Slip</h1>
          <p>${monthName} ${year}</p>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Your salary for the month of <strong>${monthName} ${year}</strong> has been processed.</p>
          
          <div class="amount">
            ${currencySymbol} ${salary.netSalary.toLocaleString()}
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Employee Name:</strong></span>
              <span>${salary.userName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Role:</strong></span>
              <span>${salary.userRole?.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Basic Salary:</strong></span>
              <span>${currencySymbol} ${salary.basicSalary.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Gross Salary:</strong></span>
              <span>${currencySymbol} ${salary.grossSalary.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total Deductions:</strong></span>
              <span>${currencySymbol} ${salary.totalDeductions.toLocaleString()}</span>
            </div>
            <div class="detail-row" style="border-bottom: none; font-weight: bold; font-size: 16px;">
              <span><strong>Net Salary:</strong></span>
              <span>${currencySymbol} ${salary.netSalary.toLocaleString()}</span>
            </div>
          </div>
          
          <p>Please find attached your detailed salary slip for your records.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.WEB_URL}/employee/my-salary" class="button">View Salary History</a>
          </div>
          
          <p style="margin-top: 20px;">For any discrepancies, please contact the HR department.</p>
          <p>Thank you,<br><strong>Facility Management System</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Facility Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, `Salary Slip - ${monthName} ${year}`, html, [
    {
      filename: `Salary_Slip_${salary.userName}_${monthName}_${year}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ]);
};

/**
 * Send bulk salary slips to multiple employees
 * @param {Array} salariesWithBuffers - Array of objects with email, name, salary, pdfBuffer
 * @returns {Promise<Array>} Results of email sending
 */
const sendBulkSalarySlips = async (salariesWithBuffers) => {
  const results = [];
  
  for (const item of salariesWithBuffers) {
    try {
      const result = await sendSalarySlipEmail(
        item.email,
        item.name,
        item.salary,
        item.pdfBuffer
      );
      results.push({ 
        email: item.email, 
        name: item.name, 
        success: result.success, 
        messageId: result.messageId 
      });
      // Log progress
      console.log(`📧 Sent salary slip to ${item.email}: ${result.success ? '✅' : '❌'}`);
    } catch (error) {
      results.push({ 
        email: item.email, 
        name: item.name, 
        success: false, 
        error: error.message 
      });
      console.error(`❌ Failed to send to ${item.email}:`, error.message);
    }
    
    // Small delay to avoid rate limiting (500ms between emails)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendPaymentConfirmationEmail,
  sendComplaintUpdateEmail,
  sendResetPasswordEmail,
  sendTaskAssignedEmail,
  sendSalarySlipEmail,      // ✅ NEW
  sendBulkSalarySlips,      // ✅ NEW
};