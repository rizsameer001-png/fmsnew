// import React, { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { 
//   UsersIcon, 
//   BuildingOfficeIcon, 
//   ChatBubbleLeftRightIcon,
//   CurrencyDollarIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   ClockIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   MapPinIcon
// } from '@heroicons/react/24/outline';
// import { Line, Bar, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import dashboardService from '../../services/dashboard.service';
// import StatsCard from '../../components/dashboard/StatsCard';
// import RecentActivities from '../../components/dashboard/RecentActivities';
// import TechnicianStatus from '../../components/dashboard/TechnicianStatus';
// import LiveMap from '../../components/dashboard/LiveMap';
// import { formatCurrency, formatDate } from '../../utils/formatters';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const AdminDashboard = () => {
//   const [dateRange, setDateRange] = useState('week');
//   const [selectedBuilding, setSelectedBuilding] = useState('all');

//   // Fetch dashboard data
//   const { data: dashboardData, isLoading, refetch } = useQuery({
//     queryKey: ['adminDashboard', dateRange, selectedBuilding],
//     queryFn: () => dashboardService.getAdminStats(dateRange, selectedBuilding),
//     refetchInterval: 30000, // Refresh every 30 seconds
//   });

//   const stats = dashboardData?.stats || {};
//   const charts = dashboardData?.charts || {};
//   const recentData = dashboardData?.recent || {};

//   // Revenue Chart Data
//   const revenueChartData = {
//     labels: charts.revenueLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     datasets: [
//       {
//         label: 'Revenue',
//         data: charts.revenueData || [65000, 78000, 82000, 95000, 88000, 105000],
//         borderColor: 'rgb(79, 70, 229)',
//         backgroundColor: 'rgba(79, 70, 229, 0.1)',
//         fill: true,
//         tension: 0.4,
//       },
//     ],
//   };

//   // Complaint Trends Chart Data
//   const complaintChartData = {
//     labels: charts.complaintLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [
//       {
//         label: 'New Complaints',
//         data: charts.complaintData || [12, 19, 15, 17, 14, 10, 8],
//         backgroundColor: 'rgba(239, 68, 68, 0.5)',
//         borderColor: 'rgb(239, 68, 68)',
//         borderWidth: 1,
//       },
//       {
//         label: 'Resolved',
//         data: charts.resolvedData || [10, 15, 12, 14, 12, 9, 7],
//         backgroundColor: 'rgba(16, 185, 129, 0.5)',
//         borderColor: 'rgb(16, 185, 129)',
//         borderWidth: 1,
//       },
//     ],
//   };

//   // SLA Compliance Doughnut Chart
//   const slaChartData = {
//     labels: ['Within SLA', 'Breached SLA'],
//     datasets: [
//       {
//         data: [stats.slaCompliance || 85, stats.slaBreaches || 15],
//         backgroundColor: ['#10B981', '#EF4444'],
//         borderWidth: 0,
//       },
//     ],
//   };

//   const slaChartOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: {
//         position: 'bottom',
//       },
//     },
//   };

//   const lineChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             let label = context.dataset.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (context.parsed.y !== null) {
//               label += new Intl.NumberFormat('en-IN', {
//                 style: 'currency',
//                 currency: 'INR',
//                 minimumFractionDigits: 0,
//               }).format(context.parsed.y);
//             }
//             return label;
//           }
//         }
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: function(value) {
//             return '₹' + value.toLocaleString();
//           }
//         }
//       }
//     }
//   };

//   const barChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           stepSize: 5,
//         }
//       }
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your facility today.</p>
//         </div>
//         <div className="flex space-x-3">
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="today">Today</option>
//             <option value="week">This Week</option>
//             <option value="month">This Month</option>
//             <option value="year">This Year</option>
//           </select>
//           <button
//             onClick={() => refetch()}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard
//           title="Total Users"
//           value={stats.totalUsers || 0}
//           icon={<UsersIcon className="h-8 w-8 text-indigo-600" />}
//           trend={{ value: 12, isPositive: true }}
//           color="indigo"
//         />
//         <StatsCard
//           title="Total Buildings"
//           value={stats.totalBuildings || 0}
//           icon={<BuildingOfficeIcon className="h-8 w-8 text-blue-600" />}
//           trend={{ value: 5, isPositive: true }}
//           color="blue"
//         />
//         <StatsCard
//           title="Active Complaints"
//           value={stats.activeComplaints || 0}
//           icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-red-600" />}
//           trend={{ value: 8, isPositive: false }}
//           color="red"
//         />
//         <StatsCard
//           title="Revenue (Month)"
//           value={formatCurrency(stats.monthlyRevenue || 0)}
//           icon={<CurrencyDollarIcon className="h-8 w-8 text-green-600" />}
//           trend={{ value: 23, isPositive: true }}
//           color="green"
//         />
//       </div>

//       {/* Second Row Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Attendance Rate</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate || 94}%</p>
//             </div>
//             <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
//               <CheckCircleIcon className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.attendanceRate || 94}%` }}></div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">SLA Compliance</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.slaCompliance || 87}%</p>
//             </div>
//             <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
//               <ClockIcon className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.slaCompliance || 87}%` }}></div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Urgent Complaints</p>
//               <p className="text-2xl font-bold text-red-600">{stats.urgentComplaints || 7}</p>
//             </div>
//             <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
//               <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Active Technicians</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.activeTechnicians || 45}</p>
//             </div>
//             <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
//               <MapPinIcon className="h-6 w-6 text-purple-600" />
//             </div>
//           </div>
//           <div className="flex items-center mt-2">
//             <div className="flex -space-x-2">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white"></div>
//               ))}
//             </div>
//             <span className="text-xs text-gray-500 ml-2">+{stats.activeTechnicians - 5} online</span>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Revenue Chart */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
//             <div className="flex space-x-2">
//               <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Weekly</button>
//               <button className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">Monthly</button>
//             </div>
//           </div>
//           <div className="h-80">
//             <Line data={revenueChartData} options={lineChartOptions} />
//           </div>
//         </div>

//         {/* Complaint Trends */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Trends</h3>
//           <div className="h-80">
//             <Bar data={complaintChartData} options={barChartOptions} />
//           </div>
//         </div>
//       </div>

//       {/* Second Row Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* SLA Compliance */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Compliance</h3>
//           <div className="h-64">
//             <Doughnut data={slaChartData} options={slaChartOptions} />
//           </div>
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-600">Average Resolution Time</p>
//             <p className="text-xl font-bold text-gray-900">{stats.avgResolutionTime || 24} hours</p>
//           </div>
//         </div>

//         {/* Live Technician Map */}
//         <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Technician Tracking</h3>
// {/*          <div className="h-80">
//             <LiveMap />
//           </div>*/}
//         </div>
//       </div>

//       {/* Recent Activities & Technician Status */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <RecentActivities activities={recentData.activities || []} />
//         <TechnicianStatus technicians={recentData.technicians || []} />
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import dashboardService from '../../services/dashboard.service';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivities from '../../components/dashboard/RecentActivities';
import TechnicianStatus from '../../components/dashboard/TechnicianStatus';
import { formatCurrency } from '../../utils/formatters';

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

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('week');

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch, error } = useQuery({
    queryKey: ['adminDashboard', dateRange],
    queryFn: () => dashboardService.getAdminStats(dateRange),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = dashboardData?.stats || {};
  const charts = dashboardData?.charts || {};

  // Revenue Chart Data
  const revenueChartData = {
    labels: charts.revenueLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: charts.revenueData || [65000, 78000, 82000, 95000, 88000, 105000, 112000, 125000, 118000, 135000, 142000, 158000],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Complaint Trends Chart Data
  const complaintChartData = {
    labels: charts.complaintLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Complaints',
        data: charts.complaintData || [12, 19, 15, 17, 14, 10, 8],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Resolved',
        data: charts.resolvedData || [10, 15, 12, 14, 12, 9, 7],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // SLA Compliance Doughnut Chart
  const slaChartData = {
    labels: ['Within SLA', 'Breached SLA'],
    datasets: [
      {
        data: [stats.slaCompliance || 85, 100 - (stats.slaCompliance || 85)],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const slaChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toLocaleString('en-IN');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          stepSize: 5,
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Failed to load dashboard data</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your facility today.
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<UsersIcon className="h-8 w-8" />}
          trend={{ value: 12, isPositive: true }}
          color="indigo"
        />
        <StatsCard
          title="Total Buildings"
          value={stats.totalBuildings || 0}
          icon={<BuildingOfficeIcon className="h-8 w-8" />}
          trend={{ value: 5, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Complaints"
          value={stats.activeComplaints || stats.pendingComplaints || 0}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
          trend={{ value: 8, isPositive: false }}
          color="red"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue || stats.totalRevenue || 0)}
          icon={<CurrencyDollarIcon className="h-8 w-8" />}
          trend={{ value: 23, isPositive: true }}
          color="green"
        />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate || 94}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.attendanceRate || 94}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">SLA Compliance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.slaCompliance || 87}%</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.slaCompliance || 87}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Urgent Complaints</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgentComplaints || stats.highPriorityComplaints || 0}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Technicians</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTechnicians || 0}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <MapPinIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(5, stats.activeTechnicians || 0))].map((_, i) => (
                <div key={i} className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              +{Math.max(0, (stats.activeTechnicians || 0) - 5)} online
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <div className="flex space-x-2">
              <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">Weekly</button>
              <button className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Monthly</button>
            </div>
          </div>
          <div className="h-80">
            <Line data={revenueChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Complaint Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complaint Trends</h3>
          <div className="h-80">
            <Bar data={complaintChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SLA Compliance</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={slaChartData} options={slaChartOptions} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Resolution Time</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.avgResolutionTime || 24} hours</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-2">
          <RecentActivities activities={dashboardData?.recentActivities || []} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Data last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Dashboard refreshes automatically every 30 seconds</p>
      </div>
    </div>
  );
};

export default AdminDashboard;