const ExcelJS = require('exceljs');
const json2csv = require('json2csv').parse;
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

// Export to Excel
const exportToExcel = async (data, sheetName, columns) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns if provided
    if (columns && columns.length > 0) {
      worksheet.columns = columns;
    } else if (data.length > 0) {
      // Auto-generate columns from first object
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase(),
        key: key,
        width: 20,
      }));
    }

    // Add rows
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    // Auto-fit columns
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
    return buffer;
  } catch (error) {
    logger.error('Export to Excel error:', error);
    throw error;
  }
};

// Export to CSV
const exportToCSV = async (data, fields = null) => {
  try {
    const parserConfig = {
      header: true,
      quote: '"',
      escape: '"',
    };
    
    if (fields && fields.length > 0) {
      parserConfig.fields = fields;
    }
    
    const csv = json2csv(data, parserConfig);
    return csv;
  } catch (error) {
    logger.error('Export to CSV error:', error);
    throw error;
  }
};

// Export to JSON
const exportToJSON = async (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.error('Export to JSON error:', error);
    throw error;
  }
};

// Export attendance report
const exportAttendanceReport = async (attendanceData, format = 'excel') => {
  const columns = [
    { header: 'Employee Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Present Days', key: 'totalPresent', width: 15 },
    { header: 'Late Days', key: 'totalLate', width: 15 },
    { header: 'Absent Days', key: 'totalAbsent', width: 15 },
    { header: 'Total Hours', key: 'totalHours', width: 15 },
    { header: 'Avg Late (min)', key: 'avgLateMinutes', width: 15 },
  ];

  if (format === 'excel') {
    return await exportToExcel(attendanceData, 'Attendance Report', columns);
  } else if (format === 'csv') {
    return await exportToCSV(attendanceData, columns.map(c => c.key));
  } else {
    return await exportToJSON(attendanceData);
  }
};

// Export complaint report
const exportComplaintReport = async (complaintData, format = 'excel') => {
  const columns = [
    { header: 'Complaint No', key: 'complaintNumber', width: 20 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Service Type', key: 'serviceType', width: 20 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created Date', key: 'createdAt', width: 20 },
    { header: 'Resolution Time', key: 'resolutionTime', width: 18 },
    { header: 'Rating', key: 'rating', width: 10 },
  ];

  const formattedData = complaintData.map(c => ({
    complaintNumber: c.complaintNumber,
    customerName: c.customerId?.name || 'N/A',
    serviceType: c.serviceType,
    priority: c.priority,
    status: c.status,
    createdAt: new Date(c.createdAt).toLocaleDateString(),
    resolutionTime: c.resolution?.resolvedAt 
      ? `${Math.round((new Date(c.resolution.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60))} hours`
      : 'Pending',
    rating: c.rating || 'N/A',
  }));

  if (format === 'excel') {
    return await exportToExcel(formattedData, 'Complaint Report', columns);
  } else if (format === 'csv') {
    return await exportToCSV(formattedData);
  } else {
    return await exportToJSON(formattedData);
  }
};

// Export financial report
const exportFinancialReport = async (financialData, format = 'excel') => {
  const columns = [
    { header: 'Invoice No', key: 'invoiceNumber', width: 20 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Amount', key: 'totalAmount', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Issue Date', key: 'issueDate', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Paid Date', key: 'paidDate', width: 15 },
  ];

  if (format === 'excel') {
    return await exportToExcel(financialData, 'Financial Report', columns);
  } else if (format === 'csv') {
    return await exportToCSV(financialData);
  } else {
    return await exportToJSON(financialData);
  }
};

// Export technician performance report
const exportPerformanceReport = async (performanceData, format = 'excel') => {
  const columns = [
    { header: 'Technician Name', key: 'name', width: 25 },
    { header: 'Completed Tasks', key: 'completedTasks', width: 18 },
    { header: 'Avg Rating', key: 'avgRating', width: 12 },
    { header: 'Avg Completion Time', key: 'avgCompletionTime', width: 20 },
    { header: 'On-Time Rate', key: 'onTimeRate', width: 15 },
  ];

  if (format === 'excel') {
    return await exportToExcel(performanceData, 'Performance Report', columns);
  } else if (format === 'csv') {
    return await exportToCSV(performanceData);
  } else {
    return await exportToJSON(performanceData);
  }
};

// Export invoice data
const exportInvoices = async (invoices, format = 'excel') => {
  const columns = [
    { header: 'Invoice No', key: 'invoiceNumber', width: 20 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Amount', key: 'totalAmount', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Issue Date', key: 'issueDate', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
  ];

  const formattedData = invoices.map(inv => ({
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerId?.name || 'N/A',
    totalAmount: inv.totalAmount,
    status: inv.status,
    issueDate: new Date(inv.issueDate).toLocaleDateString(),
    dueDate: new Date(inv.dueDate).toLocaleDateString(),
  }));

  if (format === 'excel') {
    return await exportToExcel(formattedData, 'Invoices', columns);
  } else if (format === 'csv') {
    return await exportToCSV(formattedData);
  } else {
    return await exportToJSON(formattedData);
  }
};

// Export tasks report
const exportTasksReport = async (tasks, format = 'excel') => {
  const columns = [
    { header: 'Task No', key: 'taskNumber', width: 18 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Assigned To', key: 'assignedTo', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Scheduled Date', key: 'scheduledDate', width: 18 },
    { header: 'Completed Date', key: 'completedDate', width: 18 },
    { header: 'Duration (min)', key: 'duration', width: 15 },
  ];

  const formattedData = tasks.map(task => ({
    taskNumber: task.taskNumber,
    title: task.title,
    assignedTo: task.assignedTo?.name || 'N/A',
    status: task.status,
    scheduledDate: new Date(task.scheduledDate).toLocaleDateString(),
    completedDate: task.actualEndTime ? new Date(task.actualEndTime).toLocaleDateString() : 'N/A',
    duration: task.duration || 'N/A',
  }));

  if (format === 'excel') {
    return await exportToExcel(formattedData, 'Tasks Report', columns);
  } else if (format === 'csv') {
    return await exportToCSV(formattedData);
  } else {
    return await exportToJSON(formattedData);
  }
};

// Export with custom styling
const exportStyledExcel = async (data, sheetName, options = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add title row if provided
    if (options.title) {
      worksheet.mergeCells('A1:F1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = options.title;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      worksheet.addRow([]);
    }

    // Add headers
    const headers = options.columns || Object.keys(data[0]);
    const headerRow = worksheet.addRow(headers.map(h => h.toUpperCase()));
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Add data rows with alternating colors
    data.forEach((row, index) => {
      const dataRow = worksheet.addRow(options.columns ? options.columns.map(col => row[col]) : Object.values(row));
      
      if (index % 2 === 0) {
        dataRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        });
      }
    });

    // Add total row if needed
    if (options.showTotal && options.totalColumn) {
      worksheet.addRow([]);
      const totalRow = worksheet.addRow(['TOTAL', ...Array(headers.length - 2).fill(''), options.totalValue]);
      totalRow.font = { bold: true };
    }

    // Auto-fit columns
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

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    logger.error('Export styled Excel error:', error);
    throw error;
  }
};

// Generate filename with timestamp
const generateExportFilename = (prefix, format) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}_${timestamp}.${format}`;
};

module.exports = {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  exportAttendanceReport,
  exportComplaintReport,
  exportFinancialReport,
  exportPerformanceReport,
  exportInvoices,
  exportTasksReport,
  exportStyledExcel,
  generateExportFilename,
};