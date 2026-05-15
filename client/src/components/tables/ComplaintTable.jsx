import React from 'react';
import DataTable from './DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ComplaintTable = ({ complaints, isLoading, pagination, onView, onAssign, onStatusChange }) => {
  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'complaintNumber', header: 'Complaint #', sortable: true, width: '120px' },
    { key: 'title', header: 'Title', sortable: true },
    { 
      key: 'customerId', 
      header: 'Customer', 
      render: (value) => value?.name || 'N/A',
      sortable: true 
    },
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(value)}`}>
          {value?.toUpperCase()}
        </span>
      ),
      sortable: true 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value) => <StatusBadge status={value} />,
      sortable: true 
    },
    { 
      key: 'assignedTo', 
      header: 'Assigned To', 
      render: (value) => value?.name || 'Unassigned' 
    },
    { 
      key: 'createdAt', 
      header: 'Created', 
      render: (value) => formatDate(value),
      sortable: true 
    },
    {
      key: 'slaBreached',
      header: 'SLA',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {value ? 'Breached' : 'On Track'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => onView(row)} 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            title="View Details"
          >
            View
          </button>
          {onAssign && (
            <button 
              onClick={() => onAssign(row)} 
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
              title="Assign Technician"
            >
              Assign
            </button>
          )}
          {onStatusChange && (
            <button 
              onClick={() => onStatusChange(row)} 
              className="text-green-600 hover:text-green-800 dark:text-green-400"
              title="Update Status"
            >
              Status
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={complaints}
      isLoading={isLoading}
      pagination={pagination}
      onRowClick={onView}
      emptyMessage="No complaints found"
    />
  );
};

export default ComplaintTable;