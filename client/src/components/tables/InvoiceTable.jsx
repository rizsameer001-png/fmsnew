import React from 'react';
import DataTable from './DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InvoiceTable = ({ invoices, isLoading, pagination, onView, onDownload, onPay }) => {
  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, width: '130px' },
    { 
      key: 'customerId', 
      header: 'Customer', 
      render: (value) => value?.name || 'N/A',
      sortable: true 
    },
    { 
      key: 'totalAmount', 
      header: 'Amount', 
      render: (value) => formatCurrency(value),
      sortable: true 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (value) => <StatusBadge status={value} />,
      sortable: true 
    },
    { 
      key: 'issueDate', 
      header: 'Issue Date', 
      render: (value) => formatDate(value),
      sortable: true 
    },
    { 
      key: 'dueDate', 
      header: 'Due Date', 
      render: (value) => formatDate(value),
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
          <button 
            onClick={() => onDownload(row)} 
            className="text-green-600 hover:text-green-800 dark:text-green-400"
            title="Download PDF"
          >
            PDF
          </button>
          {row.status !== 'paid' && onPay && (
            <button 
              onClick={() => onPay(row)} 
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              title="Pay Now"
            >
              Pay
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      pagination={pagination}
      onRowClick={onView}
      emptyMessage="No invoices found"
    />
  );
};

export default InvoiceTable;