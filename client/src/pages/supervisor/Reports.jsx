import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import reportService from '../../services/report.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SupervisorReports = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('performance');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch team performance data
  const { data: reportData, isLoading, refetch, error } = useQuery({
    queryKey: ['supervisorReports', reportType, dateRange.start, dateRange.end],
    queryFn: () => reportService.getPerformanceReport({ 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    }),
    enabled: true,
  });

  // Fetch team stats
  const { data: teamStats } = useQuery({
    queryKey: ['teamStats'],
    queryFn: () => reportService.getTeamStats?.() || Promise.resolve({}),
  });

  const exportReport = async (format) => {
    setIsExporting(true);
    try {
      toast.loading(`Generating ${format.toUpperCase()} report...`, { id: 'export' });
      
      const blob = await reportService.exportReport({ 
        startDate: dateRange.start, 
        endDate: dateRange.end, 
        type: reportType, 
        format 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${reportType}_report_${timestamp}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} report exported!`, { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const performanceData = reportData?.performance || [];
  const stats = teamStats || {};

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <ChartBarIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Failed to load report data</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and export team performance reports</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => exportReport('excel')} 
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              max={dateRange.end || undefined}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={dateRange.start || undefined}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="performance">Performance Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="tasks">Tasks Report</option>
            </select>
          </div>
          <button
            onClick={() => setDateRange({ start: '', end: '' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.teamSize || 0}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks || 0}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.activeTasks || 0}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgRating || 0} ★</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technician Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Completed Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">On-Time Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {performanceData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No performance data available
                  </td>
                </tr>
              ) : (
                performanceData.map((tech, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{tech.role}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{tech.completedTasks || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-yellow-600">{tech.avgRating || 0}</span>
                        <span className="text-yellow-500 ml-1">★</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-600">{tech.onTimeRate || 0}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tech.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tech.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center text-sm text-gray-500">
        <p>Data last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Showing {reportType.replace('_', ' ')} report data</p>
      </div>
    </div>
  );
};

export default SupervisorReports;