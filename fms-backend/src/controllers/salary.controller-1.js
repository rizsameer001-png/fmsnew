const Salary = require('../models/Salary.model');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { logger } = require('../utils/logger');

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate salary based on attendance for a specific month
 */
const calculateSalaryFromAttendance = async (userId, month, year, salaryData) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const attendance = await Attendance.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  const totalWorkingDays = new Date(year, month, 0).getDate();
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const absentDays = totalWorkingDays - attendance.length;
  const leaveDays = attendance.filter(a => a.status === 'leave').length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  
  // Calculate salary based on present days
  const dailyRate = salaryData.basicSalary / totalWorkingDays;
  const attendanceDeduction = dailyRate * absentDays;
  
  const allowancesTotal = Object.values(salaryData.allowances || { hra: 0, da: 0, ta: 0, medical: 0, other: 0 }).reduce((a, b) => a + b, 0);
  const deductionsTotal = Object.values(salaryData.deductions || { pf: 0, pt: 0, tds: 0, loan: 0, other: 0 }).reduce((a, b) => a + b, 0);
  
  const grossSalary = salaryData.basicSalary + allowancesTotal + (salaryData.bonus || 0) + (salaryData.incentives || 0);
  const netSalary = grossSalary - deductionsTotal - attendanceDeduction;
  
  return {
    attendanceDetails: {
      totalWorkingDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      totalHours,
      attendanceDeduction
    },
    grossSalary,
    totalDeductions: deductionsTotal + attendanceDeduction,
    netSalary: Math.max(0, netSalary)
  };
};

// ==================== GENERATE SALARY ====================
/**
 * @desc    Generate salary for a specific employee
 * @route   POST /api/salaries/generate
 * @access  Private (Admin/Manager)
 */
const generateSalary = async (req, res) => {
  try {
    const { userId, month, year, basicSalary, allowances, deductions, bonus, incentives } = req.body;
    
    // Validate required fields
    if (!userId || !month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, month, year' 
      });
    }
    
    // Check if salary already exists
    const existingSalary = await Salary.findOne({ userId, month, year });
    if (existingSalary) {
      return res.status(400).json({ 
        success: false, 
        message: 'Salary already generated for this month',
        salary: existingSalary
      });
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prepare salary data
    const salaryData = {
      userId,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      buildingId: user.buildingId,
      month,
      year,
      basicSalary: basicSalary || 0,
      allowances: allowances || { hra: 0, da: 0, ta: 0, medical: 0, other: 0 },
      deductions: deductions || { pf: 0, pt: 0, tds: 0, loan: 0, other: 0 },
      bonus: bonus || 0,
      incentives: incentives || 0,
      generatedBy: req.user._id,
      status: 'calculated'
    };
    
    // Calculate based on attendance
    const calculated = await calculateSalaryFromAttendance(userId, month, year, salaryData);
    
    salaryData.attendanceDetails = calculated.attendanceDetails;
    salaryData.grossSalary = calculated.grossSalary;
    salaryData.totalDeductions = calculated.totalDeductions;
    salaryData.netSalary = calculated.netSalary;
    
    const salary = await Salary.create(salaryData);
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'GENERATE_SALARY',
      entityType: 'salary',
      entityId: salary._id,
      newData: { userId, month, year, netSalary: salary.netSalary },
      ipAddress: req.ip
    });
    
    res.status(201).json({ 
      success: true, 
      salary,
      message: `Salary generated for ${user.name} for ${month}/${year}`
    });
  } catch (error) {
    logger.error('Generate salary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BULK GENERATE SALARY ====================
/**
 * @desc    Bulk generate salaries for all employees
 * @route   POST /api/salaries/bulk-generate
 * @access  Private (Admin only)
 */
const bulkGenerateSalary = async (req, res) => {
  try {
    const { month, year, role, buildingId, basicSalaryConfig } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: month, year' 
      });
    }
    
    // Build user filter
    let userFilter = { isActive: true };
    if (role && role !== 'all') userFilter.role = role;
    if (buildingId && buildingId !== 'all') userFilter.buildingId = buildingId;
    if (req.user.role === 'manager') {
      userFilter.buildingId = req.user.buildingId;
    }
    
    // Exclude customers from salary generation
    userFilter.role = { $in: ['super_admin', 'manager', 'supervisor', 'technician'] };
    
    const users = await User.find(userFilter);
    const results = [];
    
    for (const user of users) {
      // Check if salary already exists
      const existingSalary = await Salary.findOne({ userId: user._id, month, year });
      if (existingSalary) {
        results.push({ user: user.name, status: 'skipped', reason: 'Already exists' });
        continue;
      }
      
      // Get default basic salary based on role
      let defaultBasicSalary = 25000;
      if (basicSalaryConfig && basicSalaryConfig[user.role]) {
        defaultBasicSalary = basicSalaryConfig[user.role];
      } else {
        // Default salaries by role
        const roleSalaries = {
          super_admin: 80000,
          manager: 50000,
          supervisor: 35000,
          technician: 25000
        };
        defaultBasicSalary = roleSalaries[user.role] || 25000;
      }
      
      const salaryData = {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        buildingId: user.buildingId,
        month,
        year,
        basicSalary: defaultBasicSalary,
        allowances: { hra: defaultBasicSalary * 0.4, da: defaultBasicSalary * 0.2, ta: 2000, medical: 1500, other: 0 },
        deductions: { pf: defaultBasicSalary * 0.12, pt: 200, tds: 0, loan: 0, other: 0 },
        generatedBy: req.user._id,
        status: 'calculated'
      };
      
      // Calculate based on attendance
      const calculated = await calculateSalaryFromAttendance(user._id, month, year, salaryData);
      salaryData.attendanceDetails = calculated.attendanceDetails;
      salaryData.grossSalary = calculated.grossSalary;
      salaryData.totalDeductions = calculated.totalDeductions;
      salaryData.netSalary = calculated.netSalary;
      
      const salary = await Salary.create(salaryData);
      results.push({ 
        user: user.name, 
        role: user.role,
        status: 'created', 
        netSalary: salary.netSalary 
      });
    }
    
    res.json({
      success: true,
      message: `Generated ${results.filter(r => r.status === 'created').length} salaries`,
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results
    });
  } catch (error) {
    logger.error('Bulk generate salary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ALL SALARIES ====================
/**
 * @desc    Get all salaries with filters
 * @route   GET /api/salaries
 * @access  Private (Admin/Manager)
 */
const getSalaries = async (req, res) => {
  try {
    const { year, month, role, buildingId, status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    if (status) query.status = status;
    
    // Filter by user role/building
    let userFilter = {};
    if (role && role !== 'all') userFilter.role = role;
    if (buildingId && buildingId !== 'all') userFilter.buildingId = buildingId;
    
    if (req.user.role === 'manager') {
      userFilter.buildingId = req.user.buildingId;
    }
    
    // If user filter has conditions, get user IDs
    if (Object.keys(userFilter).length > 0) {
      const users = await User.find(userFilter).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }
    
    const salaries = await Salary.find(query)
      .populate('userId', 'name email role buildingId')
      .populate('generatedBy', 'name')
      .populate('approvedBy', 'name')
      .sort('-year -month')
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Salary.countDocuments(query);
    
    // Get summary statistics
    const summary = await Salary.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          count: { $sum: 1 },
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$netSalary', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'calculated'] }, '$netSalary', 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      salaries,
      summary: summary[0] || { 
        totalGrossSalary: 0, 
        totalNetSalary: 0, 
        totalDeductions: 0, 
        count: 0,
        totalPaid: 0,
        totalPending: 0
      },
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('Get salaries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MY SALARY ====================
/**
 * @desc    Get logged in user's salary history
 * @route   GET /api/salaries/my
 * @access  Private
 */
const getMySalary = async (req, res) => {
  try {
    const { year } = req.query;
    let query = { userId: req.user._id };
    if (year) query.year = parseInt(year);
    
    const salaries = await Salary.find(query).sort('-year -month');
    
    // Get summary for the year
    const summary = {
      totalEarned: salaries.reduce((sum, s) => sum + (s.status === 'paid' ? s.netSalary : 0), 0),
      totalDeductions: salaries.reduce((sum, s) => sum + s.totalDeductions, 0),
      monthsCount: salaries.length,
      averageSalary: salaries.length > 0 ? salaries.reduce((sum, s) => sum + s.netSalary, 0) / salaries.length : 0
    };
    
    res.json({ 
      success: true, 
      salaries, 
      summary,
      year: year || new Date().getFullYear()
    });
  } catch (error) {
    logger.error('Get my salary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET SINGLE SALARY ====================
/**
 * @desc    Get single salary by ID
 * @route   GET /api/salaries/:id
 * @access  Private (Admin/Manager)
 */
const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate('userId', 'name email role buildingId department')
      .populate('generatedBy', 'name')
      .populate('approvedBy', 'name');
    
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    // Check authorization
    if (req.user.role === 'manager' && salary.userId?.buildingId?.toString() !== req.user.buildingId?.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this salary' });
    }
    
    res.json({ success: true, salary });
  } catch (error) {
    logger.error('Get salary by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== APPROVE SALARY ====================
/**
 * @desc    Approve salary
 * @route   PUT /api/salaries/:id/approve
 * @access  Private (Admin/Manager)
 */
const approveSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const salary = await Salary.findById(id).populate('userId', 'name email');
    
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    // Check authorization for manager
    if (req.user.role === 'manager' && salary.userId?.buildingId?.toString() !== req.user.buildingId?.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to approve this salary' });
    }
    
    salary.status = 'approved';
    salary.approvedBy = req.user._id;
    salary.approvedAt = new Date();
    salary.notes = notes || salary.notes;
    await salary.save();
    
    // Send notification to employee
    await Notification.create({
      userId: salary.userId,
      title: 'Salary Approved',
      body: `Your salary for ${salary.month}/${salary.year} has been approved. Net amount: ₹${salary.netSalary.toLocaleString()}`,
      type: 'salary',
      priority: 'medium',
      referenceId: salary._id,
      referenceModel: 'Salary',
      channels: ['push', 'email', 'inapp']
    });
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPROVE_SALARY',
      entityType: 'salary',
      entityId: salary._id,
      newData: { status: 'approved', netSalary: salary.netSalary },
      ipAddress: req.ip
    });
    
    res.json({ 
      success: true, 
      salary,
      message: `Salary for ${salary.userId?.name} has been approved`
    });
  } catch (error) {
    logger.error('Approve salary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MARK AS PAID ====================
/**
 * @desc    Mark salary as paid
 * @route   PUT /api/salaries/:id/mark-paid
 * @access  Private (Admin only)
 */
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId, notes } = req.body;
    
    const salary = await Salary.findById(id).populate('userId', 'name email');
    
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    salary.status = 'paid';
    salary.paidDate = new Date();
    salary.paymentMethod = paymentMethod || 'Bank Transfer';
    salary.transactionId = transactionId;
    salary.notes = notes || salary.notes;
    await salary.save();
    
    // Send notification to employee
    await Notification.create({
      userId: salary.userId,
      title: 'Salary Credited',
      body: `Your salary for ${salary.month}/${salary.year} of ₹${salary.netSalary.toLocaleString()} has been credited to your account.`,
      type: 'salary',
      priority: 'high',
      referenceId: salary._id,
      referenceModel: 'Salary',
      channels: ['push', 'email', 'sms', 'inapp']
    });
    
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'MARK_SALARY_PAID',
      entityType: 'salary',
      entityId: salary._id,
      newData: { status: 'paid', paymentMethod, transactionId, amount: salary.netSalary },
      ipAddress: req.ip
    });
    
    res.json({ 
      success: true, 
      salary,
      message: `Salary for ${salary.userId?.name} has been marked as paid`
    });
  } catch (error) {
    logger.error('Mark as paid error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MONTHLY ATTENDANCE FOR SALARY ====================
/**
 * @desc    Get monthly attendance details for salary calculation
 * @route   GET /api/salaries/monthly-attendance
 * @access  Private (Admin/Manager/Employee)
 */
const getMonthlyAttendance = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const targetUserId = userId || req.user._id;
    
    // Authorization check
    if (req.user.role !== 'super_admin' && req.user.role !== 'manager' && targetUserId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    if (req.user.role === 'manager') {
      const user = await User.findById(targetUserId);
      if (user?.buildingId?.toString() !== req.user.buildingId?.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }
    
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);
    
    const attendance = await Attendance.find({
      userId: targetUserId,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');
    
    const user = await User.findById(targetUserId).select('name email role buildingId');
    
    const totalWorkingDays = new Date(currentYear, currentMonth, 0).getDate();
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const absentDays = totalWorkingDays - attendance.length;
    const leaveDays = attendance.filter(a => a.status === 'leave').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    
    // Daily attendance breakdown
    const dailyBreakdown = [];
    for (let i = 1; i <= totalWorkingDays; i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      const record = attendance.find(a => new Date(a.date).getDate() === i);
      dailyBreakdown.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        checkIn: record?.checkIn?.time || null,
        checkOut: record?.checkOut?.time || null,
        status: record?.status || 'absent',
        lateMinutes: record?.lateMinutes || 0,
        totalHours: record?.totalHours || 0,
        checkInPhoto: record?.checkIn?.photo || null,
        checkOutPhoto: record?.checkOut?.photo || null
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        buildingId: user?.buildingId
      },
      summary: {
        totalWorkingDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        totalHours,
        attendanceRate: ((presentDays / totalWorkingDays) * 100).toFixed(1)
      },
      dailyBreakdown,
      month: currentMonth,
      year: currentYear
    });
  } catch (error) {
    logger.error('Get monthly attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE SALARY COMPONENTS ====================
/**
 * @desc    Update salary components for an existing salary record
 * @route   PUT /api/salaries/:id/update
 * @access  Private (Admin only)
 */
const updateSalaryComponents = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, allowances, deductions, bonus, incentives, notes } = req.body;
    
    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    // Only allow updates for draft or calculated status
    if (salary.status !== 'draft' && salary.status !== 'calculated') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update salary in ${salary.status} status` 
      });
    }
    
    // Update fields
    if (basicSalary) salary.basicSalary = basicSalary;
    if (allowances) salary.allowances = { ...salary.allowances, ...allowances };
    if (deductions) salary.deductions = { ...salary.deductions, ...deductions };
    if (bonus !== undefined) salary.bonus = bonus;
    if (incentives !== undefined) salary.incentives = incentives;
    if (notes) salary.notes = notes;
    
    // Recalculate totals
    const allowancesTotal = Object.values(salary.allowances).reduce((a, b) => a + b, 0);
    const deductionsTotal = Object.values(salary.deductions).reduce((a, b) => a + b, 0);
    
    salary.grossSalary = salary.basicSalary + allowancesTotal + salary.bonus + salary.incentives;
    salary.totalDeductions = deductionsTotal + (salary.attendanceDetails?.attendanceDeduction || 0);
    salary.netSalary = Math.max(0, salary.grossSalary - salary.totalDeductions);
    
    await salary.save();
    
    res.json({ 
      success: true, 
      salary,
      message: 'Salary components updated successfully'
    });
  } catch (error) {
    logger.error('Update salary components error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};const ExcelJS = require('exceljs');

// ==================== EXPORT SALARY TO EXCEL ====================
const exportSalaryToExcel = async (req, res) => {
  try {
    const { year, month, userId, role, buildingId, format = 'xlsx' } = req.query;
    
    let query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    
    // Filter by user
    let userFilter = {};
    if (userId) {
      query.userId = userId;
    } else {
      if (role && role !== 'all' && role !== 'customer') userFilter.role = role;
      if (buildingId && buildingId !== 'all') userFilter.buildingId = buildingId;
      
      if (req.user.role === 'manager') {
        userFilter.buildingId = req.user.buildingId;
      }
      
      // Exclude customers
      userFilter.role = { $in: ['super_admin', 'manager', 'supervisor', 'technician'] };
      
      const users = await User.find(userFilter).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }
    
    const salaries = await Salary.find(query)
      .populate('userId', 'name email role buildingId department')
      .sort('userId');
    
    if (salaries.length === 0) {
      return res.status(404).json({ success: false, message: 'No salary data found for export' });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Report');
    
    // Define columns
    worksheet.columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'HRA', key: 'hra', width: 12 },
      { header: 'DA', key: 'da', width: 12 },
      { header: 'TA', key: 'ta', width: 12 },
      { header: 'Medical', key: 'medical', width: 12 },
      { header: 'Other Allowances', key: 'otherAllowances', width: 15 },
      { header: 'Gross Salary', key: 'grossSalary', width: 15 },
      { header: 'PF', key: 'pf', width: 12 },
      { header: 'PT', key: 'pt', width: 12 },
      { header: 'TDS', key: 'tds', width: 12 },
      { header: 'Loan', key: 'loan', width: 12 },
      { header: 'Other Deductions', key: 'otherDeductions', width: 15 },
      { header: 'Attendance Deduction', key: 'attendanceDeduction', width: 18 },
      { header: 'Total Deductions', key: 'totalDeductions', width: 15 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Present Days', key: 'presentDays', width: 12 },
      { header: 'Absent Days', key: 'absentDays', width: 12 },
      { header: 'Late Days', key: 'lateDays', width: 12 }
    ];
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add data rows
    for (const salary of salaries) {
      worksheet.addRow({
        name: salary.userName,
        email: salary.userEmail,
        role: salary.userRole,
        department: salary.userId?.department || 'N/A',
        basicSalary: salary.basicSalary,
        hra: salary.allowances?.hra || 0,
        da: salary.allowances?.da || 0,
        ta: salary.allowances?.ta || 0,
        medical: salary.allowances?.medical || 0,
        otherAllowances: salary.allowances?.other || 0,
        grossSalary: salary.grossSalary,
        pf: salary.deductions?.pf || 0,
        pt: salary.deductions?.pt || 0,
        tds: salary.deductions?.tds || 0,
        loan: salary.deductions?.loan || 0,
        otherDeductions: salary.deductions?.other || 0,
        attendanceDeduction: salary.attendanceDetails?.attendanceDeduction || 0,
        totalDeductions: salary.totalDeductions,
        netSalary: salary.netSalary,
        status: salary.status.toUpperCase(),
        presentDays: salary.attendanceDetails?.presentDays || 0,
        absentDays: salary.attendanceDetails?.absentDays || 0,
        lateDays: salary.attendanceDetails?.lateDays || 0
      });
    }
    
    // Add summary row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow({
      name: 'TOTAL',
      basicSalary: salaries.reduce((s, sal) => s + sal.basicSalary, 0),
      grossSalary: salaries.reduce((s, sal) => s + sal.grossSalary, 0),
      totalDeductions: salaries.reduce((s, sal) => s + sal.totalDeductions, 0),
      netSalary: salaries.reduce((s, sal) => s + sal.netSalary, 0)
    });
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 40);
    });
    
    // Set response headers
    const filename = `salary_report_${month || 'all'}_${year || 'all'}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Export salary to Excel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORT INDIVIDUAL SALARY SLIP ====================
const exportSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findById(id).populate('userId', 'name email role buildingId department address');
    
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Slip');
    
    // Company Header
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'FACILITY MANAGEMENT SYSTEM';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'Salary Slip';
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);
    
    // Employee Details
    worksheet.addRow(['Employee Details', '']);
    worksheet.addRow(['Name:', salary.userName]);
    worksheet.addRow(['Email:', salary.userEmail]);
    worksheet.addRow(['Role:', salary.userRole]);
    worksheet.addRow(['Department:', salary.userId?.department || 'N/A']);
    worksheet.addRow(['Month:', `${salary.month}/${salary.year}`]);
    worksheet.addRow(['Status:', salary.status.toUpperCase()]);
    
    worksheet.addRow([]);
    
    // Earnings Table
    worksheet.addRow(['EARNINGS', 'Amount (₹)', 'DEDUCTIONS', 'Amount (₹)']);
    const earningsRow = worksheet.getRow(worksheet.rowCount);
    earningsRow.font = { bold: true };
    earningsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    
    worksheet.addRow(['Basic Salary', salary.basicSalary, 'Provident Fund (PF)', salary.deductions?.pf || 0]);
    worksheet.addRow(['House Rent Allowance (HRA)', salary.allowances?.hra || 0, 'Professional Tax (PT)', salary.deductions?.pt || 0]);
    worksheet.addRow(['Dearness Allowance (DA)', salary.allowances?.da || 0, 'TDS', salary.deductions?.tds || 0]);
    worksheet.addRow(['Travel Allowance (TA)', salary.allowances?.ta || 0, 'Loan Deduction', salary.deductions?.loan || 0]);
    worksheet.addRow(['Medical Allowance', salary.allowances?.medical || 0, 'Other Deductions', salary.deductions?.other || 0]);
    worksheet.addRow(['Other Allowances', salary.allowances?.other || 0, 'Attendance Deduction', salary.attendanceDetails?.attendanceDeduction || 0]);
    
    worksheet.addRow([]);
    
    // Totals
    worksheet.addRow(['Gross Salary', salary.grossSalary, 'Total Deductions', salary.totalDeductions]);
    const totalRow = worksheet.getRow(worksheet.rowCount);
    totalRow.font = { bold: true };
    
    worksheet.addRow([]);
    worksheet.addRow(['NET SALARY', salary.netSalary]);
    const netRow = worksheet.getRow(worksheet.rowCount);
    netRow.font = { bold: true, size: 12 };
    netRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD1FAE5' }
    };
    
    // Attendance Summary
    worksheet.addRow([]);
    worksheet.addRow(['Attendance Summary', '']);
    worksheet.addRow(['Total Working Days:', salary.attendanceDetails?.totalWorkingDays || 0]);
    worksheet.addRow(['Present Days:', salary.attendanceDetails?.presentDays || 0]);
    worksheet.addRow(['Absent Days:', salary.attendanceDetails?.absentDays || 0]);
    worksheet.addRow(['Late Days:', salary.attendanceDetails?.lateDays || 0]);
    worksheet.addRow(['Total Hours:', salary.attendanceDetails?.totalHours?.toFixed(1) || 0]);
    
    // Format columns
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(3).width = 25;
    
    const filename = `salary_slip_${salary.userName}_${salary.month}_${salary.year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Export salary slip error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const ExcelJS = require('exceljs');

// ==================== EXPORT SALARY TO EXCEL ====================
const exportSalaryToExcel = async (req, res) => {
  try {
    const { year, month, userId, role, buildingId, format = 'xlsx' } = req.query;
    
    let query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);
    
    // Filter by user
    let userFilter = {};
    if (userId) {
      query.userId = userId;
    } else {
      if (role && role !== 'all' && role !== 'customer') userFilter.role = role;
      if (buildingId && buildingId !== 'all') userFilter.buildingId = buildingId;
      
      if (req.user.role === 'manager') {
        userFilter.buildingId = req.user.buildingId;
      }
      
      // Exclude customers
      userFilter.role = { $in: ['super_admin', 'manager', 'supervisor', 'technician'] };
      
      const users = await User.find(userFilter).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }
    
    const salaries = await Salary.find(query)
      .populate('userId', 'name email role buildingId department')
      .sort('userId');
    
    if (salaries.length === 0) {
      return res.status(404).json({ success: false, message: 'No salary data found for export' });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Report');
    
    // Define columns
    worksheet.columns = [
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'HRA', key: 'hra', width: 12 },
      { header: 'DA', key: 'da', width: 12 },
      { header: 'TA', key: 'ta', width: 12 },
      { header: 'Medical', key: 'medical', width: 12 },
      { header: 'Other Allowances', key: 'otherAllowances', width: 15 },
      { header: 'Gross Salary', key: 'grossSalary', width: 15 },
      { header: 'PF', key: 'pf', width: 12 },
      { header: 'PT', key: 'pt', width: 12 },
      { header: 'TDS', key: 'tds', width: 12 },
      { header: 'Loan', key: 'loan', width: 12 },
      { header: 'Other Deductions', key: 'otherDeductions', width: 15 },
      { header: 'Attendance Deduction', key: 'attendanceDeduction', width: 18 },
      { header: 'Total Deductions', key: 'totalDeductions', width: 15 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Present Days', key: 'presentDays', width: 12 },
      { header: 'Absent Days', key: 'absentDays', width: 12 },
      { header: 'Late Days', key: 'lateDays', width: 12 }
    ];
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add data rows
    for (const salary of salaries) {
      worksheet.addRow({
        name: salary.userName,
        email: salary.userEmail,
        role: salary.userRole,
        department: salary.userId?.department || 'N/A',
        basicSalary: salary.basicSalary,
        hra: salary.allowances?.hra || 0,
        da: salary.allowances?.da || 0,
        ta: salary.allowances?.ta || 0,
        medical: salary.allowances?.medical || 0,
        otherAllowances: salary.allowances?.other || 0,
        grossSalary: salary.grossSalary,
        pf: salary.deductions?.pf || 0,
        pt: salary.deductions?.pt || 0,
        tds: salary.deductions?.tds || 0,
        loan: salary.deductions?.loan || 0,
        otherDeductions: salary.deductions?.other || 0,
        attendanceDeduction: salary.attendanceDetails?.attendanceDeduction || 0,
        totalDeductions: salary.totalDeductions,
        netSalary: salary.netSalary,
        status: salary.status.toUpperCase(),
        presentDays: salary.attendanceDetails?.presentDays || 0,
        absentDays: salary.attendanceDetails?.absentDays || 0,
        lateDays: salary.attendanceDetails?.lateDays || 0
      });
    }
    
    // Add summary row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow({
      name: 'TOTAL',
      basicSalary: salaries.reduce((s, sal) => s + sal.basicSalary, 0),
      grossSalary: salaries.reduce((s, sal) => s + sal.grossSalary, 0),
      totalDeductions: salaries.reduce((s, sal) => s + sal.totalDeductions, 0),
      netSalary: salaries.reduce((s, sal) => s + sal.netSalary, 0)
    });
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 40);
    });
    
    // Set response headers
    const filename = `salary_report_${month || 'all'}_${year || 'all'}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Export salary to Excel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORT INDIVIDUAL SALARY SLIP ====================
const exportSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findById(id).populate('userId', 'name email role buildingId department address');
    
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Slip');
    
    // Company Header
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'FACILITY MANAGEMENT SYSTEM';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'Salary Slip';
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);
    
    // Employee Details
    worksheet.addRow(['Employee Details', '']);
    worksheet.addRow(['Name:', salary.userName]);
    worksheet.addRow(['Email:', salary.userEmail]);
    worksheet.addRow(['Role:', salary.userRole]);
    worksheet.addRow(['Department:', salary.userId?.department || 'N/A']);
    worksheet.addRow(['Month:', `${salary.month}/${salary.year}`]);
    worksheet.addRow(['Status:', salary.status.toUpperCase()]);
    
    worksheet.addRow([]);
    
    // Earnings Table
    worksheet.addRow(['EARNINGS', 'Amount (₹)', 'DEDUCTIONS', 'Amount (₹)']);
    const earningsRow = worksheet.getRow(worksheet.rowCount);
    earningsRow.font = { bold: true };
    earningsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    
    worksheet.addRow(['Basic Salary', salary.basicSalary, 'Provident Fund (PF)', salary.deductions?.pf || 0]);
    worksheet.addRow(['House Rent Allowance (HRA)', salary.allowances?.hra || 0, 'Professional Tax (PT)', salary.deductions?.pt || 0]);
    worksheet.addRow(['Dearness Allowance (DA)', salary.allowances?.da || 0, 'TDS', salary.deductions?.tds || 0]);
    worksheet.addRow(['Travel Allowance (TA)', salary.allowances?.ta || 0, 'Loan Deduction', salary.deductions?.loan || 0]);
    worksheet.addRow(['Medical Allowance', salary.allowances?.medical || 0, 'Other Deductions', salary.deductions?.other || 0]);
    worksheet.addRow(['Other Allowances', salary.allowances?.other || 0, 'Attendance Deduction', salary.attendanceDetails?.attendanceDeduction || 0]);
    
    worksheet.addRow([]);
    
    // Totals
    worksheet.addRow(['Gross Salary', salary.grossSalary, 'Total Deductions', salary.totalDeductions]);
    const totalRow = worksheet.getRow(worksheet.rowCount);
    totalRow.font = { bold: true };
    
    worksheet.addRow([]);
    worksheet.addRow(['NET SALARY', salary.netSalary]);
    const netRow = worksheet.getRow(worksheet.rowCount);
    netRow.font = { bold: true, size: 12 };
    netRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD1FAE5' }
    };
    
    // Attendance Summary
    worksheet.addRow([]);
    worksheet.addRow(['Attendance Summary', '']);
    worksheet.addRow(['Total Working Days:', salary.attendanceDetails?.totalWorkingDays || 0]);
    worksheet.addRow(['Present Days:', salary.attendanceDetails?.presentDays || 0]);
    worksheet.addRow(['Absent Days:', salary.attendanceDetails?.absentDays || 0]);
    worksheet.addRow(['Late Days:', salary.attendanceDetails?.lateDays || 0]);
    worksheet.addRow(['Total Hours:', salary.attendanceDetails?.totalHours?.toFixed(1) || 0]);
    
    // Format columns
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(3).width = 25;
    
    const filename = `salary_slip_${salary.userName}_${salary.month}_${salary.year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Export salary slip error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE SALARY RECORD ====================
/**
 * @desc    Delete a salary record
 * @route   DELETE /api/salaries/:id
 * @access  Private (Admin only)
 */
const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    // Only allow deletion for draft or calculated status
    if (salary.status !== 'draft' && salary.status !== 'calculated') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete salary in ${salary.status} status` 
      });
    }
    
    await salary.deleteOne();
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE_SALARY',
      entityType: 'salary',
      entityId: id,
      oldData: { userId: salary.userId, month: salary.month, year: salary.year },
      ipAddress: req.ip
    });
    
    res.json({ 
      success: true, 
      message: 'Salary record deleted successfully'
    });
  } catch (error) {
    logger.error('Delete salary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateSalary,
  bulkGenerateSalary,
  getSalaries,
  getMySalary,
  getSalaryById,
  approveSalary,
  markAsPaid,
  getMonthlyAttendance,
  updateSalaryComponents,
  deleteSalary
};