
// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { 
//   ArrowPathIcon, 
//   ArrowDownTrayIcon, 
//   FunnelIcon,
//   UserIcon,
//   ClockIcon,
//   ComputerDesktopIcon,
//   EyeIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import reportService from '../../services/report.service';
// import { formatDateTime } from '../../utils/formatters';

// const ActivityLogs = () => {
//   const [filters, setFilters] = useState({
//     action: '',
//     userId: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20
//   });

//   // Fetch activity logs
//   const { data: logsData, isLoading, refetch, isError } = useQuery({
//     queryKey: ['activityLogs', filters],
//     queryFn: () => reportService.getActivityLogs(filters),
//     enabled: true,
//   });

//   const getActionBadge = (action) => {
//     const badges = {
//       LOGIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//       REGISTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       CREATE_USER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
//       UPDATE_USER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       DELETE_USER: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       CREATE_COMPLAINT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//       UPDATE_COMPLAINT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       CREATE_TASK: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
//       UPDATE_TASK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
//       CHECK_IN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
//       CHECK_OUT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
//       PAYMENT: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
//       CREATE_BUILDING: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
//       UPDATE_BUILDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
//       DELETE_BUILDING: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
//     };
//     return badges[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//   };

//   const getEntityTypeIcon = (entityType) => {
//     const icons = {
//       user: <UserIcon className="h-4 w-4" />,
//       building: <BuildingOfficeIcon className="h-4 w-4" />,
//       complaint: <ChatBubbleLeftRightIcon className="h-4 w-4" />,
//       task: <ClipboardDocumentListIcon className="h-4 w-4" />,
//       attendance: <ClockIcon className="h-4 w-4" />,
//       invoice: <DocumentTextIcon className="h-4 w-4" />,
//       payment: <CreditCardIcon className="h-4 w-4" />,
//       service: <WrenchScrewdriverIcon className="h-4 w-4" />,
//       report: <DocumentTextIcon className="h-4 w-4" />,
//       setting: <Cog6ToothIcon className="h-4 w-4" />,
//     };
//     return icons[entityType] || <DocumentTextIcon className="h-4 w-4" />;
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       action: '',
//       userId: '',
//       startDate: '',
//       endDate: '',
//       page: 1,
//       limit: 20
//     });
//   };

//   const handlePageChange = (newPage) => {
//     setFilters(prev => ({ ...prev, page: newPage }));
//     window.scrollTo(0, 0);
//   };

//   const exportLogs = async () => {
//     try {
//       const blob = await reportService.exportReport({
//         type: 'activity-logs',
//         startDate: filters.startDate,
//         endDate: filters.endDate,
//         format: 'excel'
//       });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `activity_logs_${Date.now()}.xlsx`;
//       a.click();
//       toast.success('Logs exported successfully');
//     } catch (error) {
//       console.error('Export failed:', error);
//       toast.error('Failed to export logs');
//     }
//   };

//   const actionOptions = [
//     { value: '', label: 'All Actions' },
//     { value: 'LOGIN', label: 'Login' },
//     { value: 'LOGOUT', label: 'Logout' },
//     { value: 'REGISTER', label: 'Register' },
//     { value: 'CREATE_USER', label: 'Create User' },
//     { value: 'UPDATE_USER', label: 'Update User' },
//     { value: 'DELETE_USER', label: 'Delete User' },
//     { value: 'CREATE_COMPLAINT', label: 'Create Complaint' },
//     { value: 'UPDATE_COMPLAINT', label: 'Update Complaint' },
//     { value: 'CREATE_TASK', label: 'Create Task' },
//     { value: 'UPDATE_TASK', label: 'Update Task' },
//     { value: 'CHECK_IN', label: 'Check In' },
//     { value: 'CHECK_OUT', label: 'Check Out' },
//     { value: 'PAYMENT', label: 'Payment' },
//   ];

//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96">
//         <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
//         <p className="text-gray-600">Failed to load activity logs</p>
//         <button 
//           onClick={() => refetch()}
//           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   const logs = logsData?.logs || [];
//   const total = logsData?.total || 0;
//   const totalPages = logsData?.totalPages || 1;
//   const currentPage = logsData?.currentPage || 1;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Audit trail of all system activities
//           </p>
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => refetch()}
//             disabled={isLoading}
//             className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//           >
//             <ArrowPathIcon className="h-4 w-4" />
//             <span>Refresh</span>
//           </button>
//           <button
//             onClick={exportLogs}
//             className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             <ArrowDownTrayIcon className="h-4 w-4" />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Action
//             </label>
//             <select
//               value={filters.action}
//               onChange={(e) => handleFilterChange('action', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
//             >
//               {actionOptions.map(opt => (
//                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               User ID
//             </label>
//             <input
//               type="text"
//               placeholder="User ID or Email"
//               value={filters.userId}
//               onChange={(e) => handleFilterChange('userId', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange('startDate', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               End Date
//             </label>
//             <input
//               type="date"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange('endDate', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div className="flex items-end">
//             <button
//               onClick={handleClearFilters}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Total Logs</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
//             </div>
//             <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Page</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage} / {totalPages}</p>
//             </div>
//           </div>
//           <div className="text-sm text-gray-500 dark:text-gray-400">
//             Showing {logs.length} of {total} records
//           </div>
//         </div>
//       </div>

//       {/* Logs Table */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : logs.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-400 text-lg mb-2">No activity logs found</div>
//             <p className="text-gray-500 text-sm">Try adjusting your filters</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Timestamp
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Action
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Entity
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     IP Address
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {logs.map((log) => (
//                   <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center">
//                         <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
//                         {formatDateTime(log.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
//                           <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900 dark:text-white">
//                             {log.userName || log.userId?.name || 'System'}
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">
//                             {log.userRole || log.userId?.role || 'System'}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
//                         {log.action}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center space-x-1">
//                         {getEntityTypeIcon(log.entityType)}
//                         <span className="capitalize">{log.entityType}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
//                       <div className="truncate">
//                         {log.details ? (
//                           <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-1 rounded">
//                             {JSON.stringify(log.details, null, 2).substring(0, 100)}
//                             {JSON.stringify(log.details, null, 2).length > 100 ? '...' : ''}
//                           </pre>
//                         ) : (
//                           '-'
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center">
//                         <ComputerDesktopIcon className="h-4 w-4 mr-1" />
//                         {log.ipAddress || '-'}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center space-x-2">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-1">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActivityLogs;


// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { 
//   RefreshIcon, 
//   DownloadIcon, 
//   UserIcon,
//   ClockIcon,
//   ComputerDesktopIcon,
//   ExclamationTriangleIcon,
//   BuildingOfficeIcon,
//   ChatBubbleLeftRightIcon,
//   ClipboardDocumentListIcon,
//   DocumentTextIcon,
//   CreditCardIcon,
//   WrenchScrewdriverIcon,
//   Cog6ToothIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import reportService from '../../services/report.service';
// import { formatDateTime } from '../../utils/formatters';

// const ActivityLogs = () => {
//   const [filters, setFilters] = useState({
//     action: '',
//     userId: '',
//     startDate: '',
//     endDate: '',
//     page: 1,
//     limit: 20
//   });

//   // Fetch activity logs
//   const { data: logsData, isLoading, refetch, isError } = useQuery({
//     queryKey: ['activityLogs', filters],
//     queryFn: () => reportService.getActivityLogs(filters),
//     enabled: true,
//   });

//   const getActionBadge = (action) => {
//     const badges = {
//       LOGIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//       REGISTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       CREATE_USER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
//       UPDATE_USER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       DELETE_USER: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       CREATE_COMPLAINT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//       UPDATE_COMPLAINT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       CREATE_TASK: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
//       UPDATE_TASK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
//       CHECK_IN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
//       CHECK_OUT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
//       PAYMENT: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
//       CREATE_BUILDING: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
//       UPDATE_BUILDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
//       DELETE_BUILDING: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
//     };
//     return badges[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//   };

//   const getEntityTypeIcon = (entityType) => {
//     const icons = {
//       user: <UserIcon className="h-4 w-4" />,
//       building: <BuildingOfficeIcon className="h-4 w-4" />,
//       complaint: <ChatBubbleLeftRightIcon className="h-4 w-4" />,
//       task: <ClipboardDocumentListIcon className="h-4 w-4" />,
//       attendance: <ClockIcon className="h-4 w-4" />,
//       invoice: <DocumentTextIcon className="h-4 w-4" />,
//       payment: <CreditCardIcon className="h-4 w-4" />,
//       service: <WrenchScrewdriverIcon className="h-4 w-4" />,
//       report: <DocumentTextIcon className="h-4 w-4" />,
//       setting: <Cog6ToothIcon className="h-4 w-4" />,
//     };
//     return icons[entityType] || <DocumentTextIcon className="h-4 w-4" />;
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       action: '',
//       userId: '',
//       startDate: '',
//       endDate: '',
//       page: 1,
//       limit: 20
//     });
//   };

//   const handlePageChange = (newPage) => {
//     setFilters(prev => ({ ...prev, page: newPage }));
//     window.scrollTo(0, 0);
//   };

//   const exportLogs = async () => {
//     try {
//       const blob = await reportService.exportReport({
//         type: 'activity-logs',
//         startDate: filters.startDate,
//         endDate: filters.endDate,
//         format: 'excel'
//       });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `activity_logs_${Date.now()}.xlsx`;
//       a.click();
//       toast.success('Logs exported successfully');
//     } catch (error) {
//       console.error('Export failed:', error);
//       toast.error('Failed to export logs');
//     }
//   };

//   const actionOptions = [
//     { value: '', label: 'All Actions' },
//     { value: 'LOGIN', label: 'Login' },
//     { value: 'LOGOUT', label: 'Logout' },
//     { value: 'REGISTER', label: 'Register' },
//     { value: 'CREATE_USER', label: 'Create User' },
//     { value: 'UPDATE_USER', label: 'Update User' },
//     { value: 'DELETE_USER', label: 'Delete User' },
//     { value: 'CREATE_COMPLAINT', label: 'Create Complaint' },
//     { value: 'UPDATE_COMPLAINT', label: 'Update Complaint' },
//     { value: 'CREATE_TASK', label: 'Create Task' },
//     { value: 'UPDATE_TASK', label: 'Update Task' },
//     { value: 'CHECK_IN', label: 'Check In' },
//     { value: 'CHECK_OUT', label: 'Check Out' },
//     { value: 'PAYMENT', label: 'Payment' },
//   ];

//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96">
//         <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
//         <p className="text-gray-600">Failed to load activity logs</p>
//         <button 
//           onClick={() => refetch()}
//           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   const logs = logsData?.logs || [];
//   const total = logsData?.total || 0;
//   const totalPages = logsData?.totalPages || 1;
//   const currentPage = logsData?.currentPage || 1;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Audit trail of all system activities
//           </p>
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => refetch()}
//             disabled={isLoading}
//             className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//           >
//             <RefreshIcon className="h-4 w-4" />
//             <span>Refresh</span>
//           </button>
//           <button
//             onClick={exportLogs}
//             className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             <DownloadIcon className="h-4 w-4" />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Action
//             </label>
//             <select
//               value={filters.action}
//               onChange={(e) => handleFilterChange('action', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
//             >
//               {actionOptions.map(opt => (
//                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               User ID
//             </label>
//             <input
//               type="text"
//               placeholder="User ID or Email"
//               value={filters.userId}
//               onChange={(e) => handleFilterChange('userId', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange('startDate', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               End Date
//             </label>
//             <input
//               type="date"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange('endDate', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
//             />
//           </div>
//           <div className="flex items-end">
//             <button
//               onClick={handleClearFilters}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Total Logs</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
//             </div>
//             <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
//             <div>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Page</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage} / {totalPages}</p>
//             </div>
//           </div>
//           <div className="text-sm text-gray-500 dark:text-gray-400">
//             Showing {logs.length} of {total} records
//           </div>
//         </div>
//       </div>

//       {/* Logs Table */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : logs.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-400 text-lg mb-2">No activity logs found</div>
//             <p className="text-gray-500 text-sm">Try adjusting your filters</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Timestamp
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Action
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Entity
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     IP Address
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {logs.map((log) => (
//                   <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center">
//                         <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
//                         {formatDateTime(log.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
//                           <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-gray-900 dark:text-white">
//                             {log.userName || log.userId?.name || 'System'}
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">
//                             {log.userRole || log.userId?.role || 'System'}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
//                         {log.action}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center space-x-1">
//                         {getEntityTypeIcon(log.entityType)}
//                         <span className="capitalize">{log.entityType}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
//                       <div className="truncate">
//                         {log.details ? (
//                           <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-1 rounded">
//                             {JSON.stringify(log.details, null, 2).substring(0, 100)}
//                             {JSON.stringify(log.details, null, 2).length > 100 ? '...' : ''}
//                           </pre>
//                         ) : (
//                           '-'
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                       <div className="flex items-center">
//                         <ComputerDesktopIcon className="h-4 w-4 mr-1" />
//                         {log.ipAddress || '-'}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             <tr>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center space-x-2">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Previous
//           </button>
//           <span className="px-4 py-1">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActivityLogs;



import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowPathIcon,
  ArrowDownTrayIcon,
  UserIcon,
  ClockIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import reportService from '../../services/report.service';
import { formatDateTime } from '../../utils/formatters';

const ActivityLogs = () => {
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });

  // Fetch activity logs
  const { data: logsData, isLoading, refetch, isError } = useQuery({
    queryKey: ['activityLogs', filters],
    queryFn: () => reportService.getActivityLogs(filters),
    enabled: true,
  });

  const getActionBadge = (action) => {
    const badges = {
      LOGIN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      REGISTER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      CREATE_USER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      UPDATE_USER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      DELETE_USER: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      CREATE_COMPLAINT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      UPDATE_COMPLAINT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      CREATE_TASK: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      UPDATE_TASK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      CHECK_IN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      CHECK_OUT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      PAYMENT: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
      CREATE_BUILDING: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
      UPDATE_BUILDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      DELETE_BUILDING: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return badges[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getEntityTypeIcon = (entityType) => {
    const icons = {
      user: <UserIcon className="h-4 w-4" />,
      building: <BuildingOfficeIcon className="h-4 w-4" />,
      complaint: <ChatBubbleLeftRightIcon className="h-4 w-4" />,
      task: <ClipboardDocumentListIcon className="h-4 w-4" />,
      attendance: <ClockIcon className="h-4 w-4" />,
      invoice: <DocumentTextIcon className="h-4 w-4" />,
      payment: <CreditCardIcon className="h-4 w-4" />,
      service: <WrenchScrewdriverIcon className="h-4 w-4" />,
      report: <DocumentTextIcon className="h-4 w-4" />,
      setting: <Cog6ToothIcon className="h-4 w-4" />,
    };
    return icons[entityType] || <DocumentTextIcon className="h-4 w-4" />;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const exportLogs = async () => {
    try {
      const blob = await reportService.exportReport({
        type: 'activity-logs',
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: 'excel'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${Date.now()}.xlsx`;
      a.click();
      toast.success('Logs exported successfully');
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export logs');
    }
  };

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'REGISTER', label: 'Register' },
    { value: 'CREATE_USER', label: 'Create User' },
    { value: 'UPDATE_USER', label: 'Update User' },
    { value: 'DELETE_USER', label: 'Delete User' },
    { value: 'CREATE_COMPLAINT', label: 'Create Complaint' },
    { value: 'UPDATE_COMPLAINT', label: 'Update Complaint' },
    { value: 'CREATE_TASK', label: 'Create Task' },
    { value: 'UPDATE_TASK', label: 'Update Task' },
    { value: 'CHECK_IN', label: 'Check In' },
    { value: 'CHECK_OUT', label: 'Check Out' },
    { value: 'PAYMENT', label: 'Payment' },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">Failed to load activity logs</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.totalPages || 1;
  const currentPage = logsData?.currentPage || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Audit trail of all system activities
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
            >
              {actionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="User ID or Email"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage} / {totalPages}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {logs.length} of {total} records
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No activity logs found</div>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
                          <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.userName || log.userId?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {log.userRole || log.userId?.role || 'System'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        {getEntityTypeIcon(log.entityType)}
                        <span className="capitalize">{log.entityType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                      <div className="truncate">
                        {log.details ? (
                          <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-1 rounded">
                            {JSON.stringify(log.details, null, 2).substring(0, 100)}
                            {JSON.stringify(log.details, null, 2).length > 100 ? '...' : ''}
                          </pre>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="h-4 w-4 mr-1" />
                        {log.ipAddress || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;