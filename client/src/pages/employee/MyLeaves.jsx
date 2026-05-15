//frontend/src/pages/employee/MyLeaves.jsx (For all employees)

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  XCircleIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import leaveService from '../../services/leave.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const MyLeaves = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const queryClient = useQueryClient();

  const { data: leavesData, isLoading } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: () => leaveService.getMyLeaves(),
  });

  const { data: balanceData } = useQuery({
    queryKey: ['leaveBalance'],
    queryFn: () => leaveService.getLeaveBalance(),
  });

  const applyMutation = useMutation({
    mutationFn: (data) => leaveService.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myLeaves']);
      queryClient.invalidateQueries(['leaveBalance']);
      setShowModal(false);
      setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      toast.success('Leave request submitted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => leaveService.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myLeaves']);
      queryClient.invalidateQueries(['leaveBalance']);
      toast.success('Leave request cancelled');
    },
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'earned', label: 'Earned Leave' },
    { value: 'annual', label: 'Annual Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'bereavement', label: 'Bereavement Leave' },
  ];

  const availableBalance = balanceData?.available || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Leaves</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Apply for leave and track your requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {leaveTypes.map((type) => (
          <div key={type.value} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{type.label}</p>
            <p className="text-2xl font-bold text-indigo-600">
              {availableBalance[type.value] || 0}
            </p>
            <p className="text-xs text-gray-400">days available</p>
          </div>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Leave Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
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
              ) : leavesData?.leaves?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No leave requests found</td>
                </tr>
              ) : (
                leavesData?.leaves?.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-mono text-sm">{leave.leaveNumber}</td>
                    <td className="px-6 py-4 capitalize">{leave.leaveType}</td>
                    <td className="px-6 py-4">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4">{leave.totalDays} days</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(leave.status)}`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'pending' && (
                        <button
                          onClick={() => cancelMutation.mutate(leave._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel Request"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' }); }} title="Apply for Leave" size="md">
        <form onSubmit={(e) => { e.preventDefault(); applyMutation.mutate(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type *</label>
            <select
              required
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Days: <span className="font-semibold">{calculateDays()} days</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
            <textarea
              rows={3}
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide reason for leave..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowModal(false); setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' }); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyLeaves;