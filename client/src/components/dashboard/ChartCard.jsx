import React from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

const ChartCard = ({ 
  title, 
  type = 'line', 
  data, 
  options = {}, 
  height = 300,
  className = '',
  onRefresh,
  loading = false 
}) => {
  const chartComponents = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
  };

  const ChartComponent = chartComponents[type] || Line;

  const defaultOptions = {
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
        mode: 'index',
        intersect: false,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            disabled={loading}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div style={{ height: `${height}px` }}>
          <ChartComponent data={data} options={mergedOptions} />
        </div>
      )}
    </div>
  );
};

export default ChartCard;