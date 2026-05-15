import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import paymentService from '../../services/payment.service';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const PaymentHistory = () => {
  const [filter, setFilter] = useState('all');

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  const getStatusBadge = (status) => {
    const badges = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const stats = {
    total: payments?.payments?.length || 0,
    totalAmount: payments?.payments?.reduce((sum, p) => sum + (p.status === 'success' ? p.amount : 0), 0) || 0,
    successful: payments?.payments?.filter(p => p.status === 'success').length || 0,
  };

  const filteredPayments = payments?.payments?.filter(p => filter === 'all' || p.method === filter);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'razorpay', label: 'Cards' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View all your past transactions</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Successful Payments</p>
          <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
        </div>
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

      {/* Payments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredPayments?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payment history found</p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getStatusIcon(payment.status)}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice: {payment.invoiceId?.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(payment.paymentDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                    {payment.status?.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{payment.method}</p>
                  {payment.transactionId && (
                    <p className="text-xs text-gray-400 mt-1">ID: {payment.transactionId.slice(-8)}</p>
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

export default PaymentHistory;