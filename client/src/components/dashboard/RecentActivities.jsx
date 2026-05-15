// import React from 'react';
// import { formatDistanceToNow } from 'date-fns';

// const activityIcons = {
//   complaint: 'bg-red-100 text-red-600',
//   task: 'bg-blue-100 text-blue-600',
//   attendance: 'bg-green-100 text-green-600',
//   payment: 'bg-yellow-100 text-yellow-600',
//   user: 'bg-purple-100 text-purple-600',
// };

// const activityLabels = {
//   complaint: 'New Complaint',
//   task: 'Task Update',
//   attendance: 'Attendance',
//   payment: 'Payment',
//   user: 'User Action',
// };

// const RecentActivities = ({ activities }) => {
//   const defaultActivities = [
//     {
//       id: 1,
//       type: 'complaint',
//       title: 'New complaint from John Doe',
//       description: 'Electrical issue in Building A',
//       time: new Date(Date.now() - 1000 * 60 * 5),
//       user: 'John Doe',
//     },
//     {
//       id: 2,
//       type: 'task',
//       title: 'Task completed',
//       description: 'Plumbing repair in Floor 3',
//       time: new Date(Date.now() - 1000 * 60 * 30),
//       user: 'Mike Smith',
//     },
//     {
//       id: 3,
//       type: 'attendance',
//       title: 'Late check-in',
//       description: 'Arrived 15 minutes late',
//       time: new Date(Date.now() - 1000 * 60 * 60),
//       user: 'Sarah Johnson',
//     },
//     {
//       id: 4,
//       type: 'payment',
//       title: 'Payment received',
//       description: 'Invoice #INV-2024-001',
//       time: new Date(Date.now() - 1000 * 60 * 60 * 2),
//       user: 'ABC Corp',
//     },
//   ];

//   const displayActivities = activities.length > 0 ? activities : defaultActivities;

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
//         <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
//       </div>
      
//       <div className="space-y-4">
//         {displayActivities.slice(0, 5).map((activity) => (
//           <div key={activity.id} className="flex items-start space-x-3">
//             <div className={`flex-shrink-0 h-8 w-8 rounded-full ${activityIcons[activity.type] || activityIcons.complaint} flex items-center justify-center`}>
//               <div className="h-2 w-2 rounded-full bg-current"></div>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-gray-900">
//                 {activity.title}
//               </p>
//               <p className="text-xs text-gray-500">
//                 {activity.description} • {activity.user}
//               </p>
//               <p className="text-xs text-gray-400 mt-1">
//                 {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RecentActivities;


//14 may
import React from 'react';
import { ClockIcon, UserIcon, ChatBubbleLeftRightIcon, BuildingOfficeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const RecentActivities = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'user': return <UserIcon className="h-4 w-4 text-blue-500" />;
      case 'complaint': return <ChatBubbleLeftRightIcon className="h-4 w-4 text-red-500" />;
      case 'building': return <BuildingOfficeIcon className="h-4 w-4 text-green-500" />;
      case 'resolution': return <CheckCircleIcon className="h-4 w-4 text-purple-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'user': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'complaint': return 'bg-red-50 dark:bg-red-900/20';
      case 'building': return 'bg-green-50 dark:bg-green-900/20';
      case 'resolution': return 'bg-purple-50 dark:bg-purple-900/20';
      default: return 'bg-gray-50 dark:bg-gray-700';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
      <div className="space-y-3">
        {activities.slice(0, 10).map((activity, idx) => (
          <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg ${getActivityColor(activity.type)}`}>
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">{activity.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.user} • {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;