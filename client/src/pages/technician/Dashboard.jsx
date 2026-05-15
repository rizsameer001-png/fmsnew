// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import { 
//   ClipboardDocumentListIcon, 
//   ClockIcon, 
//   CheckCircleIcon,
//   MapPinIcon,
//   BellIcon,
//   StarIcon,
//   ArrowTrendingUpIcon
// } from '@heroicons/react/24/outline';
// import dashboardService from '../../services/dashboard.service';
// import taskService from '../../services/task.service';
// import attendanceService from '../../services/attendance.service';
// import notificationService from '../../services/notification.service';  // ⬅️ ADD THIS MISSING IMPORT
// import StatsCard from '../../components/dashboard/StatsCard';
// import { formatDate, formatTime } from '../../utils/formatters';

// const TechnicianDashboard = () => {
//   const { data: stats, isLoading: statsLoading } = useQuery({
//     queryKey: ['technicianDashboard'],
//     queryFn: () => dashboardService.getTechnicianStats(),
//   });

//   const { data: todayTasks, isLoading: tasksLoading } = useQuery({
//     queryKey: ['todayTasks'],
//     queryFn: () => taskService.getMyTasks({ status: 'assigned,in_progress' }),
//   });

//   const { data: todayAttendance } = useQuery({
//     queryKey: ['todayAttendance'],
//     queryFn: () => attendanceService.getTodayStatus(),
//   });

//   const { data: notifications } = useQuery({
//     queryKey: ['recentNotifications'],
//     queryFn: () => notificationService.getNotifications({ limit: 5 }),
//   });

//   const statsData = stats || {};
//   const attendance = todayAttendance || {};
//   const tasks = todayTasks?.tasks || [];

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good Morning';
//     if (hour < 17) return 'Good Afternoon';
//     return 'Good Evening';
//   };

//   return (
//     <div className="space-y-6">
//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-2xl font-bold">{getGreeting()}, {statsData?.name || 'Technician'}!</h1>
//             <p className="text-indigo-100 mt-1">Here's your work summary for today</p>
//             <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-indigo-100">
//               <div className="flex items-center space-x-2">
//                 <ClockIcon className="h-4 w-4" />
//                 <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <MapPinIcon className="h-4 w-4" />
//                 <span>{statsData?.buildingName || 'Main Building'}</span>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
//             {statsData?.technicianType || 'Technician'}
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard
//           title="Assigned Tasks"
//           value={statsData?.assignedTasks || 0}
//           icon={<ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />}
//           color="blue"
//         />
//         <StatsCard
//           title="In Progress"
//           value={statsData?.inProgressTasks || 0}
//           icon={<ClockIcon className="h-8 w-8 text-yellow-600" />}
//           color="yellow"
//         />
//         <StatsCard
//           title="Completed Today"
//           value={statsData?.completedToday || 0}
//           icon={<CheckCircleIcon className="h-8 w-8 text-green-600" />}
//           trend={{ value: 2, isPositive: true }}
//           color="green"
//         />
//         <StatsCard
//           title="Rating"
//           value={`${statsData?.rating || 4.8} ★`}
//           icon={<StarIcon className="h-8 w-8 text-purple-600" />}
//           color="purple"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Today's Tasks */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
//             <Link to="/technician/tasks" className="text-indigo-600 text-sm hover:text-indigo-700">
//               View All →
//             </Link>
//           </div>
          
//           {tasks.length === 0 ? (
//             <div className="text-center py-8">
//               <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
//               <p className="text-gray-500">No tasks assigned for today!</p>
//               <p className="text-sm text-gray-400 mt-1">Enjoy your day 🎉</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {tasks.slice(0, 5).map((task) => (
//                 <Link key={task._id} to={`/technician/tasks/${task._id}`}>
//                   <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
//                     <div>
//                       <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {task.scheduledTime || 'Flexible'} • {task.location || 'Building A'}
//                       </p>
//                     </div>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                       task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
//                       task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
//                       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                     }`}>
//                       {task.priority?.toUpperCase() || 'MEDIUM'}
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Today's Attendance */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Attendance</h3>
//             <Link to="/technician/attendance" className="text-indigo-600 text-sm hover:text-indigo-700">
//               View History →
//             </Link>
//           </div>
          
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Check In</p>
//                 <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                   {attendance.checkIn ? formatTime(attendance.checkIn) : '--:--'}
//                 </p>
//               </div>
//               <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Check Out</p>
//                 <p className="text-xl font-bold text-red-600 dark:text-red-400">
//                   {attendance.checkOut ? formatTime(attendance.checkOut) : '--:--'}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//               <span className="text-gray-600 dark:text-gray-400">Total Hours</span>
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {attendance.totalHours?.toFixed(1) || '0'} hours
//               </span>
//             </div>
            
//             {!attendance.checkIn && (
//               <Link
//                 to="/technician/attendance"
//                 className="block w-full text-center py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//               >
//                 Mark Attendance
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Performance Stats & Notifications */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Weekly Performance */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Performance</h3>
//           <div className="space-y-3">
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Tasks Completed</span>
//                 <span className="font-medium">{statsData?.weeklyCompleted || 12}/20</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Attendance Rate</span>
//                 <span className="font-medium">{statsData?.attendanceRate || 95}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${statsData?.attendanceRate || 95}%` }}></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Customer Rating</span>
//                 <span className="font-medium">{statsData?.avgRating || 4.8} ★</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Notifications */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notifications</h3>
//             <Link to="/technician/notifications" className="text-indigo-600 text-sm hover:text-indigo-700">
//               View All →
//             </Link>
//           </div>
          
//           {notifications?.notifications?.length === 0 ? (
//             <div className="text-center py-8">
//               <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//               <p className="text-gray-500">No new notifications</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {notifications?.notifications?.slice(0, 3).map((notif) => (
//                 <div key={notif._id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <BellIcon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-sm text-gray-900 dark:text-white">{notif.title}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.body}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Emergency Button */}
//       <div className="fixed bottom-6 right-6 z-20">
//         <Link
//           to="/technician/emergency"
//           className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition animate-pulse"
//         >
//           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>Emergency</span>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default TechnicianDashboard;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon,
  MapPinIcon,
  BellIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboard.service';
import taskService from '../../services/task.service';
import attendanceService from '../../services/attendance.service';
import notificationService from '../../services/notification.service';  // ⬅️ ADD THIS MISSING IMPORT
import StatsCard from '../../components/dashboard/StatsCard';
import { formatDate, formatTime } from '../../utils/formatters';

const TechnicianDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['technicianDashboard'],
    queryFn: () => dashboardService.getTechnicianStats(),
  });

  const { data: todayTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: () => taskService.getMyTasks({ status: 'assigned,in_progress' }),
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceService.getTodayStatus(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: () => notificationService.getNotifications({ limit: 5 }),  // ⬅️ Now works with import
  });

  const statsData = stats || {};
  const attendance = todayAttendance || {};
  const tasks = todayTasks?.tasks || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (statsLoading || tasksLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{getGreeting()}, {statsData?.name || 'Technician'}!</h1>
            <p className="text-indigo-100 mt-1">Here's your work summary for today</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-indigo-100">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>{statsData?.buildingName || 'Main Building'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
            {statsData?.technicianType || 'Technician'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Assigned Tasks"
          value={statsData?.assignedTasks || 0}
          icon={<ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={statsData?.inProgressTasks || 0}
          icon={<ClockIcon className="h-8 w-8 text-yellow-600" />}
          color="yellow"
        />
        <StatsCard
          title="Completed Today"
          value={statsData?.completedToday || 0}
          icon={<CheckCircleIcon className="h-8 w-8 text-green-600" />}
          trend={{ value: 2, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Rating"
          value={`${statsData?.rating || 4.8} ★`}
          icon={<StarIcon className="h-8 w-8 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
            <Link to="/technician/tasks" className="text-indigo-600 text-sm hover:text-indigo-700">
              View All →
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No tasks assigned for today!</p>
              <p className="text-sm text-gray-400 mt-1">Enjoy your day 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <Link key={task._id} to={`/technician/tasks/${task._id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.scheduledTime || 'Flexible'} • {task.location || 'Building A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {task.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Attendance</h3>
            <Link to="/technician/attendance" className="text-indigo-600 text-sm hover:text-indigo-700">
              View History →
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Check In</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {attendance.checkIn ? formatTime(attendance.checkIn) : '--:--'}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Check Out</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {attendance.checkOut ? formatTime(attendance.checkOut) : '--:--'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Hours</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {attendance.totalHours?.toFixed(1) || '0'} hours
              </span>
            </div>
            
            {!attendance.checkIn && (
              <Link
                to="/technician/attendance"
                className="block w-full text-center py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Mark Attendance
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Performance Stats & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tasks Completed</span>
                <span className="font-medium">{statsData?.weeklyCompleted || 12}/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Attendance Rate</span>
                <span className="font-medium">{statsData?.attendanceRate || 95}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${statsData?.attendanceRate || 95}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Customer Rating</span>
                <span className="font-medium">{statsData?.avgRating || 4.8} ★</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notifications</h3>
            <Link to="/technician/notifications" className="text-indigo-600 text-sm hover:text-indigo-700">
              View All →
            </Link>
          </div>
          
          {!notifications?.notifications || notifications.notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.notifications.slice(0, 3).map((notif) => (
                <div key={notif._id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BellIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Link
          to="/technician/emergency"
          className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition animate-pulse"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Emergency</span>
        </Link>
      </div>
    </div>
  );
};

export default TechnicianDashboard;