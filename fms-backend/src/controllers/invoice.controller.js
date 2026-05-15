const Invoice = require('../models/Invoice.model');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { generatePDF } = require('../services/pdf.service');
const { sendEmail } = require('../services/email.service');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private/Admin/Manager
const getInvoices = async (req, res) => {
  try {
    const { status, customerId, buildingId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (buildingId) query.buildingId = buildingId;

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email phone')
      .populate('buildingId', 'name code')
      .sort('-issueDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my invoices (customer)
// @route   GET /api/invoices/my
// @access  Private/Customer
const getMyInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customerId: req.user._id };
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('buildingId', 'name code')
      .sort('-issueDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    // Calculate summary
    const summary = await Invoice.aggregate([
      { $match: { customerId: req.user._id } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      invoices,
      summary,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get my invoices error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('buildingId', 'name code address')
      .populate('items.serviceId', 'name category');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && invoice.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    logger.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private/Admin/Manager
const createInvoice = async (req, res) => {
  try {
    const { customerId, buildingId, items, discount, dueDate, notes } = req.body;

    // Calculate amounts
    let subtotal = 0;
    items.forEach(item => {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    });

    const gstAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + gstAmount - (discount || 0);

    const invoice = await Invoice.create({
      customerId,
      buildingId,
      items,
      subtotal,
      gstAmount,
      discount: discount || 0,
      totalAmount,
      dueDate,
      notes,
      issueDate: new Date(),
      status: 'sent'
    });

    // Send email notification to customer
    const customer = await User.findById(customerId);
    await sendEmail(customer.email, `Invoice ${invoice.invoiceNumber}`, 
      `Your invoice for ${totalAmount} is due on ${new Date(dueDate).toLocaleDateString()}`);

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_INVOICE',
      entityType: 'invoice',
      entityId: invoice._id,
      newData: { invoiceNumber: invoice.invoiceNumber, totalAmount },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    logger.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private/Admin
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    logger.error('Update invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await invoice.deleteOne();

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Delete invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('buildingId', 'name code address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const pdfBuffer = await generatePDF('invoice', {
      invoice,
      companyDetails: {
        name: 'FMS Solutions',
        address: '123 Business Park, Mumbai',
        gst: '27AAACA1234A1Z'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Generate PDF error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  getMyInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF
};