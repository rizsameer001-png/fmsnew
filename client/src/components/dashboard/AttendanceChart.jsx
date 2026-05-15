import React from 'react';
import ChartCard from './ChartCard';

const AttendanceChart = ({ data, isLoading, onDateChange }) => {
  const chartData = {
    labels: data?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Present',
        data: data?.present || [85, 88, 82, 90],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Late',
        data: data?.late || [8, 6, 10, 5],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Absent',
        data: data?.absent || [7, 6, 8, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Period',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
  };

  const averageAttendance = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0) / chartData.datasets[0].data.length;
  const averageLate = chartData.datasets[1].data.reduce((sum, val) => sum + val, 0) / chartData.datasets[1].data.length;
  const averageAbsent = chartData.datasets[2].data.reduce((sum, val) => sum + val, 0) / chartData.datasets[2].data.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Overview</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => onDateChange?.('week')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
          >
            Week
          </button>
          <button 
            onClick={() => onDateChange?.('month')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
          >
            Month
          </button>
          <button 
            onClick={() => onDateChange?.('quarter')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400">Avg Present</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{averageAttendance.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Avg Late</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{averageLate.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">Avg Absent</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{averageAbsent.toFixed(1)}%</p>
        </div>
      </div>

      <div className="h-80">
        <ChartCard type="bar" data={chartData} options={options} loading={isLoading} />
      </div>
    </div>
  );
};

export default AttendanceChart;