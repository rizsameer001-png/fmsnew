// import React from 'react';
// import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

// const colorClasses = {
//   indigo: {
//     bg: 'bg-indigo-100',
//     text: 'text-indigo-600',
//     trendBg: 'bg-indigo-50',
//     trendText: 'text-indigo-600',
//   },
//   blue: {
//     bg: 'bg-blue-100',
//     text: 'text-blue-600',
//     trendBg: 'bg-blue-50',
//     trendText: 'text-blue-600',
//   },
//   red: {
//     bg: 'bg-red-100',
//     text: 'text-red-600',
//     trendBg: 'bg-red-50',
//     trendText: 'text-red-600',
//   },
//   green: {
//     bg: 'bg-green-100',
//     text: 'text-green-600',
//     trendBg: 'bg-green-50',
//     trendText: 'text-green-600',
//   },
//   yellow: {
//     bg: 'bg-yellow-100',
//     text: 'text-yellow-600',
//     trendBg: 'bg-yellow-50',
//     trendText: 'text-yellow-600',
//   },
//   purple: {
//     bg: 'bg-purple-100',
//     text: 'text-purple-600',
//     trendBg: 'bg-purple-50',
//     trendText: 'text-purple-600',
//   },
// };

// const StatsCard = ({ title, value, icon, trend, color = 'indigo' }) => {
//   const colors = colorClasses[color];

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600 font-medium">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//         </div>
//         <div className={`h-12 w-12 ${colors.bg} rounded-full flex items-center justify-center`}>
//           <div className={`${colors.text}`}>{icon}</div>
//         </div>
//       </div>
      
//       {trend && (
//         <div className="mt-4 flex items-center">
//           <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//             {trend.isPositive ? (
//               <ArrowTrendingUpIcon className="h-4 w-4" />
//             ) : (
//               <ArrowTrendingDownIcon className="h-4 w-4" />
//             )}
//             <span className="text-sm font-medium ml-1">{trend.value}%</span>
//           </div>
//           <span className="text-xs text-gray-500 ml-2">vs last period</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StatsCard;


import React from 'react';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const StatsCard = ({ title, value, icon, trend, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center space-x-1">
          {trend.isPositive ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;