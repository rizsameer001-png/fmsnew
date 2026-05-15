import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import leaveService from '../../services/leave.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const LeaveManagement = () => {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('pending');

  const queryClient = useQueryClient();

  const { data: leavesData, isLoading, refetch } = useQuery({
    queryKey: ['teamLeaves', filter],
    queryFn: () => leaveService.getTeamLeaves({ status: filter !== 'all' ? filter : undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => leaveService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamLeaves']);
      queryClient.invalidateQueries(['leaveStats']);
      setShowModal(false);
      toast.success('Leave request approved');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => leaveService.rejectLeave(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamLeaves']);
      queryClient.invalidateQueries(['leaveStats']);
      setShowModal(false);
      toast.success('Leave request rejected');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['leaveStats'],
    queryFn: () => leaveService.getLeaveStats(),
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      earned: 'Earned Leave',
      annual: 'Annual Leave',
      emergency: 'Emergency Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
    };
    return labels[type] || type;
  };

  const stats = statsData?.stats || [];
  const leaves = leavesData?.leaves || [];

  const filterOptions = [
    { value: 'pending', label: 'Pending', count: leavesData?.stats?.pending || 0 },
    { value: 'approved', label: 'Approved', count: leavesData?.stats?.approved || 0 },
    { value: 'rejected', label: 'Rejected', count: leavesData?.stats?.rejected || 0 },
    { value: 'all', label: 'All', count: leavesData?.stats?.total || 0 },
  ];

  const handleReject = (leave) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectMutation.mutate({ id: leave._id, reason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage employee leave requests
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Leaves</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.reduce((sum, s) => sum + s.count, 0)}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.find(s => s._id === 'pending')?.count || 0}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.find(s => s._id === 'approved')?.count || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.find(s => s._id === 'rejected')?.count || 0}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
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
            {option.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No leave requests found</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{leave.userName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{leave.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{getLeaveTypeLabel(leave.leaveType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4 font-medium">{leave.totalDays} days</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(leave.status)}`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(leave._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(leave)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Details Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedLeave(null); }} title="Leave Request Details" size="lg">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedLeave.userName}</p>
                  <p className="text-sm text-gray-500">{selectedLeave.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Leave Type</p>
                  <p className="font-semibold capitalize">{getLeaveTypeLabel(selectedLeave.leaveType)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p>{formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Days</p>
                  <p className="font-semibold">{selectedLeave.totalDays} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedLeave.status)}`}>
                    {selectedLeave.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Applied On</p>
                  <p>{formatDate(selectedLeave.createdAt)}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{selectedLeave.reason}</p>
            </div>

            {selectedLeave.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">Rejection Reason</p>
                <p className="text-red-700 dark:text-red-300 mt-1">{selectedLeave.rejectionReason}</p>
              </div>
            )}

            {selectedLeave.approvedByName && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400">Approved By</p>
                <p className="text-green-700 dark:text-green-300 mt-1">{selectedLeave.approvedByName}</p>
                <p className="text-xs text-green-500 mt-1">Approved on: {formatDate(selectedLeave.approvedAt)}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedLeave.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) rejectMutation.mutate({ id: selectedLeave._id, reason });
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveMutation.mutate(selectedLeave._id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                onClick={() => { setShowModal(false); setSelectedLeave(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagement;