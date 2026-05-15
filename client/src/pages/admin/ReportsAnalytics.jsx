// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { DocumentArrowDownIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
// import { Line, Bar, Pie } from 'react-chartjs-2';
// import reportService from '../../services/report.service';
// import { formatCurrency } from '../../utils/formatters';

// const ReportsAnalytics = () => {
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });
//   const [reportType, setReportType] = useState('overview');

//   const { data: reportData, isLoading } = useQuery({
//     queryKey: ['reports', reportType, dateRange],
//     queryFn: () => reportService.getAnalytics({ ...dateRange, type: reportType }),
//   });

//   const exportReport = async (format) => {
//     try {
//       const blob = await reportService.exportReport({ ...dateRange, type: reportType, format });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `report_${reportType}_${Date.now()}.${format}`;
//       a.click();
//     } catch (error) {
//       console.error('Export failed:', error);
//     }
//   };

//   const revenueChartData = {
//     labels: reportData?.revenueLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [{
//       label: 'Revenue',
//       data: reportData?.revenueData || [65000, 78000, 82000, 95000, 88000, 105000],
//       borderColor: 'rgb(79, 70, 229)',
//       backgroundColor: 'rgba(79, 70, 229, 0.1)',
//       fill: true,
//     }],
//   };

//   const complaintChartData = {
//     labels: reportData?.complaintLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [
//       {
//         label: 'New',
//         data: reportData?.newComplaints || [12, 19, 15, 17, 14, 10, 8],
//         backgroundColor: 'rgba(239, 68, 68, 0.5)',
//       },
//       {
//         label: 'Resolved',
//         data: reportData?.resolvedComplaints || [10, 15, 12, 14, 12, 9, 7],
//         backgroundColor: 'rgba(16, 185, 129, 0.5)',
//       },
//     ],
//   };

//   const slaData = {
//     labels: ['Within SLA', 'Breached'],
//     datasets: [{
//       data: [reportData?.slaCompliance || 85, reportData?.slaBreaches || 15],
//       backgroundColor: ['#10B981', '#EF4444'],
//     }],
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
//           <p className="text-gray-600 mt-1">View insights and generate reports</p>
//         </div>
//         <div className="flex space-x-2">
//           <button onClick={() => exportReport('excel')} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//             <DocumentArrowDownIcon className="h-5 w-5" />
//             <span>Export Excel</span>
//           </button>
//           <button onClick={() => exportReport('pdf')} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
//             <DocumentTextIcon className="h-5 w-5" />
//             <span>Export PDF</span>
//           </button>
//         </div>
//       </div>

//       {/* Date Range */}
//       <div className="bg-white rounded-xl shadow-md p-4">
//         <div className="flex gap-4 items-end">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={dateRange.start}
//               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//               className="px-3 py-2 border border-gray-300 rounded-lg"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//             <input
//               type="date"
//               value={dateRange.end}
//               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//               className="px-3 py-2 border border-gray-300 rounded-lg"
//             />
//           </div>
//           <select
//             value={reportType}
//             onChange={(e) => setReportType(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg"
//           >
//             <option value="overview">Overview</option>
//             <option value="revenue">Revenue Report</option>
//             <option value="complaints">Complaints Report</option>
//             <option value="attendance">Attendance Report</option>
//             <option value="performance">Performance Report</option>
//           </select>
//         </div>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600">Total Revenue</p>
//           <p className="text-2xl font-bold text-indigo-600">{formatCurrency(reportData?.totalRevenue || 478000)}</p>
//           <p className="text-xs text-green-600 mt-1">↑ 12% vs last period</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600">Avg Resolution Time</p>
//           <p className="text-2xl font-bold text-gray-900">{reportData?.avgResolutionTime || 24}h</p>
//           <p className="text-xs text-green-600 mt-1">↓ 2h vs last period</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600">SLA Compliance</p>
//           <p className="text-2xl font-bold text-green-600">{reportData?.slaCompliance || 87}%</p>
//           <p className="text-xs text-green-600 mt-1">↑ 5% vs last period</p>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600">Customer Satisfaction</p>
//           <p className="text-2xl font-bold text-yellow-600">{reportData?.csat || 4.2}/5</p>
//           <p className="text-xs text-green-600 mt-1">↑ 0.3 vs last period</p>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
//           <div className="h-80">
//             <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold mb-4">Complaint Trends</h3>
//           <div className="h-80">
//             <Bar data={complaintChartData} options={{ responsive: true, maintainAspectRatio: false }} />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
//           <div className="h-64 flex justify-center">
//             <Pie data={slaData} options={{ responsive: true, maintainAspectRatio: true }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold mb-4">Top Performing Technicians</h3>
//           <div className="space-y-3">
//             {reportData?.topTechnicians?.map((tech, idx) => (
//               <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="font-medium">{tech.name}</p>
//                   <p className="text-sm text-gray-500">{tech.role}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-bold text-indigo-600">{tech.completedTasks} tasks</p>
//                   <p className="text-sm text-gray-500">⭐ {tech.rating}/5</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportsAnalytics;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import reportService from '../../services/report.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Chart.js registration (if not already registered in main.jsx)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Validate date range
  const isValidDateRange = () => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (start > end) {
        toast.error('Start date cannot be after end date');
        return false;
      }
    }
    return true;
  };

  // Fetch analytics data
  const { data: reportData, isLoading, refetch, error } = useQuery({
    queryKey: ['reports', reportType, dateRange.start, dateRange.end],
    queryFn: () => {
      if (!isValidDateRange()) {
        return Promise.reject(new Error('Invalid date range'));
      }
      return reportService.getAnalytics({ 
        start: dateRange.start, 
        end: dateRange.end, 
        type: reportType 
      });
    },
    retry: 1,
    onError: (err) => {
      console.error('Failed to fetch reports:', err);
      toast.error('Failed to load report data');
    }
  });

  // Export report with validation
  const exportReport = async (format) => {
    // Validate date range before export
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (start > end) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }

    setIsExporting(true);
    try {
      toast.loading(`Generating ${format.toUpperCase()} report...`, { id: 'export' });
      
      const blob = await reportService.exportReport({ 
        start: dateRange.start, 
        end: dateRange.end, 
        type: reportType, 
        format 
      });
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('No data to export');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${reportType}_report_${timestamp}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} report exported successfully!`, { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.message || `Failed to export ${format.toUpperCase()} report`, { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle date range change with validation
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // Handle report type change
  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  // Refresh data
  const handleRefresh = () => {
    if (isValidDateRange()) {
      refetch();
      toast.success('Data refreshed');
    }
  };

  // Revenue Chart Data
  const revenueChartData = {
    labels: reportData?.charts?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: reportData?.charts?.data || [65000, 78000, 82000, 95000, 88000, 105000],
      borderColor: 'rgb(79, 70, 229)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  // Complaint Chart Data
  const complaintChartData = {
    labels: reportData?.complaintLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Complaints',
        data: reportData?.newComplaints || [12, 19, 15, 17, 14, 10, 8],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Resolved',
        data: reportData?.resolvedComplaints || [10, 15, 12, 14, 12, 9, 7],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  // SLA Data
  const slaData = {
    labels: ['Within SLA', 'Breached'],
    datasets: [{
      data: [reportData?.stats?.slaCompliance || 85, reportData?.stats?.slaBreaches || 15],
      backgroundColor: ['#10B981', '#EF4444'],
      borderWidth: 0,
    }],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
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

  const stats = reportData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View insights and generate reports</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={isLoading}
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
          <button 
            onClick={() => exportReport('pdf')} 
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              max={dateRange.end || undefined}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={dateRange.start || undefined}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="overview">Overview</option>
              <option value="revenue">Revenue Report</option>
              <option value="complaints">Complaints Report</option>
              <option value="attendance">Attendance Report</option>
              <option value="performance">Performance Report</option>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.totalRevenue || 478000)}</p>
          <p className="text-xs text-green-600 mt-1">↑ 12% vs last period</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime || 24}h</p>
          <p className="text-xs text-green-600 mt-1">↓ 2h vs last period</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">SLA Compliance</p>
          <p className="text-2xl font-bold text-green-600">{stats.slaCompliance || 87}%</p>
          <p className="text-xs text-green-600 mt-1">↑ 5% vs last period</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600">Customer Satisfaction</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.csat || 4.2}/5</p>
          <p className="text-xs text-green-600 mt-1">↑ 0.3 vs last period</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Trends</h3>
          <div className="h-80">
            <Bar data={complaintChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Compliance</h3>
          <div className="h-64 flex justify-center">
            <Pie data={slaData} options={pieChartOptions} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Overall SLA Performance</p>
            <p className="text-xl font-bold text-gray-900">{stats.slaCompliance || 87}% Compliance</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Technicians</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.topTechnicians?.length > 0 ? (
              stats.topTechnicians.map((tech, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tech.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{tech.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{tech.completedTasks} tasks</p>
                    <p className="text-sm text-gray-500">⭐ {tech.rating}/5</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No technician data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
        <p>Data last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Showing data for {reportType.replace('_', ' ')} report</p>
      </div>
    </div>
  );
};

export default ReportsAnalytics;