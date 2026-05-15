import React from 'react';
import DataTable from './DataTable';
import { getStatusBadgeClass, formatDate } from '../../utils/formatters';

const UserTable = ({ users, isLoading, pagination, onEdit, onDelete, onView }) => {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'super_admin' ? 'bg-purple-100 text-purple-800' :
          value === 'manager' ? 'bg-blue-100 text-blue-800' :
          value === 'supervisor' ? 'bg-green-100 text-green-800' :
          value === 'technician' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={getStatusBadgeClass(value ? 'active' : 'inactive')}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'createdAt', header: 'Joined', render: (value) => formatDate(value) },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button onClick={() => onView(row)} className="text-blue-600 hover:text-blue-800">
            View
          </button>
          <button onClick={() => onEdit(row)} className="text-green-600 hover:text-green-800">
            Edit
          </button>
          <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      pagination={pagination}
    />
  );
};

export default UserTable;