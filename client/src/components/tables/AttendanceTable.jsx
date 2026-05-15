import React from 'react';
import DataTable from './DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatTime } from '../../utils/formatters';

const AttendanceTable = ({ attendance, isLoading, pagination, onApprove, onView }) => {
  const columns = [
    { 
      key: 'userId', 
      header: 'Employee', 
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value?.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{value?.email}</div>
        </div>
      ),
      sortable: true 
    },
    { 
      key: 'date', 
      header: 'Date', 
      render: (value) => formatDate(value),
      sortable: true 
    },
    { 
      key: 'checkIn', 
      header: 'Check In', 
      render: (value) => value?.time ? formatTime(value.time) : '-',
      sortable: true 
    },
    { 
      key: 'checkOut', 
      header: 'Check Out', 
      render: (value) => value?.time ? formatTime(value.time) : '-',
      sortable: true 
    },
    { 
      key: 'totalHours', 
      header: 'Hours', 
      render: (value) => value?.toFixed(1) || '-',
      sortable: true 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value) => <StatusBadge status={value} />,
      sortable: true 
    },
    { 
      key: 'lateMinutes', 
      header: 'Late', 
      render: (value) => value ? `${value} min` : '-',
      sortable: true 
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
          {onApprove && row.status === 'late' && (
            <button 
              onClick={() => onApprove(row)} 
              className="text-green-600 hover:text-green-800 dark:text-green-400"
              title="Approve Late"
            >
              Approve
            </button>
          )}
        </div>
      )
    }
  ];

  const summary = {
    total: attendance?.length || 0,
    present: attendance?.filter(a => a.status === 'present').length || 0,
    absent: attendance?.filter(a => a.status === 'absent').length || 0,
    late: attendance?.filter(a => a.status === 'late').length || 0,
    onLeave: attendance?.filter(a => a.status === 'leave').length || 0,
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 dark:text-green-400">Present</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{summary.present}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 dark:text-red-400">Absent</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{summary.absent}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Late</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{summary.late}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400">On Leave</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.onLeave}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={attendance}
        isLoading={isLoading}
        pagination={pagination}
        onRowClick={onView}
        emptyMessage="No attendance records found"
      />
    </div>
  );
};

export default AttendanceTable;