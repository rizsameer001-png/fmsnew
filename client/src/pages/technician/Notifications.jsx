// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { BellIcon, CheckCircleIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import notificationService from '../../services/notification.service';
// import { formatRelativeTime } from '../../utils/formatters';

// const TechnicianNotifications = () => {
//   const [filter, setFilter] = useState('all');

//   const queryClient = useQueryClient();

//   const { data: notificationsData, isLoading } = useQuery({
//     queryKey: ['notifications'],
//     queryFn: () => notificationService.getNotifications(),
//   });

//   const markAsReadMutation = useMutation({
//     mutationFn: (id) => notificationService.markAsRead(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['notifications']);
//       queryClient.invalidateQueries(['unreadCount']);
//       toast.success('Marked as read');
//     },
//   });

//   const markAllAsReadMutation = useMutation({
//     mutationFn: () => notificationService.markAllAsRead(),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['notifications']);
//       toast.success('All notifications marked as read');
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id) => notificationService.deleteNotification(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['notifications']);
//       toast.success('Notification deleted');
//     },
//   });

//   const getTypeIcon = (type) => {
//     const icons = {
//       task: '📋',
//       complaint: '💬',
//       attendance: '⏰',
//       approval: '✓',
//       system: '🔔',
//       emergency: '🚨',
//     };
//     return icons[type] || '📢';
//   };

//   const getTypeColor = (type) => {
//     const colors = {
//       task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       complaint: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       attendance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       approval: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//       system: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//       emergency: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//     };
//     return colors[type] || 'bg-gray-100 text-gray-800';
//   };

//   const filteredNotifications = notificationsData?.notifications?.filter(n => 
//     filter === 'all' || n.type === filter
//   );

//   const unreadCount = notificationsData?.notifications?.filter(n => !n.isRead).length || 0;

//   const filterOptions = [
//     { value: 'all', label: 'All' },
//     { value: 'task', label: 'Tasks' },
//     { value: 'attendance', label: 'Attendance' },
//     { value: 'system', label: 'System' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with your tasks and alerts</p>
//         </div>
//         {unreadCount > 0 && (
//           <button
//             onClick={() => markAllAsReadMutation.mutate()}
//             className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
//           >
//             Mark All Read ({unreadCount})
//           </button>
//         )}
//       </div>

//       {/* Filter Tabs */}
//       <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
//         {filterOptions.map((option) => (
//           <button
//             key={option.value}
//             onClick={() => setFilter(option.value)}
//             className={`px-4 py-2 rounded-lg capitalize transition ${
//               filter === option.value
//                 ? 'bg-indigo-600 text-white'
//                 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//             }`}
//           >
//             {option.label}
//           </button>
//         ))}
//       </div>

//       {/* Notifications List */}
//       <div className="space-y-3">
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : filteredNotifications?.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//             <BellIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">No notifications</p>
//             <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
//           </div>
//         ) : (
//           filteredNotifications.map((notification) => (
//             <div
//               key={notification._id}
//               className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition ${
//                 !notification.isRead ? 'border-l-4 border-indigo-600' : ''
//               }`}
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex items-start space-x-3 flex-1">
//                   <div className={`h-10 w-10 rounded-full ${getTypeColor(notification.type)} flex items-center justify-center text-xl`}>
//                     {getTypeIcon(notification.type)}
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
//                     <p className="text-gray-600 dark:text-gray-400 mt-1">{notification.body}</p>
//                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
//                       {formatRelativeTime(notification.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                   {!notification.isRead && (
//                     <button
//                       onClick={() => markAsReadMutation.mutate(notification._id)}
//                       className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
//                       title="Mark as read"
//                     >
//                       <CheckCircleIcon className="h-5 w-5" />
//                     </button>
//                   )}
//                   <button
//                     onClick={() => deleteMutation.mutate(notification._id)}
//                     className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
//                     title="Delete"
//                   >
//                     <TrashIcon className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default TechnicianNotifications;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import notificationService from '../../services/notification.service';
import { formatRelativeTime } from '../../utils/formatters';

const TechnicianNotifications = () => {
  const [filter, setFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
      toast.success('Marked as read');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification deleted');
    },
  });

  const getTypeIcon = (type) => {
    const icons = {
      task: '📋',
      complaint: '💬',
      attendance: '⏰',
      approval: '✓',
      system: '🔔',
      emergency: '🚨',
    };
    return icons[type] || '📢';
  };

  const getTypeColor = (type) => {
    const colors = {
      task: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      complaint: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      attendance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      approval: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      system: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      emergency: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // ✅ FIX: Safely access notifications array
  const notifications = notificationsData?.notifications || [];
  
  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'task', label: 'Tasks' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'system', label: 'System' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with your tasks and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <BellIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 transition ${
                !notification.isRead ? 'border-l-4 border-indigo-600' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`h-10 w-10 rounded-full ${getTypeColor(notification.type)} flex items-center justify-center text-xl`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{notification.body}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification._id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                      title="Mark as read"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(notification._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TechnicianNotifications;