const twilio = require('twilio');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

let twilioClient = null;

const initTwilio = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info('✅ Twilio initialized');
  }
  return twilioClient;
};

// Send SMS
const sendSMS = async (to, message) => {
  try {
    const client = initTwilio();
    if (!client) {
      logger.warn('Twilio not configured, skipping SMS');
      return { success: false, error: 'Twilio not configured' };
    }

    // Format phone number (ensure country code)
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+91${to}`; // Default to India
    }

    const result = await client.messages.create({
      body: message,
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    logger.info(`SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp) => {
  const message = `Your FMS verification OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

// Send complaint update SMS
const sendComplaintUpdateSMS = async (phone, complaintNumber, status) => {
  const message = `FMS: Complaint ${complaintNumber} status updated to ${status}. Track at ${process.env.WEB_URL}/complaints/${complaintNumber}`;
  return sendSMS(phone, message);
};

// Send payment confirmation SMS
const sendPaymentConfirmationSMS = async (phone, invoiceNumber, amount) => {
  const message = `FMS: Payment of ₹${amount} received for invoice ${invoiceNumber}. Thank you!`;
  return sendSMS(phone, message);
};

// Send task reminder SMS
const sendTaskReminderSMS = async (phone, taskNumber, title, scheduledTime) => {
  const message = `FMS Reminder: Task ${taskNumber} - ${title} is scheduled at ${new Date(scheduledTime).toLocaleString()}`;
  return sendSMS(phone, message);
};

// Send emergency alert SMS
const sendEmergencyAlertSMS = async (phone, technicianName, locationLink) => {
  const message = `🚨 EMERGENCY ALERT: Technician ${technicianName} needs immediate assistance. Location: ${locationLink}`;
  return sendSMS(phone, message);
};

// Send attendance reminder SMS
const sendAttendanceReminderSMS = async (phone, name) => {
  const message = `FMS: ${name}, please mark your attendance. Login at ${process.env.WEB_URL}/attendance`;
  return sendSMS(phone, message);
};

// Send bulk SMS
const sendBulkSMS = async (recipients, message) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendSMS(recipient, message);
    results.push({ recipient, ...result });
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
};

// Send invoice due reminder
const sendInvoiceDueReminderSMS = async (phone, invoiceNumber, amount, dueDate) => {
  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const message = `FMS: Invoice ${invoiceNumber} for ₹${amount} is due in ${daysUntilDue} days. Pay now: ${process.env.WEB_URL}/invoices/${invoiceNumber}`;
  return sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendComplaintUpdateSMS,
  sendPaymentConfirmationSMS,
  sendTaskReminderSMS,
  sendEmergencyAlertSMS,
  sendAttendanceReminderSMS,
  sendBulkSMS,
  sendInvoiceDueReminderSMS,
};