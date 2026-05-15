const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  salaryNumber: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  userEmail: String,
  userRole: String,
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
  },
  month: {
    type: Number,
    required: true, // 1-12
  },
  year: {
    type: Number,
    required: true,
  },
  // Salary Components
  basicSalary: {
    type: Number,
    required: true,
    default: 0,
  },
  allowances: {
    hra: { type: Number, default: 0 }, // House Rent Allowance
    da: { type: Number, default: 0 },  // Dearness Allowance
    ta: { type: Number, default: 0 },  // Travel Allowance
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  deductions: {
    pf: { type: Number, default: 0 },   // Provident Fund
    pt: { type: Number, default: 0 },   // Professional Tax
    tds: { type: Number, default: 0 },  // Tax Deducted at Source
    loan: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  // Attendance based calculations
  attendanceDetails: {
    totalWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    lateDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
  },
  // Calculated amounts
  grossSalary: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  // Bonus and incentives
  bonus: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  // Status
  status: {
    type: String,
    enum: ['draft', 'calculated', 'approved', 'paid', 'cancelled'],
    default: 'draft',
  },
  paidDate: Date,
  paymentMethod: String,
  transactionId: String,
  notes: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

salarySchema.pre('save', async function(next) {
  if (!this.salaryNumber) {
    const count = await mongoose.model('Salary').countDocuments();
    const year = this.year;
    const month = String(this.month).padStart(2, '0');
    this.salaryNumber = `SAL/${year}${month}/${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

salarySchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
salarySchema.index({ status: 1 });
salarySchema.index({ year: 1, month: 1 });

module.exports = mongoose.model('Salary', salarySchema);