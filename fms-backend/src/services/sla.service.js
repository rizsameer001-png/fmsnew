const Complaint = require('../models/Complaint.model');
const Task = require('../models/Task.model');
const SLAPolicy = require('../models/SLAPolicy.model');
const Notification = require('../models/Notification.model');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

// Calculate SLA deadline
const calculateSLADeadline = (priority, createdAt) => {
  const slaTimes = {
    low: { response: 24, resolution: 72 },
    medium: { response: 12, resolution: 48 },
    high: { response: 4, resolution: 24 },
    urgent: { response: 1, resolution: 8 },
  };

  const sla = slaTimes[priority] || slaTimes.medium;
  const responseDeadline = new Date(createdAt);
  responseDeadline.setHours(responseDeadline.getHours() + sla.response);
  
  const resolutionDeadline = new Date(createdAt);
  resolutionDeadline.setHours(resolutionDeadline.getHours() + sla.resolution);

  return { responseDeadline, resolutionDeadline };
};

// Check if SLA is breached
const isSLABreached = (deadline, currentTime = new Date()) => {
  return currentTime > deadline;
};

// Monitor complaint SLA
const monitorComplaintSLA = async (complaintId) => {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return;

    const now = new Date();
    let slaBreached = false;
    let breachType = null;

    // Check response SLA
    if (complaint.slaResponseDeadline && now > complaint.slaResponseDeadline && 
        complaint.status === 'pending') {
      slaBreached = true;
      breachType = 'response';
    }

    // Check resolution SLA
    if (complaint.slaResolutionDeadline && now > complaint.slaResolutionDeadline && 
        complaint.status !== 'closed') {
      slaBreached = true;
      breachType = 'resolution';
    }

    if (slaBreached && !complaint.slaBreached) {
      complaint.slaBreached = true;
      complaint.slaBreachDetails = {
        type: breachType,
        breachedAt: now,
        exceededBy: breachType === 'response' 
          ? Math.round((now - complaint.slaResponseDeadline) / (1000 * 60 * 60))
          : Math.round((now - complaint.slaResolutionDeadline) / (1000 * 60 * 60))
      };
      await complaint.save();

      // Notify managers about SLA breach
      await Notification.create({
        userId: complaint.assignedBy,
        title: 'SLA Breach Alert',
        body: `Complaint ${complaint.complaintNumber} has breached ${breachType} SLA`,
        type: 'complaint',
        priority: 'high',
        referenceId: complaint._id,
        referenceModel: 'Complaint'
      });

      // Escalate if needed
      await escalateOnSLABreach(complaint);
    }
  } catch (error) {
    logger.error('Monitor complaint SLA error:', error);
  }
};

// Escalate on SLA breach
const escalateOnSLABreach = async (complaint) => {
  try {
    const escalationLevels = {
      response: {
        1: 'supervisor',
        2: 'manager',
        3: 'admin'
      },
      resolution: {
        1: 'supervisor',
        2: 'manager',
        3: 'admin'
      }
    };

    const breachHours = complaint.slaBreachDetails?.exceededBy || 0;
    let escalationLevel = 1;
    
    if (breachHours > 24) escalationLevel = 2;
    if (breachHours > 48) escalationLevel = 3;

    if (escalationLevel > complaint.escalationLevel) {
      complaint.escalationLevel = escalationLevel;
      complaint.escalationHistory.push({
        escalatedAt: new Date(),
        reason: `SLA breach - ${complaint.slaBreachDetails?.type} SLA exceeded by ${breachHours} hours`,
        fromRole: complaint.slaBreachDetails?.type === 'response' ? 'technician' : 'supervisor',
        toRole: escalationLevels[complaint.slaBreachDetails?.type][escalationLevel]
      });
      await complaint.save();

      // Send escalation notification
      const io = getIO();
      io.to(`role_${escalationLevels[complaint.slaBreachDetails?.type][escalationLevel]}`)
        .emit('sla_breach_escalation', {
          complaintId: complaint._id,
          complaintNumber: complaint.complaintNumber,
          breachType: complaint.slaBreachDetails?.type,
          exceededBy: breachHours
        });
    }
  } catch (error) {
    logger.error('Escalate on SLA breach error:', error);
  }
};

// Calculate SLA compliance metrics
const calculateSLACompliance = async (buildingId, startDate, endDate) => {
  try {
    const match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (buildingId) match.buildingId = buildingId;

    const metrics = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
          avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } },
          avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
        }
      },
      {
        $project: {
          priority: '$_id',
          total: 1,
          breached: 1,
          complianceRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$total', '$breached'] }, '$total'] },
              100
            ]
          },
          avgResponseTimeHours: { $divide: ['$avgResponseTime', 1000 * 60 * 60] },
          avgResolutionTimeHours: { $divide: ['$avgResolutionTime', 1000 * 60 * 60] }
        }
      }
    ]);

    return metrics;
  } catch (error) {
    logger.error('Calculate SLA compliance error:', error);
    return [];
  }
};


// Get SLA report
const getSLAReport = async (buildingId, startDate, endDate) => {
  try {
    const match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (buildingId) match.buildingId = buildingId;

    const report = await Complaint.aggregate([
      { $match: match },
      {
        $facet: {
          overallMetrics: [
            {
              $group: {
                _id: null,
                totalComplaints: { $sum: 1 },
                slaBreached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
                avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } },
                avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
              }
            },
            {
              $project: {
                totalComplaints: 1,
                slaBreached: 1,
                complianceRate: {
                  $multiply: [
                    { $divide: [{ $subtract: ['$totalComplaints', '$slaBreached'] }, '$totalComplaints'] },
                    100
                  ]
                },
                avgResponseTimeHours: { $divide: ['$avgResponseTime', 1000 * 60 * 60] },
                avgResolutionTimeHours: { $divide: ['$avgResolutionTime', 1000 * 60 * 60] }
              }
            }
          ],
          priorityWise: [
            {
              $group: {
                _id: '$priority',
                total: { $sum: 1 },
                breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
                avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } },
                avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
              }
            }
          ],
          breachedComplaints: [
            { $match: { slaBreached: true } },
            { $sort: { createdAt: -1 } },
            { $limit: 20 },
            {
              $project: {
                complaintNumber: 1,
                priority: 1,
                serviceType: 1,
                createdAt: 1,
                slaBreachDetails: 1
              }
            }
          ]
        }
      }
    ]);

    return report[0];
  } catch (error) {
    logger.error('Get SLA report error:', error);
    return null;
  }
};

// Check and update SLA for all pending complaints
const checkAllPendingSLA = async () => {
  try {
    const pendingComplaints = await Complaint.find({
      status: { $nin: ['closed', 'resolved'] },
      slaBreached: false
    });

    let breachedCount = 0;
    for (const complaint of pendingComplaints) {
      await monitorComplaintSLA(complaint._id);
      const updated = await Complaint.findById(complaint._id);
      if (updated.slaBreached) breachedCount++;
    }

    logger.info(`SLA check completed: ${breachedCount} new breaches found`);
    return { total: pendingComplaints.length, newBreaches: breachedCount };
  } catch (error) {
    logger.error('Check all pending SLA error:', error);
    return null;
  }
};

// Get SLA policy for service type and priority
const getSLAPolicy = async (serviceType, priority) => {
  try {
    let policy = await SLAPolicy.findOne({ serviceType, priority, isActive: true });
    
    if (!policy) {
      // Fallback to default policy
      policy = await SLAPolicy.findOne({ serviceType: 'default', priority, isActive: true });
    }
    
    if (!policy) {
      // Default hardcoded values
      const defaultTimes = {
        low: { response: 1440, resolution: 4320 }, // 24h, 72h
        medium: { response: 720, resolution: 2880 }, // 12h, 48h
        high: { response: 240, resolution: 1440 }, // 4h, 24h
        urgent: { response: 60, resolution: 480 } // 1h, 8h
      };
      
      return {
        responseTime: defaultTimes[priority]?.response || 720,
        resolutionTime: defaultTimes[priority]?.resolution || 2880,
        escalationMatrix: []
      };
    }
    
    return policy;
  } catch (error) {
    logger.error('Get SLA policy error:', error);
    return null;
  }
};

// Create or update SLA policy
const updateSLAPolicy = async (policyData) => {
  try {
    const { serviceType, priority, responseTime, resolutionTime, escalationMatrix, penaltyAmount } = policyData;
    
    const policy = await SLAPolicy.findOneAndUpdate(
      { serviceType, priority },
      {
        serviceType,
        priority,
        responseTime,
        resolutionTime,
        escalationMatrix,
        penaltyAmount,
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    logger.info(`SLA policy updated for ${serviceType} - ${priority}`);
    return policy;
  } catch (error) {
    logger.error('Update SLA policy error:', error);
    return null;
  }
};

// Calculate SLA penalty
const calculateSLAPenalty = async (complaint) => {
  try {
    if (!complaint.slaBreached) return 0;
    
    const policy = await getSLAPolicy(complaint.serviceType, complaint.priority);
    if (!policy || !policy.penaltyAmount) return 0;
    
    const breachHours = complaint.slaBreachDetails?.exceededBy || 0;
    const penaltyMultiplier = Math.ceil(breachHours / 24); // Additional penalty every 24 hours
    const totalPenalty = policy.penaltyAmount * penaltyMultiplier;
    
    return Math.min(totalPenalty, policy.penaltyAmount * 3); // Cap at 3x
  } catch (error) {
    logger.error('Calculate SLA penalty error:', error);
    return 0;
  }
};

// Generate SLA compliance trends
const getSLATrends = async (buildingId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (buildingId) match.buildingId = buildingId;
    
    const trends = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            priority: "$priority"
          },
          total: { $sum: 1 },
          breached: { $sum: { $cond: ['$slaBreached', 1, 0] } }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          metrics: {
            $push: {
              priority: "$_id.priority",
              compliance: {
                $multiply: [
                  { $divide: [{ $subtract: ["$total", "$breached"] }, "$total"] },
                  100
                ]
              }
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    return trends;
  } catch (error) {
    logger.error('Get SLA trends error:', error);
    return [];
  }
};

// Send SLA breach notifications
const sendSLABreachNotifications = async (complaint) => {
  try {
    const recipients = [];
    
    // Add supervisor
    if (complaint.assignedBy) {
      recipients.push(complaint.assignedBy);
    }
    
    // Add manager
    const manager = await User.findOne({ buildingId: complaint.buildingId, role: 'manager' });
    if (manager) {
      recipients.push(manager._id);
    }
    
    // Add admin
    const admin = await User.findOne({ role: 'super_admin' });
    if (admin) {
      recipients.push(admin._id);
    }
    
    for (const recipientId of recipients) {
      await Notification.create({
        userId: recipientId,
        title: '⚠️ SLA Breach Alert',
        body: `Complaint ${complaint.complaintNumber} has breached ${complaint.slaBreachDetails?.type} SLA by ${complaint.slaBreachDetails?.exceededBy} hours`,
        type: 'complaint',
        priority: 'high',
        referenceId: complaint._id,
        referenceModel: 'Complaint',
        channels: ['push', 'email', 'inapp']
      });
    }
    
    const io = getIO();
    recipients.forEach(recipientId => {
      io.to(`user_${recipientId}`).emit('sla_breach', {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        breachDetails: complaint.slaBreachDetails
      });
    });
  } catch (error) {
    logger.error('Send SLA breach notifications error:', error);
  }
};

module.exports = {
  calculateSLADeadline,
  isSLABreached,
  monitorComplaintSLA,
  escalateOnSLABreach,
  calculateSLACompliance,
  getSLAReport,
  checkAllPendingSLA,
  getSLAPolicy,
  updateSLAPolicy,
  calculateSLAPenalty,
  getSLATrends,
  sendSLABreachNotifications
};