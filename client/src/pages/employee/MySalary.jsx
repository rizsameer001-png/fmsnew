import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  //DownloadIcon
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import salaryService from '../../services/salary.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MySalary = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['mySalary', selectedYear],
    queryFn: () => salaryService.getMySalary({ year: selectedYear }),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['monthlyAttendance', selectedYear],
    queryFn: () => salaryService.getMonthlyAttendance({ year: selectedYear }),
  });

  const salaries = salaryData?.salaries || [];
  const summary = salaryData?.summary || {};

  const getMonthName = (month) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Salary</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your salary details and payment history
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700"
        >
          {[2023, 2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned ({selectedYear})</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEarned || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDeductions || 0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Months Processed</p>
          <p className="text-2xl font-bold text-indigo-600">{summary.monthsCount || 0}</p>
        </div>
      </div>

      {/* Salary History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {salaries.map((salary) => (
                <tr key={salary._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium">{getMonthName(salary.month)} {salary.year}</td>
                  <td className="px-6 py-4">{formatCurrency(salary.basicSalary)}</td>
                  <td className="px-6 py-4">{salary.attendanceDetails?.presentDays || 0} / {salary.attendanceDetails?.totalWorkingDays || 0}</td>
                  <td className="px-6 py-4">{formatCurrency(salary.grossSalary)}</td>
                  <td className="px-6 py-4 text-red-600">{formatCurrency(salary.totalDeductions)}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(salary.netSalary)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      salary.status === 'paid' ? 'bg-green-100 text-green-800' :
                      salary.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {salary.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{salary.paidDate ? formatDate(salary.paidDate) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MySalary;