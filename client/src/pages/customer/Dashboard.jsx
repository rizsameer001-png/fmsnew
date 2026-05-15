import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  CreditCardIcon, 
  ClockIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboard.service';
import complaintService from '../../services/complaint.service';
import invoiceService from '../../services/invoice.service';
import StatsCard from '../../components/dashboard/StatsCard';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['customerDashboard'],
    queryFn: () => dashboardService.getCustomerStats(),
  });

  const { data: recentComplaints } = useQuery({
    queryKey: ['recentComplaints'],
    queryFn: () => complaintService.getComplaints({ limit: 5 }),
  });

  const { data: recentInvoices } = useQuery({
    queryKey: ['recentInvoices'],
    queryFn: () => invoiceService.getMyInvoices({ limit: 5 }),
  });

  const statsData = stats || {};
  const complaints = recentComplaints?.complaints || [];
  const invoices = recentInvoices?.invoices || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getInvoiceStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{getGreeting()}, {statsData?.name || 'Valued Customer'}!</h1>
            <p className="text-indigo-100 mt-1">Welcome to your Facility Management Portal</p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-indigo-100">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>{statsData?.buildingName || 'Your Building'}</span>
            </div>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
            {statsData?.membership || 'Standard Member'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Complaints"
          value={statsData?.activeComplaints || 0}
          icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-yellow-600" />}
          color="yellow"
        />
        <StatsCard
          title="Resolved Complaints"
          value={statsData?.resolvedComplaints || 0}
          icon={<CheckCircleIcon className="h-8 w-8 text-green-600" />}
          trend={{ value: 12, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Pending Payments"
          value={formatCurrency(statsData?.pendingAmount || 0)}
          icon={<CreditCardIcon className="h-8 w-8 text-red-600" />}
          color="red"
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(statsData?.totalSpent || 0)}
          icon={<ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />}
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/customer/raise-complaint"
          className="flex items-center justify-center space-x-2 p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span>Raise Complaint</span>
        </Link>
        <Link
          to="/customer/request-service"
          className="flex items-center justify-center space-x-2 p-4 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition dark:hover:bg-indigo-900/20"
        >
          <BuildingOfficeIcon className="h-5 w-5" />
          <span>Request Service</span>
        </Link>
      </div>

      {/* Recent Complaints & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Complaints</h3>
            <Link to="/customer/complaints" className="text-indigo-600 text-sm hover:text-indigo-700">
              View All →
            </Link>
          </div>
          
          {complaints.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No active complaints</p>
              <p className="text-sm text-gray-400 mt-1">Everything looks good!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => (
                <Link key={complaint._id} to={`/customer/complaints/${complaint._id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{complaint.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(complaint.createdAt)} • {complaint.complaintNumber}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(complaint.status)}`}>
                      {complaint.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
            <Link to="/customer/invoices" className="text-indigo-600 text-sm hover:text-indigo-700">
              View All →
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No invoices available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Link key={invoice._id} to={`/customer/invoices/${invoice._id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getInvoiceStatusBadge(invoice.status)}`}>
                        {invoice.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Need Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Our support team is available 24/7</p>
          </div>
          <Link
            to="/customer/chat"
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>Chat with Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;