const admin = require('firebase-admin');
const { getFirebaseApp } = require('../config/firebase');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

let firebaseApp = null;

const getFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = getFirebaseApp();
  }
  return firebaseApp;
};

// Send push notification to single device
const sendPushNotification = async (fcmToken, notification, data = {}) => {
  try {
    const firebase = getFirebase();
    if (!firebase) {
      logger.warn('Firebase not configured, skipping push notification');
      return { success: false, error: 'Firebase not configured' };
    }

    if (!fcmToken) {
      return { success: false, error: 'No FCM token provided' };
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.image && { imageUrl: notification.image }),
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebase.messaging().send(message);
    logger.info(`Push notification sent: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Push notification error:', error);
    
    // If token is invalid, return specific error
    if (error.code === 'messaging/registration-token-not-registered') {
      return { success: false, error: 'INVALID_TOKEN', message: 'Token is no longer valid' };
    }
    
    return { success: false, error: error.message };
  }
};

// Send push notification to multiple devices
const sendMulticastPush = async (fcmTokens, notification, data = {}) => {
  try {
    const firebase = getFirebase();
    if (!firebase || !fcmTokens || fcmTokens.length === 0) {
      return { success: false, error: 'Firebase not configured or no tokens' };
    }

    const message = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
      },
    };

    const response = await firebase.messaging().sendEachForMulticast(message);
    
    const results = {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens: [],
    };

    // Process failed tokens
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          results.failedTokens.push({
            token: fcmTokens[idx],
            error: resp.error?.message,
          });
        }
      });
    }

    logger.info(`Multicast push sent: ${response.successCount} succeeded, ${response.failureCount} failed`);
    return { success: true, ...results };
  } catch (error) {
    logger.error('Multicast push error:', error);
    return { success: false, error: error.message };
  }
};

// Send complaint assigned notification
const sendComplaintAssignedPush = async (fcmToken, complaintNumber, title) => {
  return sendPushNotification(fcmToken, {
    title: 'New Complaint Assigned',
    body: `Complaint ${complaintNumber}: ${title.substring(0, 50)}`,
  }, {
    type: 'complaint',
    complaintId: complaintNumber,
  });
};

// Send task assigned notification
const sendTaskAssignedPush = async (fcmToken, taskNumber, title, scheduledDate) => {
  return sendPushNotification(fcmToken, {
    title: 'New Task Assigned',
    body: `Task ${taskNumber}: ${title.substring(0, 50)} - Due: ${new Date(scheduledDate).toLocaleDateString()}`,
  }, {
    type: 'task',
    taskId: taskNumber,
  });
};

// Send attendance reminder
const sendAttendanceReminderPush = async (fcmToken, name) => {
  return sendPushNotification(fcmToken, {
    title: 'Attendance Reminder',
    body: `Hello ${name}, don't forget to mark your attendance today!`,
  }, {
    type: 'attendance',
    action: 'mark_attendance',
  });
};

// Send invoice due notification
const sendInvoiceDuePush = async (fcmToken, invoiceNumber, amount, dueDate) => {
  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return sendPushNotification(fcmToken, {
    title: 'Invoice Due Reminder',
    body: `Invoice ${invoiceNumber} for ₹${amount} is due in ${daysUntilDue} days`,
  }, {
    type: 'invoice',
    invoiceId: invoiceNumber,
  });
};

// Send emergency alert
const sendEmergencyPush = async (fcmToken, technicianName, location) => {
  return sendPushNotification(fcmToken, {
    title: '🚨 EMERGENCY ALERT',
    body: `${technicianName} has triggered an emergency alert!`,
    priority: 'high',
  }, {
    type: 'emergency',
    technician: technicianName,
    location: JSON.stringify(location),
  });
};

// Send payment confirmation
const sendPaymentConfirmationPush = async (fcmToken, invoiceNumber, amount) => {
  return sendPushNotification(fcmToken, {
    title: 'Payment Confirmed',
    body: `Your payment of ₹${amount} for invoice ${invoiceNumber} has been received.`,
  }, {
    type: 'payment',
    invoiceId: invoiceNumber,
  });
};

// Send status update notification
const sendStatusUpdatePush = async (fcmToken, type, referenceId, status, message) => {
  return sendPushNotification(fcmToken, {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Update`,
    body: message,
  }, {
    type,
    referenceId,
    status,
  });
};

// Subscribe to topic
const subscribeToTopic = async (fcmToken, topic) => {
  try {
    const firebase = getFirebase();
    if (!firebase) return { success: false };
    
    await firebase.messaging().subscribeToTopic(fcmToken, topic);
    logger.info(`Subscribed ${fcmToken} to topic: ${topic}`);
    return { success: true };
  } catch (error) {
    logger.error('Subscribe to topic error:', error);
    return { success: false, error: error.message };
  }
};

// Unsubscribe from topic
const unsubscribeFromTopic = async (fcmToken, topic) => {
  try {
    const firebase = getFirebase();
    if (!firebase) return { success: false };
    
    await firebase.messaging().unsubscribeFromTopic(fcmToken, topic);
    logger.info(`Unsubscribed ${fcmToken} from topic: ${topic}`);
    return { success: true };
  } catch (error) {
    logger.error('Unsubscribe from topic error:', error);
    return { success: false, error: error.message };
  }
};

// Send to topic
const sendToTopic = async (topic, notification, data = {}) => {
  try {
    const firebase = getFirebase();
    if (!firebase) return { success: false };
    
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };
    
    const response = await firebase.messaging().send(message);
    logger.info(`Topic message sent to ${topic}: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Send to topic error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastPush,
  sendComplaintAssignedPush,
  sendTaskAssignedPush,
  sendAttendanceReminderPush,
  sendInvoiceDuePush,
  sendEmergencyPush,
  sendPaymentConfirmationPush,
  sendStatusUpdatePush,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendToTopic,
};