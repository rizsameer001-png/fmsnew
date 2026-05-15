import React from 'react';
import ChartCard from './ChartCard';
import { formatCurrency } from '../../utils/formatters';

const RevenueChart = ({ data, isLoading, currency = 'INR' }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: data?.values || [65000, 78000, 82000, 95000, 88000, 105000, 112000, 108000, 125000, 132000, 128000, 145000],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    plugins: {
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
        },
        title: {
          display: true,
          text: 'Amount',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  const totalRevenue = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
  const averageRevenue = totalRevenue / chartData.datasets[0].data.length;
  const highestRevenue = Math.max(...chartData.datasets[0].data);
  const lowestRevenue = Math.min(...chartData.datasets[0].data);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Avg</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(averageRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400">Highest</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(highestRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">Lowest</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(lowestRevenue)}</p>
        </div>
      </div>

      <div className="h-80">
        <ChartCard type="line" data={chartData} options={options} loading={isLoading} />
      </div>
    </div>
  );
};

export default RevenueChart;