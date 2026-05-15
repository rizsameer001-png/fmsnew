// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import { 
//   EyeIcon, 
//   CheckCircleIcon, 
//   ClockIcon,
//   MagnifyingGlassIcon,
//   FunnelIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import taskService from '../../services/task.service';
// import { formatDate, formatTime } from '../../utils/formatters';

// const MyTasks = () => {
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');

//   const queryClient = useQueryClient();

//   const { data: tasksData, isLoading } = useQuery({
//     queryKey: ['myTasks', filter],
//     queryFn: () => taskService.getMyTasks({ status: filter !== 'all' ? filter : undefined }),
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['myTasks']);
//       queryClient.invalidateQueries(['technicianDashboard']);
//       toast.success('Task status updated');
//     },
//   });

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//       assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       verified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   const getPriorityBadge = (priority) => {
//     const badges = {
//       low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     };
//     return badges[priority] || 'bg-gray-100 text-gray-800';
//   };

//   const filteredTasks = tasksData?.tasks?.filter(task =>
//     task.title?.toLowerCase().includes(search.toLowerCase()) ||
//     task.taskNumber?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     total: tasksData?.tasks?.length || 0,
//     pending: tasksData?.tasks?.filter(t => t.status === 'pending' || t.status === 'assigned').length || 0,
//     inProgress: tasksData?.tasks?.filter(t => t.status === 'in_progress').length || 0,
//     completed: tasksData?.tasks?.filter(t => t.status === 'completed').length || 0,
//   };

//   const filterOptions = [
//     { value: 'all', label: 'All Tasks', count: stats.total },
//     { value: 'assigned', label: 'Pending', count: stats.pending },
//     { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
//     { value: 'completed', label: 'Completed', count: stats.completed },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your assigned tasks</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {filterOptions.map((option) => (
//           <button
//             key={option.value}
//             onClick={() => setFilter(option.value)}
//             className={`p-4 rounded-xl text-center transition ${
//               filter === option.value
//                 ? 'bg-indigo-600 text-white shadow-lg'
//                 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
//             }`}
//           >
//             <p className="text-2xl font-bold">{option.count}</p>
//             <p className="text-sm mt-1">{option.label}</p>
//           </button>
//         ))}
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1 relative">
//             <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search tasks by title or number..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
//           <div className="flex space-x-2">
//             {['all', 'assigned', 'in_progress', 'completed'].map((status) => (
//               <button
//                 key={status}
//                 onClick={() => setFilter(status)}
//                 className={`px-4 py-2 rounded-lg capitalize transition ${
//                   filter === status
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 {status.replace('_', ' ')}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Tasks List */}
//       <div className="space-y-4">
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : filteredTasks?.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//             <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
//             <p className="text-sm text-gray-400 mt-2">All caught up! Great job 🎉</p>
//           </div>
//         ) : (
//           filteredTasks.map((task) => (
//             <div key={task._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
//               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
//                 <div className="flex-1">
//                   <div className="flex flex-wrap items-center gap-2 mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.taskNumber}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
//                       {task.priority?.toUpperCase()}
//                     </span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
//                       {task.status?.replace('_', ' ').toUpperCase()}
//                     </span>
//                   </div>
//                   <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>
//                   <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
//                   <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
//                     <span>📍 {task.location || 'Main Building'}</span>
//                     <span>📅 Due: {formatDate(task.scheduledDate)}</span>
//                     {task.estimatedDuration && <span>⏱️ Est: {task.estimatedDuration} min</span>}
//                   </div>
//                 </div>
//                 <div className="flex flex-col gap-2 min-w-[120px]">
//                   <Link
//                     to={`/technician/tasks/${task._id}`}
//                     className="flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
//                   >
//                     <EyeIcon className="h-4 w-4" />
//                     <span>View Details</span>
//                   </Link>
//                   {task.status === 'assigned' && (
//                     <button
//                       onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'in_progress' })}
//                       className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
//                     >
//                       <ClockIcon className="h-4 w-4" />
//                       <span>Start Task</span>
//                     </button>
//                   )}
//                   {task.status === 'in_progress' && (
//                     <button
//                       onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'completed' })}
//                       className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//                     >
//                       <CheckCircleIcon className="h-4 w-4" />
//                       <span>Mark Complete</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyTasks;

// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import { 
//   EyeIcon, 
//   CheckCircleIcon, 
//   ClockIcon,
//   MagnifyingGlassIcon,
//   ClipboardDocumentListIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import taskService from '../../services/task.service';
// import { formatDate } from '../../utils/formatters';

// const MyTasks = () => {
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');

//   const queryClient = useQueryClient();

//   const { data: tasksData, isLoading } = useQuery({
//     queryKey: ['myTasks', filter],
//     queryFn: () => taskService.getMyTasks({ status: filter !== 'all' ? filter : undefined }),
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['myTasks']);
//       queryClient.invalidateQueries(['technicianDashboard']);
//       toast.success('Task status updated');
//     },
//   });

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//       assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       verified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   const getPriorityBadge = (priority) => {
//     const badges = {
//       low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     };
//     return badges[priority] || 'bg-gray-100 text-gray-800';
//   };

//   // Safely access tasks array
//   const tasks = tasksData?.tasks || [];
  
//   const filteredTasks = tasks.filter(task =>
//     task.title?.toLowerCase().includes(search.toLowerCase()) ||
//     task.taskNumber?.toLowerCase().includes(search.toLowerCase())
//   );

//   const stats = {
//     total: tasks.length,
//     pending: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
//     inProgress: tasks.filter(t => t.status === 'in_progress').length,
//     completed: tasks.filter(t => t.status === 'completed').length,
//   };

//   const filterOptions = [
//     { value: 'all', label: 'All Tasks', count: stats.total },
//     { value: 'assigned', label: 'Pending', count: stats.pending },
//     { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
//     { value: 'completed', label: 'Completed', count: stats.completed },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your assigned tasks</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {filterOptions.map((option) => (
//           <button
//             key={option.value}
//             onClick={() => setFilter(option.value)}
//             className={`p-4 rounded-xl text-center transition ${
//               filter === option.value
//                 ? 'bg-indigo-600 text-white shadow-lg'
//                 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
//             }`}
//           >
//             <p className="text-2xl font-bold">{option.count}</p>
//             <p className="text-sm mt-1">{option.label}</p>
//           </button>
//         ))}
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1 relative">
//             <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search tasks by title or number..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
//           <div className="flex space-x-2">
//             {['all', 'assigned', 'in_progress', 'completed'].map((status) => (
//               <button
//                 key={status}
//                 onClick={() => setFilter(status)}
//                 className={`px-4 py-2 rounded-lg capitalize transition ${
//                   filter === status
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                 }`}
//               >
//                 {status.replace('_', ' ')}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Tasks List */}
//       <div className="space-y-4">
//         {filteredTasks.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//             <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
//             <p className="text-sm text-gray-400 mt-2">All caught up! Great job 🎉</p>
//           </div>
//         ) : (
//           filteredTasks.map((task) => (
//             <div key={task._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
//               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
//                 <div className="flex-1">
//                   <div className="flex flex-wrap items-center gap-2 mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.taskNumber}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
//                       {task.priority?.toUpperCase()}
//                     </span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
//                       {task.status?.replace('_', ' ').toUpperCase()}
//                     </span>
//                   </div>
//                   <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>
//                   <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
//                   <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
//                     <span>📍 {task.location || 'Main Building'}</span>
//                     <span>📅 Due: {formatDate(task.scheduledDate)}</span>
//                     {task.estimatedDuration && <span>⏱️ Est: {task.estimatedDuration} min</span>}
//                   </div>
//                 </div>
//                 <div className="flex flex-col gap-2 min-w-[120px]">
//                   <Link
//                     to={`/technician/tasks/${task._id}`}
//                     className="flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
//                   >
//                     <EyeIcon className="h-4 w-4" />
//                     <span>View Details</span>
//                   </Link>
//                   {task.status === 'assigned' && (
//                     <button
//                       onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'in_progress' })}
//                       className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
//                     >
//                       <ClockIcon className="h-4 w-4" />
//                       <span>Start Task</span>
//                     </button>
//                   )}
//                   {task.status === 'in_progress' && (
//                     <button
//                       onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'completed' })}
//                       className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//                     >
//                       <CheckCircleIcon className="h-4 w-4" />
//                       <span>Mark Complete</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyTasks;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon  // ⬅️ ADD THIS MISSING IMPORT
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import taskService from '../../services/task.service';
import { formatDate, formatTime } from '../../utils/formatters';

const MyTasks = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['myTasks', filter],
    queryFn: () => taskService.getMyTasks({ status: filter !== 'all' ? filter : undefined }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTasks']);
      queryClient.invalidateQueries(['technicianDashboard']);
      toast.success('Task status updated');
    },
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      verified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  // ⬇️⬇️⬇️ FIX: Add safety check for tasks array ⬇️⬇️⬇️
  const tasks = tasksData?.tasks || [];
  
  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(search.toLowerCase()) ||
    task.taskNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: stats.total },
    { value: 'assigned', label: 'Pending', count: stats.pending },
    { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { value: 'completed', label: 'Completed', count: stats.completed },
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your assigned tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`p-4 rounded-xl text-center transition ${
              filter === option.value
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{option.count}</p>
            <p className="text-sm mt-1">{option.label}</p>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'assigned', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            <p className="text-sm text-gray-400 mt-2">All caught up! Great job 🎉</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.taskNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                      {task.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
                      {task.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>📍 {task.location || 'Main Building'}</span>
                    <span>📅 Due: {formatDate(task.scheduledDate)}</span>
                    {task.estimatedDuration && <span>⏱️ Est: {task.estimatedDuration} min</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Link
                    to={`/technician/tasks/${task._id}`}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'in_progress' })}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span>Start Task</span>
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'completed' })}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;