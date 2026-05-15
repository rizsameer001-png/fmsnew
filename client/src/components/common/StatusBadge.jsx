import React from 'react';

const StatusBadge = ({ status, type = 'default', size = 'md' }) => {
  const getStatusConfig = () => {
    const configs = {
      // Complaint statuses
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Pending' },
      assigned: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Assigned' },
      in_progress: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 text-gray-300', label: 'Closed' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Rejected' },
      escalated: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'Escalated' },
      
      // Priority
      low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Urgent' },
      
      // Task status
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Completed' },
      verified: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: 'Verified' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Cancelled' },
      
      // Attendance
      present: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Present' },
      absent: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Absent' },
      late: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Late' },
      half_day: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'Half Day' },
      leave: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Leave' },
      
      // Invoice
      paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Paid' },
      overdue: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Overdue' },
      sent: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Sent' },
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 text-gray-300', label: 'Draft' },
      
      // User status
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 text-gray-300', label: 'Inactive' },
      
      // Default
      default: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 text-gray-300', label: status || 'Unknown' },
    };
    
    return configs[status?.toLowerCase()] || configs.default;
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizes[size]} ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;