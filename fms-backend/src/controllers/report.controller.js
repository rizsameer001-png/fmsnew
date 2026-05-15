


// fms-backend/src/controllers/report.controller.js
// Make sure to run: npm install exceljs pdfkit

// const Report = require('../models/Report.model');
// const ActivityLog = require('../models/ActivityLog.model');
// const Complaint = require('../models/Complaint.model');
// const Attendance = require('../models/Attendance.model');
// const Invoice = require('../models/Invoice.model');
// const Task = require('../models/Task.model');
// const User = require('../models/User.model');
// const { exportToExcel: exportExcel } = require('../services/export.service');
// const { generatePDF } = require('../services/pdf.service');
// const { logger } = require('../utils/logger');

// // Debug flag
// const DEBUG = true;

// // Helper object for report titles
// const reportTypeLabels = {
//   overview: 'Overview Report',
//   revenue: 'Revenue Report',
//   complaints: 'Complaints Report',
//   attendance: 'Attendance Report',
//   performance: 'Performance Report'
// };

// // @desc    Get analytics data for dashboard
// // @route   GET /api/reports/analytics
// // @access  Private/Admin/Manager
// const getAnalytics = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getAnalytics called');
//   try {
//     const { start, end, type = 'overview' } = req.query;
    
//     const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
//     const endDate = end ? new Date(end) : new Date();
    
//     if (DEBUG) console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
//     const [
//       totalComplaints,
//       resolvedComplaints,
//       pendingComplaints,
//       totalTasks,
//       completedTasks,
//       totalInvoices,
//       paidInvoices,
//       totalRevenue,
//       totalUsers
//     ] = await Promise.all([
//       Complaint.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Complaint.countDocuments({ status: 'resolved', createdAt: { $gte: startDate, $lte: endDate } }),
//       Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] }, createdAt: { $gte: startDate, $lte: endDate } }),
//       Task.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Task.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.countDocuments({ status: 'paid', createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.aggregate([
//         { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
//         { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//       ]),
//       User.countDocuments()
//     ]);

//     const monthlyData = await Complaint.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate, $lte: endDate }
//         }
//       },
//       {
//         $group: {
//           _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     const chartLabels = monthlyData.map(d => `${d._id.month}/${d._id.year}`);
//     const chartData = monthlyData.map(d => d.count);

//     res.json({
//       success: true,
//       stats: {
//         totalComplaints,
//         resolvedComplaints,
//         pendingComplaints,
//         totalTasks,
//         completedTasks,
//         totalInvoices,
//         paidInvoices,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         totalUsers,
//         resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0
//       },
//       charts: {
//         labels: chartLabels,
//         data: chartData
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get analytics error:', error);
//     logger.error('Get analytics error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Export report (generic) - Generates actual Excel/PDF files
// // @route   POST /api/reports/export
// // @access  Private/Admin
// const exportReport = async (req, res) => {
//   console.log('\n📊 [DEBUG] ========== EXPORT REPORT START ==========');
//   console.log('📊 exportReport function called!');
//   console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
//   console.log('👤 User:', req.user?.email);
  
//   try {
//     const { start, end, type, format = 'excel' } = req.body;
    
//     console.log(`📋 Report type: ${type}, Format: ${format}`);
    
//     // Parse dates
//     const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
//     const endDate = end ? new Date(end) : new Date();
//     console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
//     let data = [];
//     let filename = `${type}_report_${Date.now()}`;
    
//     // Fetch data based on report type
//     switch(type) {
//       case 'overview':
//       case 'revenue':
//         console.log('💰 Fetching revenue data...');
//         const invoices = await Invoice.find({
//           createdAt: { $gte: startDate, $lte: endDate }
//         }).populate('customerId', 'name');
        
//         console.log(`📊 Found ${invoices.length} invoices`);
//         data = invoices.map(inv => ({
//           'Invoice Number': inv.invoiceNumber,
//           'Customer': inv.customerId?.name || 'N/A',
//           'Amount': inv.totalAmount,
//           'Status': inv.status,
//           'Issue Date': inv.issueDate,
//           'Due Date': inv.dueDate
//         }));
//         filename = `revenue_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'complaints':
//         console.log('📋 Fetching complaint data...');
//         const complaints = await Complaint.find({
//           createdAt: { $gte: startDate, $lte: endDate }
//         }).populate('customerId', 'name').populate('assignedTo', 'name');
        
//         console.log(`📊 Found ${complaints.length} complaints`);
//         data = complaints.map(c => ({
//           'Complaint #': c.complaintNumber,
//           'Title': c.title,
//           'Customer': c.customerId?.name || 'N/A',
//           'Priority': c.priority,
//           'Status': c.status,
//           'Assigned To': c.assignedTo?.name || 'Unassigned',
//           'Created': c.createdAt,
//           'Resolved': c.resolution?.resolvedAt || 'Pending'
//         }));
//         filename = `complaints_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'attendance':
//         console.log('👥 Fetching attendance data...');
//         const attendanceRecords = await Attendance.find({
//           date: { $gte: startDate, $lte: endDate }
//         }).populate('userId', 'name email');
        
//         console.log(`📊 Found ${attendanceRecords.length} attendance records`);
//         data = attendanceRecords.map(a => ({
//           'Employee': a.userId?.name || 'N/A',
//           'Email': a.userId?.email || 'N/A',
//           'Date': a.date,
//           'Check In': a.checkIn?.time || '-',
//           'Check Out': a.checkOut?.time || '-',
//           'Hours': a.totalHours || 0,
//           'Status': a.status
//         }));
//         filename = `attendance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'performance':
//         console.log('📈 Fetching performance data...');
//         const tasks = await Task.find({
//           completedAt: { $gte: startDate, $lte: endDate }
//         }).populate('assignedTo', 'name');
        
//         console.log(`📊 Found ${tasks.length} tasks`);
//         const techMap = new Map();
//         tasks.forEach(task => {
//           const techName = task.assignedTo?.name || 'Unknown';
//           if (!techMap.has(techName)) {
//             techMap.set(techName, { completed: 0, rating: 0, count: 0 });
//           }
//           const tech = techMap.get(techName);
//           tech.completed++;
//           if (task.rating) {
//             tech.rating += task.rating;
//             tech.count++;
//           }
//         });
        
//         data = Array.from(techMap.entries()).map(([name, stats]) => ({
//           'Technician': name,
//           'Completed Tasks': stats.completed,
//           'Average Rating': stats.count > 0 ? (stats.rating / stats.count).toFixed(1) : 'N/A'
//         }));
//         filename = `performance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       default:
//         console.log(`⚠️ Unknown report type: ${type}`);
//         data = [{ 'Message': 'No data available for this report type' }];
//     }
    
//     console.log(`📊 Data length for export: ${data.length} rows`);
    
//     if (format === 'excel') {
//       console.log('📊 Generating Excel file...');
//       const ExcelJS = require('exceljs');
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet(reportTypeLabels[type] || 'Report');
      
//       if (data.length > 0) {
//         const headers = Object.keys(data[0]);
//         worksheet.addRow(headers);
        
//         const headerRow = worksheet.getRow(1);
//         headerRow.font = { bold: true };
//         headerRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FF4F46E5' }
//         };
//         headerRow.font = { color: { argb: 'FFFFFFFF' } };
        
//         data.forEach(row => {
//           const rowData = headers.map(header => {
//             const value = row[header];
//             if (value instanceof Date) {
//               return value.toLocaleDateString();
//             }
//             return value;
//           });
//           worksheet.addRow(rowData);
//         });
        
//         worksheet.columns.forEach(column => {
//           let maxLength = 0;
//           column.eachCell({ includeEmpty: true }, cell => {
//             const columnLength = cell.value ? cell.value.toString().length : 10;
//             if (columnLength > maxLength) {
//               maxLength = columnLength;
//             }
//           });
//           column.width = Math.min(maxLength + 2, 50);
//         });
        
//         const buffer = await workbook.xlsx.writeBuffer();
//         console.log(`✅ Excel file generated, size: ${buffer.length} bytes`);
        
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
//         res.send(buffer);
//       } else {
//         console.log('⚠️ No data found for export');
//         res.status(404).json({ success: false, message: 'No data found for export' });
//       }
//     } else if (format === 'pdf') {
//       console.log('📄 Generating PDF file...');
//       const PDFDocument = require('pdfkit');
//       const doc = new PDFDocument({ margin: 50 });
//       const chunks = [];
      
//       doc.on('data', chunk => chunks.push(chunk));
//       doc.on('end', () => {
//         const buffer = Buffer.concat(chunks);
//         console.log(`✅ PDF file generated, size: ${buffer.length} bytes`);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
//         res.send(buffer);
//       });
      
//       // Add title
//       doc.fontSize(20).font('Helvetica-Bold').text(`${type.toUpperCase()} REPORT`, { align: 'center' });
//       doc.moveDown();
//       doc.fontSize(10).font('Helvetica');
//       doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
//       doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
//       doc.moveDown();
//       doc.moveDown();
      
//       // Add summary
//       doc.fontSize(12).font('Helvetica-Bold').text('Summary', { underline: true });
//       doc.moveDown();
//       doc.fontSize(10).font('Helvetica');
//       doc.text(`Total Records: ${data.length}`);
//       doc.moveDown();
      
//       // Add data table
//       if (data.length > 0 && data.length <= 50) {
//         doc.fontSize(10).font('Helvetica-Bold');
//         const headers = Object.keys(data[0]);
//         let yPos = doc.y;
//         let xPos = 50;
        
//         headers.forEach(header => {
//           doc.text(header, xPos, yPos, { width: 100, align: 'left' });
//           xPos += 100;
//         });
        
//         yPos += 20;
//         doc.fontSize(8).font('Helvetica');
        
//         data.slice(0, 30).forEach(row => {
//           xPos = 50;
//           headers.forEach(header => {
//             let value = row[header];
//             if (value instanceof Date) {
//               value = value.toLocaleDateString();
//             }
//             if (typeof value === 'number' && header === 'Amount') {
//               value = `₹${value.toLocaleString()}`;
//             }
//             doc.text(String(value || '-'), xPos, yPos, { width: 100, align: 'left' });
//             xPos += 100;
//           });
//           yPos += 15;
          
//           if (yPos > 700) {
//             doc.addPage();
//             yPos = 50;
//           }
//         });
        
//         if (data.length > 30) {
//           doc.text(`... and ${data.length - 30} more records`, 50, yPos + 10);
//         }
//       } else if (data.length > 50) {
//         doc.text(`Too many records (${data.length}) to display in PDF. Please use Excel export for full data.`, 50, doc.y);
//       }
      
//       doc.end();
//     } else {
//       console.log(`⚠️ Unsupported format: ${format}`);
//       res.status(400).json({ success: false, message: 'Unsupported format' });
//     }
    
//     console.log('✅ [DEBUG] ========== EXPORT REPORT COMPLETE ==========\n');
    
//   } catch (error) {
//     console.error('❌ Export report error:', error);
//     console.error('Error stack:', error.stack);
//     logger.error('Export report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Generate attendance report
// // @route   POST /api/reports/attendance
// // @access  Private/Admin/Manager
// const generateAttendanceReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateAttendanceReport called');
//   try {
//     const { startDate, endDate, buildingId, role } = req.body;

//     const match = {
//       date: {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       }
//     };

//     if (buildingId) {
//       const users = await User.find({ buildingId }).select('_id');
//       match.userId = { $in: users.map(u => u._id) };
//     }

//     const reportData = await Attendance.aggregate([
//       { $match: match },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       { $unwind: '$user' },
//       {
//         $group: {
//           _id: '$user._id',
//           name: { $first: '$user.name' },
//           email: { $first: '$user.email' },
//           role: { $first: '$user.role' },
//           totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
//           totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
//           totalHours: { $sum: '$totalHours' },
//           avgLateMinutes: { $avg: '$lateMinutes' }
//         }
//       }
//     ]);

//     const report = await Report.create({
//       name: `Attendance Report ${startDate} to ${endDate}`,
//       type: 'attendance',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId, role },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate attendance report error:', error);
//     logger.error('Generate attendance report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Generate complaint report
// // @route   POST /api/reports/complaint
// // @access  Private/Admin/Manager
// const generateComplaintReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateComplaintReport called');
//   try {
//     const { startDate, endDate, buildingId, serviceType } = req.body;

//     const match = {
//       createdAt: {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       }
//     };

//     if (buildingId) match.buildingId = buildingId;
//     if (serviceType) match.serviceType = serviceType;

//     const reportData = await Complaint.aggregate([
//       { $match: match },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
//         }
//       }
//     ]);

//     const report = await Report.create({
//       name: `Complaint Report ${startDate} to ${endDate}`,
//       type: 'complaint',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId, serviceType },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate complaint report error:', error);
//     logger.error('Generate complaint report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Generate financial report
// // @route   POST /api/reports/financial
// // @access  Private/Admin
// const generateFinancialReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateFinancialReport called');
//   try {
//     const { startDate, endDate } = req.body;

//     const revenue = await Invoice.aggregate([
//       { $match: { status: 'paid', paidDate: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ]);

//     const pendingInvoices = await Invoice.aggregate([
//       { $match: { status: { $in: ['sent', 'overdue'] }, dueDate: { $lte: new Date(endDate) } } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ]);

//     const reportData = {
//       revenue: revenue[0]?.total || 0,
//       pendingInvoices: pendingInvoices[0]?.total || 0,
//       startDate,
//       endDate
//     };

//     const report = await Report.create({
//       name: `Financial Report ${startDate} to ${endDate}`,
//       type: 'financial',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate financial report error:', error);
//     logger.error('Generate financial report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Generate performance report
// // @route   POST /api/reports/performance
// // @access  Private/Admin/Manager
// const generatePerformanceReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generatePerformanceReport called');
//   try {
//     const { startDate, endDate, buildingId } = req.body;

//     const technicianPerformance = await Task.aggregate([
//       { $match: { completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
//       { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
//       { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'technician' } },
//       { $unwind: '$technician' },
//       { $project: { name: '$technician.name', completedTasks: 1, avgRating: 1 } },
//       { $sort: { completedTasks: -1 } }
//     ]);

//     const report = await Report.create({
//       name: `Performance Report ${startDate} to ${endDate}`,
//       type: 'performance',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId },
//       data: technicianPerformance,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate performance report error:', error);
//     logger.error('Generate performance report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Export to Excel
// // @route   POST /api/reports/export/excel
// // @access  Private/Admin
// const exportToExcel = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] exportToExcel called');
//   try {
//     const { reportId } = req.body;
//     const report = await Report.findById(reportId);

//     if (!report) {
//       return res.status(404).json({ success: false, message: 'Report not found' });
//     }

//     const excelBuffer = await exportExcel(report.data, report.name);

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${report.name}.xlsx`);
//     res.send(excelBuffer);
//   } catch (error) {
//     console.error('❌ Export to Excel error:', error);
//     logger.error('Export to Excel error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Export to PDF
// // @route   POST /api/reports/export/pdf
// // @access  Private/Admin
// const exportToPDF = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] exportToPDF called');
//   try {
//     const { reportId } = req.body;
//     const report = await Report.findById(reportId);

//     if (!report) {
//       return res.status(404).json({ success: false, message: 'Report not found' });
//     }

//     const pdfBuffer = await generatePDF('report', report);

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${report.name}.pdf`);
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('❌ Export to PDF error:', error);
//     logger.error('Export to PDF error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get activity logs
// // @route   GET /api/reports/activity-logs
// // @access  Private/Admin
// const getActivityLogs = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getActivityLogs called');
//   try {
//     const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
//     const query = {};

//     if (userId) query.userId = userId;
//     if (action) query.action = action;
//     if (startDate && endDate) {
//       query.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const logs = await ActivityLog.find(query)
//       .populate('userId', 'name email role')
//       .sort('-createdAt')
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await ActivityLog.countDocuments(query);

//     res.json({
//       success: true,
//       logs,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     console.error('❌ Get activity logs error:', error);
//     logger.error('Get activity logs error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get service history for customer
// // @route   GET /api/reports/service-history
// // @access  Private/Customer
// const getServiceHistory = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getServiceHistory called');
//   try {
//     const history = await Complaint.find({ customerId: req.user._id })
//       .sort('-createdAt')
//       .populate('assignedTo', 'name technicianType')
//       .select('complaintNumber serviceType title status rating createdAt resolution.resolvedAt');

//     res.json({ success: true, history });
//   } catch (error) {
//     console.error('❌ Get service history error:', error);
//     logger.error('Get service history error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get SLA metrics
// // @route   GET /api/reports/sla-metrics
// // @access  Private/Manager
// const getSLAMetrics = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getSLAMetrics called');
//   try {
//     const buildingId = req.user.buildingId;
    
//     const metrics = await Complaint.aggregate([
//       { $match: { buildingId } },
//       {
//         $group: {
//           _id: '$priority',
//           total: { $sum: 1 },
//           breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
//           avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } }
//         }
//       }
//     ]);

//     res.json({ success: true, metrics });
//   } catch (error) {
//     console.error('❌ Get SLA metrics error:', error);
//     logger.error('Get SLA metrics error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Export all functions
// module.exports = {
//   getAnalytics,
//   generateAttendanceReport,
//   generateComplaintReport,
//   generateFinancialReport,
//   generatePerformanceReport,
//   exportToExcel,
//   exportToPDF,
//   exportReport,
//   getActivityLogs,
//   getServiceHistory,
//   getSLAMetrics
// };

// const Report = require('../models/Report.model');
// const ActivityLog = require('../models/ActivityLog.model');
// const Complaint = require('../models/Complaint.model');
// const Attendance = require('../models/Attendance.model');
// const Invoice = require('../models/Invoice.model');
// const Task = require('../models/Task.model');
// const User = require('../models/User.model');
// const Inspection = require('../models/Inspection.model');
// const { exportToExcel: exportExcel } = require('../services/export.service');
// const { generatePDF } = require('../services/pdf.service');
// const { logger } = require('../utils/logger');

// // Debug flag
// const DEBUG = true;

// // Helper object for report titles
// const reportTypeLabels = {
//   overview: 'Overview Report',
//   revenue: 'Revenue Report',
//   complaints: 'Complaints Report',
//   attendance: 'Attendance Report',
//   performance: 'Performance Report'
// };

// // ==================== ANALYTICS FUNCTION ====================
// // @desc    Get analytics data for dashboard
// // @route   GET /api/reports/analytics
// // @access  Private/Admin/Manager
// const getAnalytics = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getAnalytics called');
//   try {
//     const { start, end, type = 'overview' } = req.query;
    
//     const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
//     const endDate = end ? new Date(end) : new Date();
    
//     if (DEBUG) console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
//     const [
//       totalComplaints,
//       resolvedComplaints,
//       pendingComplaints,
//       totalTasks,
//       completedTasks,
//       totalInvoices,
//       paidInvoices,
//       totalRevenue,
//       totalUsers
//     ] = await Promise.all([
//       Complaint.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Complaint.countDocuments({ status: 'resolved', createdAt: { $gte: startDate, $lte: endDate } }),
//       Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] }, createdAt: { $gte: startDate, $lte: endDate } }),
//       Task.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Task.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.countDocuments({ status: 'paid', createdAt: { $gte: startDate, $lte: endDate } }),
//       Invoice.aggregate([
//         { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
//         { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//       ]),
//       User.countDocuments()
//     ]);

//     const monthlyData = await Complaint.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate, $lte: endDate }
//         }
//       },
//       {
//         $group: {
//           _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     const chartLabels = monthlyData.map(d => `${d._id.month}/${d._id.year}`);
//     const chartData = monthlyData.map(d => d.count);

//     res.json({
//       success: true,
//       stats: {
//         totalComplaints,
//         resolvedComplaints,
//         pendingComplaints,
//         totalTasks,
//         completedTasks,
//         totalInvoices,
//         paidInvoices,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         totalUsers,
//         resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0
//       },
//       charts: {
//         labels: chartLabels,
//         data: chartData
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get analytics error:', error);
//     logger.error('Get analytics error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== EXPORT REPORT FUNCTION ====================
// // @desc    Export report (generic) - Generates actual Excel/PDF files
// // @route   POST /api/reports/export
// // @access  Private/Admin
// const exportReport = async (req, res) => {
//   console.log('\n📊 [DEBUG] ========== EXPORT REPORT START ==========');
//   console.log('📊 exportReport function called!');
//   console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
//   console.log('👤 User:', req.user?.email);
  
//   try {
//     const { start, end, type, format = 'excel' } = req.body;
    
//     console.log(`📋 Report type: ${type}, Format: ${format}`);
    
//     const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
//     const endDate = end ? new Date(end) : new Date();
//     console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
//     let data = [];
//     let filename = `${type}_report_${Date.now()}`;
    
//     switch(type) {
//       case 'overview':
//       case 'revenue':
//         console.log('💰 Fetching revenue data...');
//         const invoices = await Invoice.find({
//           createdAt: { $gte: startDate, $lte: endDate }
//         }).populate('customerId', 'name');
        
//         console.log(`📊 Found ${invoices.length} invoices`);
//         data = invoices.map(inv => ({
//           'Invoice Number': inv.invoiceNumber,
//           'Customer': inv.customerId?.name || 'N/A',
//           'Amount': inv.totalAmount,
//           'Status': inv.status,
//           'Issue Date': inv.issueDate,
//           'Due Date': inv.dueDate
//         }));
//         filename = `revenue_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'complaints':
//         console.log('📋 Fetching complaint data...');
//         const complaints = await Complaint.find({
//           createdAt: { $gte: startDate, $lte: endDate }
//         }).populate('customerId', 'name').populate('assignedTo', 'name');
        
//         console.log(`📊 Found ${complaints.length} complaints`);
//         data = complaints.map(c => ({
//           'Complaint #': c.complaintNumber,
//           'Title': c.title,
//           'Customer': c.customerId?.name || 'N/A',
//           'Priority': c.priority,
//           'Status': c.status,
//           'Assigned To': c.assignedTo?.name || 'Unassigned',
//           'Created': c.createdAt,
//           'Resolved': c.resolution?.resolvedAt || 'Pending'
//         }));
//         filename = `complaints_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'attendance':
//         console.log('👥 Fetching attendance data...');
//         const attendanceRecords = await Attendance.find({
//           date: { $gte: startDate, $lte: endDate }
//         }).populate('userId', 'name email');
        
//         console.log(`📊 Found ${attendanceRecords.length} attendance records`);
//         data = attendanceRecords.map(a => ({
//           'Employee': a.userId?.name || 'N/A',
//           'Email': a.userId?.email || 'N/A',
//           'Date': a.date,
//           'Check In': a.checkIn?.time || '-',
//           'Check Out': a.checkOut?.time || '-',
//           'Hours': a.totalHours || 0,
//           'Status': a.status
//         }));
//         filename = `attendance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       case 'performance':
//         console.log('📈 Fetching performance data...');
//         const tasks = await Task.find({
//           completedAt: { $gte: startDate, $lte: endDate }
//         }).populate('assignedTo', 'name');
        
//         console.log(`📊 Found ${tasks.length} tasks`);
//         const techMap = new Map();
//         tasks.forEach(task => {
//           const techName = task.assignedTo?.name || 'Unknown';
//           if (!techMap.has(techName)) {
//             techMap.set(techName, { completed: 0, rating: 0, count: 0 });
//           }
//           const tech = techMap.get(techName);
//           tech.completed++;
//           if (task.rating) {
//             tech.rating += task.rating;
//             tech.count++;
//           }
//         });
        
//         data = Array.from(techMap.entries()).map(([name, stats]) => ({
//           'Technician': name,
//           'Completed Tasks': stats.completed,
//           'Average Rating': stats.count > 0 ? (stats.rating / stats.count).toFixed(1) : 'N/A'
//         }));
//         filename = `performance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
//         break;
        
//       default:
//         console.log(`⚠️ Unknown report type: ${type}`);
//         data = [{ 'Message': 'No data available for this report type' }];
//     }
    
//     console.log(`📊 Data length for export: ${data.length} rows`);
    
//     if (format === 'excel') {
//       console.log('📊 Generating Excel file...');
//       const ExcelJS = require('exceljs');
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet(reportTypeLabels[type] || 'Report');
      
//       if (data.length > 0) {
//         const headers = Object.keys(data[0]);
//         worksheet.addRow(headers);
        
//         const headerRow = worksheet.getRow(1);
//         headerRow.font = { bold: true };
//         headerRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FF4F46E5' }
//         };
//         headerRow.font = { color: { argb: 'FFFFFFFF' } };
        
//         data.forEach(row => {
//           const rowData = headers.map(header => {
//             const value = row[header];
//             if (value instanceof Date) {
//               return value.toLocaleDateString();
//             }
//             return value;
//           });
//           worksheet.addRow(rowData);
//         });
        
//         worksheet.columns.forEach(column => {
//           let maxLength = 0;
//           column.eachCell({ includeEmpty: true }, cell => {
//             const columnLength = cell.value ? cell.value.toString().length : 10;
//             if (columnLength > maxLength) {
//               maxLength = columnLength;
//             }
//           });
//           column.width = Math.min(maxLength + 2, 50);
//         });
        
//         const buffer = await workbook.xlsx.writeBuffer();
//         console.log(`✅ Excel file generated, size: ${buffer.length} bytes`);
        
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
//         res.send(buffer);
//       } else {
//         console.log('⚠️ No data found for export');
//         res.status(404).json({ success: false, message: 'No data found for export' });
//       }
//     } else if (format === 'pdf') {
//       console.log('📄 Generating PDF file...');
//       const PDFDocument = require('pdfkit');
//       const doc = new PDFDocument({ margin: 50 });
//       const chunks = [];
      
//       doc.on('data', chunk => chunks.push(chunk));
//       doc.on('end', () => {
//         const buffer = Buffer.concat(chunks);
//         console.log(`✅ PDF file generated, size: ${buffer.length} bytes`);
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
//         res.send(buffer);
//       });
      
//       doc.fontSize(20).font('Helvetica-Bold').text(`${type.toUpperCase()} REPORT`, { align: 'center' });
//       doc.moveDown();
//       doc.fontSize(10).font('Helvetica');
//       doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
//       doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
//       doc.moveDown();
//       doc.moveDown();
      
//       doc.fontSize(12).font('Helvetica-Bold').text('Summary', { underline: true });
//       doc.moveDown();
//       doc.fontSize(10).font('Helvetica');
//       doc.text(`Total Records: ${data.length}`);
//       doc.moveDown();
      
//       if (data.length > 0 && data.length <= 50) {
//         doc.fontSize(10).font('Helvetica-Bold');
//         const headers = Object.keys(data[0]);
//         let yPos = doc.y;
//         let xPos = 50;
        
//         headers.forEach(header => {
//           doc.text(header, xPos, yPos, { width: 100, align: 'left' });
//           xPos += 100;
//         });
        
//         yPos += 20;
//         doc.fontSize(8).font('Helvetica');
        
//         data.slice(0, 30).forEach(row => {
//           xPos = 50;
//           headers.forEach(header => {
//             let value = row[header];
//             if (value instanceof Date) {
//               value = value.toLocaleDateString();
//             }
//             if (typeof value === 'number' && header === 'Amount') {
//               value = `₹${value.toLocaleString()}`;
//             }
//             doc.text(String(value || '-'), xPos, yPos, { width: 100, align: 'left' });
//             xPos += 100;
//           });
//           yPos += 15;
          
//           if (yPos > 700) {
//             doc.addPage();
//             yPos = 50;
//           }
//         });
        
//         if (data.length > 30) {
//           doc.text(`... and ${data.length - 30} more records`, 50, yPos + 10);
//         }
//       } else if (data.length > 50) {
//         doc.text(`Too many records (${data.length}) to display in PDF. Please use Excel export for full data.`, 50, doc.y);
//       }
      
//       doc.end();
//     } else {
//       console.log(`⚠️ Unsupported format: ${format}`);
//       res.status(400).json({ success: false, message: 'Unsupported format' });
//     }
    
//     console.log('✅ [DEBUG] ========== EXPORT REPORT COMPLETE ==========\n');
    
//   } catch (error) {
//     console.error('❌ Export report error:', error);
//     console.error('Error stack:', error.stack);
//     logger.error('Export report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== ATTENDANCE REPORT ====================
// const generateAttendanceReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateAttendanceReport called');
//   try {
//     const { startDate, endDate, buildingId, role } = req.body;

//     const match = {
//       date: {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       }
//     };

//     if (buildingId) {
//       const users = await User.find({ buildingId }).select('_id');
//       match.userId = { $in: users.map(u => u._id) };
//     }

//     const reportData = await Attendance.aggregate([
//       { $match: match },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       { $unwind: '$user' },
//       {
//         $group: {
//           _id: '$user._id',
//           name: { $first: '$user.name' },
//           email: { $first: '$user.email' },
//           role: { $first: '$user.role' },
//           totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
//           totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
//           totalHours: { $sum: '$totalHours' },
//           avgLateMinutes: { $avg: '$lateMinutes' }
//         }
//       }
//     ]);

//     const report = await Report.create({
//       name: `Attendance Report ${startDate} to ${endDate}`,
//       type: 'attendance',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId, role },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate attendance report error:', error);
//     logger.error('Generate attendance report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== COMPLAINT REPORT ====================
// const generateComplaintReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateComplaintReport called');
//   try {
//     const { startDate, endDate, buildingId, serviceType } = req.body;

//     const match = {
//       createdAt: {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       }
//     };

//     if (buildingId) match.buildingId = buildingId;
//     if (serviceType) match.serviceType = serviceType;

//     const reportData = await Complaint.aggregate([
//       { $match: match },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
//         }
//       }
//     ]);

//     const report = await Report.create({
//       name: `Complaint Report ${startDate} to ${endDate}`,
//       type: 'complaint',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId, serviceType },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate complaint report error:', error);
//     logger.error('Generate complaint report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== FINANCIAL REPORT ====================
// const generateFinancialReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generateFinancialReport called');
//   try {
//     const { startDate, endDate } = req.body;

//     const revenue = await Invoice.aggregate([
//       { $match: { status: 'paid', paidDate: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ]);

//     const pendingInvoices = await Invoice.aggregate([
//       { $match: { status: { $in: ['sent', 'overdue'] }, dueDate: { $lte: new Date(endDate) } } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ]);

//     const reportData = {
//       revenue: revenue[0]?.total || 0,
//       pendingInvoices: pendingInvoices[0]?.total || 0,
//       startDate,
//       endDate
//     };

//     const report = await Report.create({
//       name: `Financial Report ${startDate} to ${endDate}`,
//       type: 'financial',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate },
//       data: reportData,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate financial report error:', error);
//     logger.error('Generate financial report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== PERFORMANCE REPORT ====================
// const generatePerformanceReport = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] generatePerformanceReport called');
//   try {
//     const { startDate, endDate, buildingId } = req.body;

//     const technicianPerformance = await Task.aggregate([
//       { $match: { completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
//       { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
//       { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'technician' } },
//       { $unwind: '$technician' },
//       { $project: { name: '$technician.name', completedTasks: 1, avgRating: 1 } },
//       { $sort: { completedTasks: -1 } }
//     ]);

//     const report = await Report.create({
//       name: `Performance Report ${startDate} to ${endDate}`,
//       type: 'performance',
//       generatedBy: req.user._id,
//       parameters: { startDate, endDate, buildingId },
//       data: technicianPerformance,
//       status: 'completed',
//       completedAt: new Date()
//     });

//     res.json({ success: true, report });
//   } catch (error) {
//     console.error('❌ Generate performance report error:', error);
//     logger.error('Generate performance report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== EXPORT TO EXCEL ====================
// const exportToExcel = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] exportToExcel called');
//   try {
//     const { reportId } = req.body;
//     const report = await Report.findById(reportId);

//     if (!report) {
//       return res.status(404).json({ success: false, message: 'Report not found' });
//     }

//     const excelBuffer = await exportExcel(report.data, report.name);

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${report.name}.xlsx`);
//     res.send(excelBuffer);
//   } catch (error) {
//     console.error('❌ Export to Excel error:', error);
//     logger.error('Export to Excel error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== EXPORT TO PDF ====================
// const exportToPDF = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] exportToPDF called');
//   try {
//     const { reportId } = req.body;
//     const report = await Report.findById(reportId);

//     if (!report) {
//       return res.status(404).json({ success: false, message: 'Report not found' });
//     }

//     const pdfBuffer = await generatePDF('report', report);

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${report.name}.pdf`);
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('❌ Export to PDF error:', error);
//     logger.error('Export to PDF error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== ACTIVITY LOGS ====================
// const getActivityLogs = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getActivityLogs called');
//   try {
//     const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
//     const query = {};

//     if (userId) query.userId = userId;
//     if (action) query.action = action;
//     if (startDate && endDate) {
//       query.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const logs = await ActivityLog.find(query)
//       .populate('userId', 'name email role')
//       .sort('-createdAt')
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await ActivityLog.countDocuments(query);

//     res.json({
//       success: true,
//       logs,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     console.error('❌ Get activity logs error:', error);
//     logger.error('Get activity logs error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== SERVICE HISTORY ====================
// const getServiceHistory = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getServiceHistory called');
//   try {
//     const history = await Complaint.find({ customerId: req.user._id })
//       .sort('-createdAt')
//       .populate('assignedTo', 'name technicianType')
//       .select('complaintNumber serviceType title status rating createdAt resolution.resolvedAt');

//     res.json({ success: true, history });
//   } catch (error) {
//     console.error('❌ Get service history error:', error);
//     logger.error('Get service history error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== SLA METRICS ====================
// const getSLAMetrics = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getSLAMetrics called');
//   try {
//     const buildingId = req.user.buildingId;
    
//     const metrics = await Complaint.aggregate([
//       { $match: { buildingId } },
//       {
//         $group: {
//           _id: '$priority',
//           total: { $sum: 1 },
//           breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
//           avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } }
//         }
//       }
//     ]);

//     res.json({ success: true, metrics });
//   } catch (error) {
//     console.error('❌ Get SLA metrics error:', error);
//     logger.error('Get SLA metrics error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== INSPECTION FUNCTIONS ====================
// const getInspections = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getInspections called');
//   try {
//     const { buildingId, status, startDate, endDate } = req.query;
//     const query = {};
    
//     if (buildingId) query.buildingId = buildingId;
//     if (status) query.status = status;
//     if (startDate && endDate) {
//       query.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }
    
//     if (req.user.role === 'supervisor') {
//       query.createdBy = req.user._id;
//     }
    
//     const inspections = await Inspection.find(query)
//       .populate('createdBy', 'name email')
//       .populate('buildingId', 'name code')
//       .sort('-createdAt');
    
//     res.json({ success: true, inspections });
//   } catch (error) {
//     console.error('❌ Get inspections error:', error);
//     logger.error('Get inspections error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const createInspection = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] createInspection called');
//   try {
//     const { buildingId, area, findings, status, photos, recommendations } = req.body;
    
//     const inspection = await Inspection.create({
//       inspectionNumber: `INS-${Date.now()}`,
//       buildingId,
//       area,
//       findings,
//       status: status || 'pending',
//       photos: photos || [],
//       recommendations,
//       createdBy: req.user._id
//     });
    
//     await inspection.populate('createdBy', 'name email');
//     await inspection.populate('buildingId', 'name code');
    
//     res.status(201).json({ success: true, inspection });
//   } catch (error) {
//     console.error('❌ Create inspection error:', error);
//     logger.error('Create inspection error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getInspection = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] getInspection called');
//   try {
//     const inspection = await Inspection.findById(req.params.id)
//       .populate('createdBy', 'name email')
//       .populate('buildingId', 'name code');
    
//     if (!inspection) {
//       return res.status(404).json({ success: false, message: 'Inspection not found' });
//     }
    
//     res.json({ success: true, inspection });
//   } catch (error) {
//     console.error('❌ Get inspection error:', error);
//     logger.error('Get inspection error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const updateInspection = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] updateInspection called');
//   try {
//     const inspection = await Inspection.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
    
//     if (!inspection) {
//       return res.status(404).json({ success: false, message: 'Inspection not found' });
//     }
    
//     res.json({ success: true, inspection });
//   } catch (error) {
//     console.error('❌ Update inspection error:', error);
//     logger.error('Update inspection error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const deleteInspection = async (req, res) => {
//   if (DEBUG) console.log('🔍 [DEBUG] deleteInspection called');
//   try {
//     const inspection = await Inspection.findById(req.params.id);
//     if (!inspection) {
//       return res.status(404).json({ success: false, message: 'Inspection not found' });
//     }
    
//     await inspection.deleteOne();
//     res.json({ success: true, message: 'Inspection deleted successfully' });
//   } catch (error) {
//     console.error('❌ Delete inspection error:', error);
//     logger.error('Delete inspection error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== MODULE EXPORTS ====================
// module.exports = {
//   getAnalytics,
//   generateAttendanceReport,
//   generateComplaintReport,
//   generateFinancialReport,
//   generatePerformanceReport,
//   exportToExcel,
//   exportToPDF,
//   exportReport,
//   getActivityLogs,
//   getServiceHistory,
//   getSLAMetrics,
//   getInspections,
//   createInspection,
//   getInspection,
//   updateInspection,
//   deleteInspection
// };


const Report = require('../models/Report.model');
const ActivityLog = require('../models/ActivityLog.model');
const Complaint = require('../models/Complaint.model');
const Attendance = require('../models/Attendance.model');
const Invoice = require('../models/Invoice.model');
const Task = require('../models/Task.model');
const User = require('../models/User.model');
const Inspection = require('../models/Inspection.model');
const { exportToExcel: exportExcel } = require('../services/export.service');
const { generatePDF } = require('../services/pdf.service');
const { logger } = require('../utils/logger');

// Debug flag
const DEBUG = true;

// Helper object for report titles
const reportTypeLabels = {
  overview: 'Overview Report',
  revenue: 'Revenue Report',
  complaints: 'Complaints Report',
  attendance: 'Attendance Report',
  performance: 'Performance Report'
};

// ==================== ANALYTICS FUNCTION ====================
// @desc    Get analytics data for dashboard
// @route   GET /api/reports/analytics
// @access  Private/Admin/Manager
const getAnalytics = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getAnalytics called');
  try {
    const { start, end, type = 'overview' } = req.query;
    
    const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
    const endDate = end ? new Date(end) : new Date();
    
    if (DEBUG) console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    const [
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      totalTasks,
      completedTasks,
      totalInvoices,
      paidInvoices,
      totalRevenue,
      totalUsers
    ] = await Promise.all([
      Complaint.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Complaint.countDocuments({ status: 'resolved', createdAt: { $gte: startDate, $lte: endDate } }),
      Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] }, createdAt: { $gte: startDate, $lte: endDate } }),
      Task.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Task.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
      Invoice.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Invoice.countDocuments({ status: 'paid', createdAt: { $gte: startDate, $lte: endDate } }),
      Invoice.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments()
    ]);

    const monthlyData = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const chartLabels = monthlyData.map(d => `${d._id.month}/${d._id.year}`);
    const chartData = monthlyData.map(d => d.count);

    res.json({
      success: true,
      stats: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        totalTasks,
        completedTasks,
        totalInvoices,
        paidInvoices,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0
      },
      charts: {
        labels: chartLabels,
        data: chartData
      }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    logger.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORT REPORT FUNCTION ====================
// @desc    Export report (generic) - Generates actual Excel/PDF files
// @route   POST /api/reports/export
// @access  Private/Admin
const exportReport = async (req, res) => {
  console.log('\n📊 [DEBUG] ========== EXPORT REPORT START ==========');
  console.log('📊 exportReport function called!');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User:', req.user?.email);
  
  try {
    const { start, end, type, format = 'excel' } = req.body;
    
    console.log(`📋 Report type: ${type}, Format: ${format}`);
    
    const startDate = start ? new Date(start) : new Date(new Date().setDate(1));
    const endDate = end ? new Date(end) : new Date();
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    let data = [];
    let filename = `${type}_report_${Date.now()}`;
    
    switch(type) {
      case 'overview':
      case 'revenue':
        console.log('💰 Fetching revenue data...');
        const invoices = await Invoice.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).populate('customerId', 'name');
        
        console.log(`📊 Found ${invoices.length} invoices`);
        data = invoices.map(inv => ({
          'Invoice Number': inv.invoiceNumber,
          'Customer': inv.customerId?.name || 'N/A',
          'Amount': inv.totalAmount,
          'Status': inv.status,
          'Issue Date': inv.issueDate,
          'Due Date': inv.dueDate
        }));
        filename = `revenue_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
        break;
        
      case 'complaints':
        console.log('📋 Fetching complaint data...');
        const complaints = await Complaint.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).populate('customerId', 'name').populate('assignedTo', 'name');
        
        console.log(`📊 Found ${complaints.length} complaints`);
        data = complaints.map(c => ({
          'Complaint #': c.complaintNumber,
          'Title': c.title,
          'Customer': c.customerId?.name || 'N/A',
          'Priority': c.priority,
          'Status': c.status,
          'Assigned To': c.assignedTo?.name || 'Unassigned',
          'Created': c.createdAt,
          'Resolved': c.resolution?.resolvedAt || 'Pending'
        }));
        filename = `complaints_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
        break;
        
      case 'attendance':
        console.log('👥 Fetching attendance data...');
        const attendanceRecords = await Attendance.find({
          date: { $gte: startDate, $lte: endDate }
        }).populate('userId', 'name email');
        
        console.log(`📊 Found ${attendanceRecords.length} attendance records`);
        data = attendanceRecords.map(a => ({
          'Employee': a.userId?.name || 'N/A',
          'Email': a.userId?.email || 'N/A',
          'Date': a.date,
          'Check In': a.checkIn?.time || '-',
          'Check Out': a.checkOut?.time || '-',
          'Hours': a.totalHours || 0,
          'Status': a.status
        }));
        filename = `attendance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
        break;
        
      case 'performance':
        console.log('📈 Fetching performance data...');
        const tasks = await Task.find({
          completedAt: { $gte: startDate, $lte: endDate }
        }).populate('assignedTo', 'name');
        
        console.log(`📊 Found ${tasks.length} tasks`);
        const techMap = new Map();
        tasks.forEach(task => {
          const techName = task.assignedTo?.name || 'Unknown';
          if (!techMap.has(techName)) {
            techMap.set(techName, { completed: 0, rating: 0, count: 0 });
          }
          const tech = techMap.get(techName);
          tech.completed++;
          if (task.rating) {
            tech.rating += task.rating;
            tech.count++;
          }
        });
        
        data = Array.from(techMap.entries()).map(([name, stats]) => ({
          'Technician': name,
          'Completed Tasks': stats.completed,
          'Average Rating': stats.count > 0 ? (stats.rating / stats.count).toFixed(1) : 'N/A'
        }));
        filename = `performance_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
        break;
        
      default:
        console.log(`⚠️ Unknown report type: ${type}`);
        data = [{ 'Message': 'No data available for this report type' }];
    }
    
    console.log(`📊 Data length for export: ${data.length} rows`);
    
    if (format === 'excel') {
      console.log('📊 Generating Excel file...');
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(reportTypeLabels[type] || 'Report');
      
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);
        
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        headerRow.font = { color: { argb: 'FFFFFFFF' } };
        
        data.forEach(row => {
          const rowData = headers.map(header => {
            const value = row[header];
            if (value instanceof Date) {
              return value.toLocaleDateString();
            }
            return value;
          });
          worksheet.addRow(rowData);
        });
        
        worksheet.columns.forEach(column => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        console.log(`✅ Excel file generated, size: ${buffer.length} bytes`);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        res.send(buffer);
      } else {
        console.log('⚠️ No data found for export');
        res.status(404).json({ success: false, message: 'No data found for export' });
      }
    } else if (format === 'pdf') {
      console.log('📄 Generating PDF file...');
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`✅ PDF file generated, size: ${buffer.length} bytes`);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        res.send(buffer);
      });
      
      doc.fontSize(20).font('Helvetica-Bold').text(`${type.toUpperCase()} REPORT`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();
      doc.moveDown();
      
      doc.fontSize(12).font('Helvetica-Bold').text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Records: ${data.length}`);
      doc.moveDown();
      
      if (data.length > 0 && data.length <= 50) {
        doc.fontSize(10).font('Helvetica-Bold');
        const headers = Object.keys(data[0]);
        let yPos = doc.y;
        let xPos = 50;
        
        headers.forEach(header => {
          doc.text(header, xPos, yPos, { width: 100, align: 'left' });
          xPos += 100;
        });
        
        yPos += 20;
        doc.fontSize(8).font('Helvetica');
        
        data.slice(0, 30).forEach(row => {
          xPos = 50;
          headers.forEach(header => {
            let value = row[header];
            if (value instanceof Date) {
              value = value.toLocaleDateString();
            }
            if (typeof value === 'number' && header === 'Amount') {
              value = `₹${value.toLocaleString()}`;
            }
            doc.text(String(value || '-'), xPos, yPos, { width: 100, align: 'left' });
            xPos += 100;
          });
          yPos += 15;
          
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
        });
        
        if (data.length > 30) {
          doc.text(`... and ${data.length - 30} more records`, 50, yPos + 10);
        }
      } else if (data.length > 50) {
        doc.text(`Too many records (${data.length}) to display in PDF. Please use Excel export for full data.`, 50, doc.y);
      }
      
      doc.end();
    } else {
      console.log(`⚠️ Unsupported format: ${format}`);
      res.status(400).json({ success: false, message: 'Unsupported format' });
    }
    
    console.log('✅ [DEBUG] ========== EXPORT REPORT COMPLETE ==========\n');
    
  } catch (error) {
    console.error('❌ Export report error:', error);
    console.error('Error stack:', error.stack);
    logger.error('Export report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ATTENDANCE REPORT ====================
const generateAttendanceReport = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] generateAttendanceReport called');
  try {
    const { startDate, endDate, buildingId, role } = req.body;

    const match = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (buildingId) {
      const users = await User.find({ buildingId }).select('_id');
      match.userId = { $in: users.map(u => u._id) };
    }

    const reportData = await Attendance.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user._id',
          name: { $first: '$user.name' },
          email: { $first: '$user.email' },
          role: { $first: '$user.role' },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' },
          avgLateMinutes: { $avg: '$lateMinutes' }
        }
      }
    ]);

    const report = await Report.create({
      name: `Attendance Report ${startDate} to ${endDate}`,
      type: 'attendance',
      generatedBy: req.user._id,
      parameters: { startDate, endDate, buildingId, role },
      data: reportData,
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('❌ Generate attendance report error:', error);
    logger.error('Generate attendance report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COMPLAINT REPORT ====================
const generateComplaintReport = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] generateComplaintReport called');
  try {
    const { startDate, endDate, buildingId, serviceType } = req.body;

    const match = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (buildingId) match.buildingId = buildingId;
    if (serviceType) match.serviceType = serviceType;

    const reportData = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
        }
      }
    ]);

    const report = await Report.create({
      name: `Complaint Report ${startDate} to ${endDate}`,
      type: 'complaint',
      generatedBy: req.user._id,
      parameters: { startDate, endDate, buildingId, serviceType },
      data: reportData,
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('❌ Generate complaint report error:', error);
    logger.error('Generate complaint report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FINANCIAL REPORT ====================
const generateFinancialReport = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] generateFinancialReport called');
  try {
    const { startDate, endDate } = req.body;

    const revenue = await Invoice.aggregate([
      { $match: { status: 'paid', paidDate: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingInvoices = await Invoice.aggregate([
      { $match: { status: { $in: ['sent', 'overdue'] }, dueDate: { $lte: new Date(endDate) } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const reportData = {
      revenue: revenue[0]?.total || 0,
      pendingInvoices: pendingInvoices[0]?.total || 0,
      startDate,
      endDate
    };

    const report = await Report.create({
      name: `Financial Report ${startDate} to ${endDate}`,
      type: 'financial',
      generatedBy: req.user._id,
      parameters: { startDate, endDate },
      data: reportData,
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('❌ Generate financial report error:', error);
    logger.error('Generate financial report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PERFORMANCE REPORT ====================
// ⬇️⬇️⬇️ FIXED: Updated to handle errors gracefully and return empty array ⬇️⬇️⬇️
// @desc    Generate performance report
// @route   POST /api/reports/performance
// @access  Private/Admin/Manager/Supervisor
const generatePerformanceReport = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] generatePerformanceReport called');
  try {
    const { startDate, endDate, buildingId } = req.body;
    
    // Build match condition
    const match = {};
    if (startDate && endDate) {
      match.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (buildingId) match.buildingId = buildingId;
    
    // If no date range provided, use last 30 days
    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      match.completedAt = { $gte: thirtyDaysAgo };
    }
    
    console.log('📊 Performance report match conditions:', JSON.stringify(match));
    
    // Get technician performance data
    const technicianPerformance = await Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$assignedTo',
          completedTasks: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'technician'
        }
      },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$technician.name', 'Unknown'] },
          role: { $ifNull: ['$technician.role', 'technician'] },
          completedTasks: 1,
          avgRating: { $round: [{ $ifNull: ['$avgRating', 0] }, 1] }
        }
      },
      { $sort: { completedTasks: -1 } },
      { $limit: 20 }
    ]);
    
    // Return empty array if no data found
    const result = technicianPerformance.length > 0 ? technicianPerformance : [];
    
    console.log(`📊 Performance report found ${result.length} technicians with data`);
    
    res.json({ success: true, performance: result });
  } catch (error) {
    console.error('❌ Generate performance report error:', error);
    console.error('Error details:', error.message);
    logger.error('Generate performance report error:', error);
    // Return empty array instead of error to prevent frontend crash
    res.json({ success: true, performance: [] });
  }
};

// ==================== EXPORT TO EXCEL ====================
const exportToExcel = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] exportToExcel called');
  try {
    const { reportId } = req.body;
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const excelBuffer = await exportExcel(report.data, report.name);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${report.name}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('❌ Export to Excel error:', error);
    logger.error('Export to Excel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORT TO PDF ====================
const exportToPDF = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] exportToPDF called');
  try {
    const { reportId } = req.body;
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const pdfBuffer = await generatePDF('report', report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report.name}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Export to PDF error:', error);
    logger.error('Export to PDF error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ACTIVITY LOGS ====================
const getActivityLogs = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getActivityLogs called');
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Get activity logs error:', error);
    logger.error('Get activity logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SERVICE HISTORY ====================
const getServiceHistory = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getServiceHistory called');
  try {
    const history = await Complaint.find({ customerId: req.user._id })
      .sort('-createdAt')
      .populate('assignedTo', 'name technicianType')
      .select('complaintNumber serviceType title status rating createdAt resolution.resolvedAt');

    res.json({ success: true, history });
  } catch (error) {
    console.error('❌ Get service history error:', error);
    logger.error('Get service history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SLA METRICS ====================
const getSLAMetrics = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getSLAMetrics called');
  try {
    const buildingId = req.user.buildingId;
    
    const metrics = await Complaint.aggregate([
      { $match: { buildingId } },
      {
        $group: {
          _id: '$priority',
          total: { $sum: 1 },
          breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
          avgResponseTime: { $avg: { $subtract: ['$assignedAt', '$createdAt'] } }
        }
      }
    ]);

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('❌ Get SLA metrics error:', error);
    logger.error('Get SLA metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== INSPECTION FUNCTIONS ====================
const getInspections = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getInspections called');
  try {
    const { buildingId, status, startDate, endDate } = req.query;
    const query = {};
    
    if (buildingId) query.buildingId = buildingId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (req.user.role === 'supervisor') {
      query.createdBy = req.user._id;
    }
    
    const inspections = await Inspection.find(query)
      .populate('createdBy', 'name email')
      .populate('buildingId', 'name code')
      .sort('-createdAt');
    
    res.json({ success: true, inspections });
  } catch (error) {
    console.error('❌ Get inspections error:', error);
    logger.error('Get inspections error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInspection = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] createInspection called');
  try {
    const { buildingId, area, findings, status, photos, recommendations } = req.body;
    
    const inspection = await Inspection.create({
      inspectionNumber: `INS-${Date.now()}`,
      buildingId,
      area,
      findings,
      status: status || 'pending',
      photos: photos || [],
      recommendations,
      createdBy: req.user._id
    });
    
    await inspection.populate('createdBy', 'name email');
    await inspection.populate('buildingId', 'name code');
    
    res.status(201).json({ success: true, inspection });
  } catch (error) {
    console.error('❌ Create inspection error:', error);
    logger.error('Create inspection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInspection = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] getInspection called');
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('buildingId', 'name code');
    
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    
    res.json({ success: true, inspection });
  } catch (error) {
    console.error('❌ Get inspection error:', error);
    logger.error('Get inspection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInspection = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] updateInspection called');
  try {
    const inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    
    res.json({ success: true, inspection });
  } catch (error) {
    console.error('❌ Update inspection error:', error);
    logger.error('Update inspection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteInspection = async (req, res) => {
  if (DEBUG) console.log('🔍 [DEBUG] deleteInspection called');
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    
    await inspection.deleteOne();
    res.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('❌ Delete inspection error:', error);
    logger.error('Delete inspection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MODULE EXPORTS ====================
module.exports = {
  getAnalytics,
  generateAttendanceReport,
  generateComplaintReport,
  generateFinancialReport,
  generatePerformanceReport,
  exportToExcel,
  exportToPDF,
  exportReport,
  getActivityLogs,
  getServiceHistory,
  getSLAMetrics,
  getInspections,
  createInspection,
  getInspection,
  updateInspection,
  deleteInspection
};