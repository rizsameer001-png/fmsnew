import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CurrencyRupeeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,  // For salary slip export
  EnvelopeIcon,           // ✅ NEW - For individual email
  PaperAirplaneIcon       // ✅ NEW - For bulk email
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import salaryService from '../../services/salary.service';
import userService from '../../services/user.service';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SalaryManagement = () => {
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);  // ✅ NEW
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRole, setSelectedRole] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);  // ✅ NEW
  
  const queryClient = useQueryClient();

  const { data: salariesData, isLoading, refetch } = useQuery({
    queryKey: ['salaries', selectedMonth, selectedYear],
    queryFn: () => salaryService.getSalaries({ month: selectedMonth, year: selectedYear }),
  });

  // Fetch employees (excluding customers)
  const { data: usersData } = useQuery({
    queryKey: ['employees', selectedRole],
    queryFn: () => userService.getUsers({ 
      role: selectedRole !== 'all' ? selectedRole : undefined,
    }),
  });

  // ==================== MUTATIONS ====================
  
  const generateMutation = useMutation({
    mutationFn: (data) => salaryService.generateSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaries']);
      setShowGenerateModal(false);
      toast.success('Salary generated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate salary');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => salaryService.approveSalary(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaries']);
      toast.success('Salary approved');
      refetch();
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, paymentMethod, transactionId }) => salaryService.markAsPaid(id, { paymentMethod, transactionId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaries']);
      toast.success('Salary marked as paid');
      refetch();
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: (data) => salaryService.bulkGenerateSalary(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['salaries']);
      toast.success(response.message || 'Bulk salary generation completed');
      refetch();
    },
  });

  // ✅ NEW - Send individual email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (id) => salaryService.sendSalarySlipEmail(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Salary slip sent via email');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    },
  });

  // ✅ NEW - Send bulk email mutation
  const sendBulkEmailMutation = useMutation({
    mutationFn: (params) => salaryService.sendBulkSalarySlipsEmail(params),
    onSuccess: (response) => {
      toast.success(response.message);
      setShowBulkEmailModal(false);
      if (response.summary) {
        toast.success(`✅ Success: ${response.summary.success}, ❌ Failed: ${response.summary.failed}`);
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send bulk emails');
    },
  });

  // ==================== HANDLERS ====================
  
  // Export all salaries to Excel
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const blob = await salaryService.exportSalary({
        month: selectedMonth,
        year: selectedYear,
        role: selectedRole !== 'all' ? selectedRole : undefined
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_report_${getMonthName(selectedMonth)}_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Salary report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export salary report');
    } finally {
      setIsExporting(false);
    }
  };

  // Export individual salary slip
  const handleExportSalarySlip = async (salaryId, employeeName) => {
    try {
      const blob = await salaryService.exportSalarySlip(salaryId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_slip_${employeeName}_${getMonthName(selectedMonth)}_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Salary slip downloaded');
    } catch (error) {
      console.error('Export slip error:', error);
      toast.error('Failed to download salary slip');
    }
  };

  // ✅ NEW - Send individual email
  const handleSendEmail = (salaryId, employeeName) => {
    if (window.confirm(`Send salary slip to ${employeeName} via email?`)) {
      sendEmailMutation.mutate(salaryId);
    }
  };

  // ✅ NEW - Send bulk email
  const handleBulkEmail = () => {
    sendBulkEmailMutation.mutate({
      month: selectedMonth,
      year: selectedYear,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: 'approved'
    });
  };

  const handleBulkGenerate = () => {
    if (window.confirm(`Generate salaries for all employees for ${getMonthName(selectedMonth)} ${selectedYear}?`)) {
      bulkGenerateMutation.mutate({ month: selectedMonth, year: selectedYear, role: selectedRole });
    }
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      calculated: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const salaries = salariesData?.salaries || [];
  const summary = salariesData?.summary || {};

  // Filter out customers from the list
  const filteredSalaries = salaries.filter(s => s.userRole !== 'customer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee salaries, monthly payroll, and send salary slips via email
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* ✅ NEW - Bulk Email Button */}
          <button
            onClick={() => setShowBulkEmailModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>Bulk Email</span>
          </button>
          
          {/* Export All Button */}
          <button
            onClick={handleExportAll}
            disabled={isExporting || filteredSalaries.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>{isExporting ? 'Exporting...' : 'Export All'}</span>
          </button>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{getMonthName(month)}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CurrencyRupeeIcon className="h-5 w-5" />
            <span>Generate Salary</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.count || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Gross Salary</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(summary.totalGrossSalary || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDeductions || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Net Salary</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalNetSalary || 0)}</p>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSalaries.map((salary) => (
                <tr key={salary._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{salary.userName}</div>
                    <div className="text-sm text-gray-500">{salary.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{salary.userRole}</td>
                  <td className="px-6 py-4">{formatCurrency(salary.basicSalary)}</td>
                  <td className="px-6 py-4">{salary.attendanceDetails?.presentDays || 0} / {salary.attendanceDetails?.totalWorkingDays || 0}</td>
                  <td className="px-6 py-4">{formatCurrency(salary.grossSalary)}</td>
                  <td className="px-6 py-4 text-red-600">{formatCurrency(salary.totalDeductions)}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(salary.netSalary)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(salary.status)}`}>
                      {salary.status.toUpperCase()}
                    </span>
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {/* View Details */}
                      <button
                        onClick={() => { setSelectedSalary(salary); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Export Salary Slip */}
                      <button
                        onClick={() => handleExportSalarySlip(salary._id, salary.userName)}
                        className="text-green-600 hover:text-green-800"
                        title="Download Salary Slip"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      
                      {/* ✅ NEW - Send Email Button */}
                      {salary.status === 'approved' && (
                        <button
                          onClick={() => handleSendEmail(salary._id, salary.userName)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Send Email"
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      {/* Approve Button */}
                      {salary.status === 'calculated' && (
                        <button
                          onClick={() => approveMutation.mutate(salary._id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      {/* Mark as Paid Button */}
                      {salary.status === 'approved' && (
                        <button
                          onClick={() => {
                            const method = prompt('Enter payment method (Bank Transfer/Cash/Cheque):');
                            const transactionId = prompt('Enter transaction ID/Reference:');
                            if (method) markPaidMutation.mutate({ id: salary._id, paymentMethod: method, transactionId });
                          }}
                          className="text-purple-600 hover:text-purple-800"
                          title="Mark as Paid"
                        >
                          <CurrencyRupeeIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Details Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedSalary(null); }} title="Salary Details" size="lg">
        {selectedSalary && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="font-semibold">{selectedSalary.userName}</p>
                  <p className="text-sm text-gray-500">{selectedSalary.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Month/Year</p>
                  <p className="font-semibold">{getMonthName(selectedSalary.month)} {selectedSalary.year}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Earnings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span>{formatCurrency(selectedSalary.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span>{formatCurrency(selectedSalary.allowances?.hra || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DA:</span>
                    <span>{formatCurrency(selectedSalary.allowances?.da || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TA:</span>
                    <span>{formatCurrency(selectedSalary.allowances?.ta || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical:</span>
                    <span>{formatCurrency(selectedSalary.allowances?.medical || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Gross Salary:</span>
                    <span>{formatCurrency(selectedSalary.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Deductions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>PF:</span>
                    <span>{formatCurrency(selectedSalary.deductions?.pf || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PT:</span>
                    <span>{formatCurrency(selectedSalary.deductions?.pt || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS:</span>
                    <span>{formatCurrency(selectedSalary.deductions?.tds || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan:</span>
                    <span>{formatCurrency(selectedSalary.deductions?.loan || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Deduction:</span>
                    <span>{formatCurrency(selectedSalary.attendanceDetails?.attendanceDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Deductions:</span>
                    <span>{formatCurrency(selectedSalary.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Net Salary Payable</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedSalary.netSalary)}</p>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleExportSalarySlip(selectedSalary._id, selectedSalary.userName)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <DocumentDuplicateIcon className="h-5 w-5 inline mr-2" />
                Download Slip
              </button>
              {selectedSalary.status === 'approved' && (
                <button
                  onClick={() => handleSendEmail(selectedSalary._id, selectedSalary.userName)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                  Send Email
                </button>
              )}
              <button
                onClick={() => { setShowModal(false); setSelectedSalary(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Salary Modal */}
      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Salary" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              onChange={(e) => {
                const userId = e.target.value;
                if (userId) {
                  generateMutation.mutate({
                    userId,
                    month: selectedMonth,
                    year: selectedYear,
                    basicSalary: 25000,
                    allowances: { hra: 5000, da: 3000, ta: 2000, medical: 1500, other: 0 },
                    deductions: { pf: 1800, pt: 200, tds: 500, loan: 0, other: 0 }
                  });
                  setShowGenerateModal(false);
                }
              }}
            >
              <option value="">Select Employee</option>
              {usersData?.users?.filter(user => user.role !== 'customer').map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleBulkGenerate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Generate All
            </button>
            <button
              onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ✅ NEW - Bulk Email Modal */}
      <Modal isOpen={showBulkEmailModal} onClose={() => setShowBulkEmailModal(false)} title="Send Bulk Salary Slips" size="md">
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This will send salary slips to all employees with <strong>APPROVED</strong> status for {getMonthName(selectedMonth)} {selectedYear}.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              Employees will receive their salary slip as PDF attachment via email.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              📧 Total recipients: {filteredSalaries.filter(s => s.status === 'approved').length} employees
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowBulkEmailModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkEmail}
              disabled={sendBulkEmailMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {sendBulkEmailMutation.isPending ? 'Sending...' : 'Send All'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalaryManagement;