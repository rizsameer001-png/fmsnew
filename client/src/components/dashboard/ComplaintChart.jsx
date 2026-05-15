import React from 'react';
import ChartCard from './ChartCard';

const ComplaintChart = ({ data, isLoading, timeRange = 'week', onTimeRangeChange }) => {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Complaints',
        data: data?.new || [12, 19, 15, 17, 14, 10, 8],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Resolved',
        data: data?.resolved || [10, 15, 12, 14, 12, 9, 7],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Complaints',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Day',
        },
      },
    },
  };

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complaint Trends</h3>
        <div className="flex space-x-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange?.(option.value)}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                timeRange === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <ChartCard type="bar" data={chartData} options={options} loading={isLoading} />
      </div>
    </div>
  );
};

export default ComplaintChart;