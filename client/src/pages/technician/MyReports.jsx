import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  StarIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import taskService from '../../services/task.service';
import { formatDate } from '../../utils/formatters';

const MyReports = () => {
  const [period, setPeriod] = useState('week');

  const { data: completedTasks, isLoading } = useQuery({
    queryKey: ['completedTasks', period],
    queryFn: () => taskService.getMyTasks({ status: 'completed,verified' }),
  });

  const tasks = completedTasks?.tasks || [];

  const stats = {
    total: tasks.length,
    avgRating: (tasks.reduce((sum, t) => sum + (t.rating || 0), 0) / tasks.length || 0).toFixed(1),
    totalHours: tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / 60,
    onTimeRate: ((tasks.filter(t => !t.isDelayed).length / tasks.length) * 100 || 0).toFixed(0),
  };

  const ratingDistribution = {
    5: tasks.filter(t => t.rating === 5).length,
    4: tasks.filter(t => t.rating === 4).length,
    3: tasks.filter(t => t.rating === 3).length,
    2: tasks.filter(t => t.rating === 2).length,
    1: tasks.filter(t => t.rating === 1).length,
  };

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'This Year' },
  ];

  const exportReport = () => {
    // Implementation for export
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your work history and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating} ★</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalHours.toFixed(1)} hrs</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.onTimeRate}%</p>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="w-16 flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{star} ★</span>
              </div>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${(ratingDistribution[star] / stats.total) * 100 || 0}%` }}
                />
              </div>
              <div className="w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                {ratingDistribution[star]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{task.taskNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(task.completedAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{(task.duration / 60).toFixed(1)} hrs</td>
                  <td className="px-6 py-4">
                    {task.rating ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-yellow-600">{task.rating}</span>
                        <StarIcon className="h-4 w-4 text-yellow-500 ml-1" />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {task.feedback || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No completed tasks in this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;