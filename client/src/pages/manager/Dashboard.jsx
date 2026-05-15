import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import dashboardService from '../../services/dashboard.service';
import StatsCard from '../../components/dashboard/StatsCard';
import { formatCurrency } from '../../utils/formatters';

const ManagerDashboard = () => {
  const [dateRange, setDateRange] = useState('week');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['managerDashboard', dateRange],
    queryFn: () => dashboardService.getManagerStats(dateRange),
  });

  const stats = dashboardData?.stats || {};
  const charts = dashboardData?.charts || {};

  const performanceData = {
    labels: charts.performanceLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Complaints Resolved',
        data: charts.resolvedData || [12, 19, 15, 17, 14, 10],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: 'Tasks Completed',
        data: charts.tasksData || [8, 12, 10, 14, 11, 9],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const slaData = {
    labels: charts.slaLabels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'SLA Compliance %',
        data: charts.slaData || [92, 88, 94, 90],
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your team's performance and building metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Team Members"
          value={stats.teamMembers || 0}
          icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />}
          trend={{ value: 8, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Open Complaints"
          value={stats.openComplaints || 0}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-red-600" />}
          trend={{ value: 12, isPositive: false }}
          color="red"
        />
        <StatsCard
          title="Active Tasks"
          value={stats.activeTasks || 0}
          icon={<ClockIcon className="h-8 w-8 text-yellow-600" />}
          trend={{ value: 5, isPositive: true }}
          color="yellow"
        />
        <StatsCard
          title="SLA Compliance"
          value={`${stats.slaCompliance || 94}%`}
          icon={<CheckBadgeIcon className="h-8 w-8 text-green-600" />}
          trend={{ value: 3, isPositive: true }}
          color="green"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Attendance</p>
              <p className="text-2xl font-bold">{stats.todayAttendance || 42}/{stats.teamMembers || 50}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(stats.todayAttendance / stats.teamMembers) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold">{stats.avgResponseTime || 2.5} hrs</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">↓ 0.5 hrs vs last week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer Satisfaction</p>
              <p className="text-2xl font-bold">{stats.csat || 4.6}/5</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 0.3 vs last month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-80">
            <Line data={performanceData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Compliance Trend</h3>
          <div className="h-80">
            <Bar data={slaData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {dashboardData?.recentComplaints?.map((complaint) => (
              <div key={complaint._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{complaint.title}</p>
                  <p className="text-sm text-gray-500">{complaint.customerName} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {complaint.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {dashboardData?.upcomingTasks?.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">Assigned to: {task.assignedTo} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;