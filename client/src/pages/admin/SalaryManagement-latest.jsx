import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CurrencyRupeeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRole, setSelectedRole] = useState('all');
  
  const queryClient = useQueryClient();

  const { data: salariesData, isLoading, refetch } = useQuery({
    queryKey: ['salaries', selectedMonth, selectedYear],
    queryFn: () => salaryService.getSalaries({ month: selectedMonth, year: selectedYear }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['employees', selectedRole],
    queryFn: () => userService.getUsers({ role: selectedRole !== 'all' ? selectedRole : undefined, excludeRole: 'customer'  // ✅ Exclude customers}),
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee salaries and monthly payroll
          </p>
        </div>
        <div className="flex space-x-2">
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
              {salaries.map((salary) => (
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
                      <button
                        onClick={() => { setSelectedSalary(salary); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {salary.status === 'calculated' && (
                        <button
                          onClick={() => approveMutation.mutate(salary._id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
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

            <div className="flex justify-end">
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
              {usersData?.users?.map(user => (
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
    </div>
  );
};

export default SalaryManagement;