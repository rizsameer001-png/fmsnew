const SalaryConfig = require('../models/SalaryConfig.model');
const ActivityLog = require('../models/ActivityLog.model');
const { logger } = require('../utils/logger');

// ==================== CREATE SALARY CONFIG ====================
const createSalaryConfig = async (req, res) => {
  try {
    const configData = req.body;
    const existingConfig = await SalaryConfig.findOne({ name: configData.name });
    
    if (existingConfig) {
      return res.status(400).json({ success: false, message: 'Salary config already exists' });
    }
    
    const config = await SalaryConfig.create(configData);
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_SALARY_CONFIG',
      entityType: 'salaryConfig',
      entityId: config._id,
      newData: { name: config.name, country: config.country },
      ipAddress: req.ip
    });
    
    res.status(201).json({ success: true, config });
  } catch (error) {
    logger.error('Create salary config error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ALL SALARY CONFIGS ====================
const getSalaryConfigs = async (req, res) => {
  try {
    const configs = await SalaryConfig.find({ isActive: true }).sort('country');
    res.json({ success: true, configs });
  } catch (error) {
    logger.error('Get salary configs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET SALARY CONFIG BY COUNTRY ====================
const getSalaryConfigByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const config = await SalaryConfig.findOne({ country, isActive: true });
    
    if (!config) {
      // Return default config if not found
      const defaultConfig = {
        name: 'Default',
        country: country,
        currency: country === 'UAE' ? 'AED' : country === 'USA' ? 'USD' : 'INR',
        currencySymbol: country === 'UAE' ? 'د.إ' : country === 'USA' ? '$' : '₹',
        earnings: [
          { name: 'Basic Salary', code: 'BASIC', type: 'fixed', value: 0, isTaxable: true, order: 1 },
          { name: 'House Rent Allowance', code: 'HRA', type: 'percentage', value: 40, basedOn: 'basic', isTaxable: false, order: 2 },
          { name: 'Dearness Allowance', code: 'DA', type: 'percentage', value: 20, basedOn: 'basic', isTaxable: true, order: 3 },
          { name: 'Travel Allowance', code: 'TA', type: 'fixed', value: 2000, isTaxable: true, order: 4 },
          { name: 'Medical Allowance', code: 'MEDICAL', type: 'fixed', value: 1500, isTaxable: false, order: 5 },
          { name: 'Special Allowance', code: 'SPECIAL', type: 'fixed', value: 0, isTaxable: true, order: 6 }
        ],
        deductions: [
          { name: 'Provident Fund', code: 'PF', type: 'percentage', value: 12, basedOn: 'basic', isMandatory: true, order: 1, maxAmount: 7200 },
          { name: 'Professional Tax', code: 'PT', type: 'fixed', value: 200, isMandatory: true, order: 2 },
          { name: 'Tax Deducted at Source', code: 'TDS', type: 'percentage', value: 0, basedOn: 'gross', isMandatory: true, order: 3 },
          { name: 'Loan Deduction', code: 'LOAN', type: 'fixed', value: 0, isMandatory: false, order: 4 }
        ],
        defaultBasicSalary: {
          super_admin: 80000,
          manager: 50000,
          supervisor: 35000,
          technician: 25000,
          customer: 0
        },
        settings: {
          enableAttendanceDeduction: true,
          dailyRateCalculation: 'working_days',
          roundOff: 'nearest',
          includeOverTime: false,
          overTimeRate: 1.5
        }
      };
      return res.json({ success: true, config: defaultConfig, isDefault: true });
    }
    
    res.json({ success: true, config });
  } catch (error) {
    logger.error('Get salary config by country error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE SALARY CONFIG ====================
const updateSalaryConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const config = await SalaryConfig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Salary config not found' });
    }
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_SALARY_CONFIG',
      entityType: 'salaryConfig',
      entityId: config._id,
      newData: { name: config.name, country: config.country },
      ipAddress: req.ip
    });
    
    res.json({ success: true, config });
  } catch (error) {
    logger.error('Update salary config error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE SALARY CONFIG ====================
const deleteSalaryConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await SalaryConfig.findByIdAndDelete(id);
    
    if (!config) {
      return res.status(404).json({ success: false, message: 'Salary config not found' });
    }
    
    res.json({ success: true, message: 'Salary config deleted successfully' });
  } catch (error) {
    logger.error('Delete salary config error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CREATE DEFAULT CONFIGS ====================
const createDefaultConfigs = async (req, res) => {
  try {
    const defaultConfigs = [
      {
        name: 'Indian Salary Structure',
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        earnings: [
          { name: 'Basic Salary', code: 'BASIC', type: 'fixed', value: 0, isTaxable: true, order: 1 },
          { name: 'House Rent Allowance', code: 'HRA', type: 'percentage', value: 40, basedOn: 'basic', isTaxable: false, order: 2 },
          { name: 'Dearness Allowance', code: 'DA', type: 'percentage', value: 20, basedOn: 'basic', isTaxable: true, order: 3 },
          { name: 'Travel Allowance', code: 'TA', type: 'fixed', value: 2000, isTaxable: true, order: 4 },
          { name: 'Medical Allowance', code: 'MEDICAL', type: 'fixed', value: 1500, isTaxable: false, order: 5 },
          { name: 'Special Allowance', code: 'SPECIAL', type: 'fixed', value: 0, isTaxable: true, order: 6 }
        ],
        deductions: [
          { name: 'Provident Fund', code: 'PF', type: 'percentage', value: 12, basedOn: 'basic', isMandatory: true, order: 1, maxAmount: 7200 },
          { name: 'Professional Tax', code: 'PT', type: 'fixed', value: 200, isMandatory: true, order: 2 },
          { name: 'Tax Deducted at Source', code: 'TDS', type: 'percentage', value: 0, basedOn: 'gross', isMandatory: true, order: 3 }
        ],
        defaultBasicSalary: {
          super_admin: 80000,
          manager: 50000,
          supervisor: 35000,
          technician: 25000,
          customer: 0
        },
        settings: {
          enableAttendanceDeduction: true,
          dailyRateCalculation: 'working_days',
          roundOff: 'nearest',
          includeOverTime: false,
          overTimeRate: 1.5
        }
      },
      {
        name: 'UAE Salary Structure',
        country: 'UAE',
        currency: 'AED',
        currencySymbol: 'د.إ',
        earnings: [
          { name: 'Basic Salary', code: 'BASIC', type: 'fixed', value: 0, isTaxable: true, order: 1 },
          { name: 'Housing Allowance', code: 'HOUSING', type: 'percentage', value: 30, basedOn: 'basic', isTaxable: false, order: 2 },
          { name: 'Transport Allowance', code: 'TRANSPORT', type: 'fixed', value: 1000, isTaxable: true, order: 3 },
          { name: 'Education Allowance', code: 'EDUCATION', type: 'fixed', value: 500, isTaxable: false, order: 4 }
        ],
        deductions: [
          { name: 'Gratuity', code: 'GRATUITY', type: 'percentage', value: 5, basedOn: 'basic', isMandatory: true, order: 1 },
          { name: 'Other Deductions', code: 'OTHER', type: 'fixed', value: 0, isMandatory: false, order: 2 }
        ],
        defaultBasicSalary: {
          super_admin: 15000,
          manager: 12000,
          supervisor: 8000,
          technician: 5000,
          customer: 0
        },
        settings: {
          enableAttendanceDeduction: true,
          dailyRateCalculation: 'working_days',
          roundOff: 'nearest',
          includeOverTime: false,
          overTimeRate: 1.5
        }
      },
      {
        name: 'USA Salary Structure',
        country: 'USA',
        currency: 'USD',
        currencySymbol: '$',
        earnings: [
          { name: 'Base Salary', code: 'BASE', type: 'fixed', value: 0, isTaxable: true, order: 1 },
          { name: 'Bonus', code: 'BONUS', type: 'fixed', value: 0, isTaxable: true, order: 2 },
          { name: 'Commission', code: 'COMMISSION', type: 'fixed', value: 0, isTaxable: true, order: 3 }
        ],
        deductions: [
          { name: 'Federal Tax', code: 'FED_TAX', type: 'percentage', value: 15, basedOn: 'gross', isMandatory: true, order: 1 },
          { name: 'State Tax', code: 'STATE_TAX', type: 'percentage', value: 5, basedOn: 'gross', isMandatory: true, order: 2 },
          { name: 'Social Security', code: 'SS', type: 'percentage', value: 6.2, basedOn: 'gross', isMandatory: true, order: 3 },
          { name: 'Medicare', code: 'MEDICARE', type: 'percentage', value: 1.45, basedOn: 'gross', isMandatory: true, order: 4 },
          { name: '401(k)', code: '401K', type: 'percentage', value: 5, basedOn: 'basic', isMandatory: false, order: 5 }
        ],
        defaultBasicSalary: {
          super_admin: 10000,
          manager: 7000,
          supervisor: 5000,
          technician: 4000,
          customer: 0
        },
        settings: {
          enableAttendanceDeduction: true,
          dailyRateCalculation: 'working_days',
          roundOff: 'nearest',
          includeOverTime: true,
          overTimeRate: 1.5
        }
      }
    ];
    
    const created = [];
    for (const configData of defaultConfigs) {
      const existing = await SalaryConfig.findOne({ country: configData.country });
      if (!existing) {
        const config = await SalaryConfig.create(configData);
        created.push(config);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Created ${created.length} default configurations`,
      configs: created 
    });
  } catch (error) {
    logger.error('Create default configs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSalaryConfig,
  getSalaryConfigs,
  getSalaryConfigByCountry,
  updateSalaryConfig,
  deleteSalaryConfig,
  createDefaultConfigs
};