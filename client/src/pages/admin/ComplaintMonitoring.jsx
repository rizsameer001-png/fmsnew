import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import complaintService from '../../services/complaint.service';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ComplaintMonitoring = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ['complaints', filters],
    queryFn: () => complaintService.getComplaints(filters),
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      escalated: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Monitoring</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold">{complaintsData?.total || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{complaintsData?.stats?.pending || 0}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{complaintsData?.stats?.resolved || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA Breached</p>
              <p className="text-2xl font-bold text-red-600">{complaintsData?.stats?.slaBreached || 0}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaintsData?.complaints?.map((complaint) => (
          <div key={complaint._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{complaint.complaintNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h4 className="text-md font-medium text-gray-800 mt-2">{complaint.title}</h4>
                <p className="text-gray-600 mt-1">{complaint.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>Customer: {complaint.customerId?.name}</span>
                  <span>Created: {formatDate(complaint.createdAt)}</span>
                  {complaint.assignedTo && <span>Assigned to: {complaint.assignedTo.name}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(complaint)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Complaint Number</label>
                    <p className="font-medium">{selectedComplaint.complaintNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Priority</label>
                    <p className={`font-medium ${getPriorityColor(selectedComplaint.priority)} inline-block px-2 py-1 rounded-full text-xs`}>
                      {selectedComplaint.priority.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Title</label>
                  <p className="font-medium">{selectedComplaint.title}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="text-gray-700">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Customer</label>
                    <p>{selectedComplaint.customerId?.name}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.customerId?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Assigned To</label>
                    <p>{selectedComplaint.assignedTo?.name || 'Not Assigned'}</p>
                    <p className="text-sm text-gray-500">{selectedComplaint.assignedTo?.technicianType || ''}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Created At</label>
                    <p>{formatDateTime(selectedComplaint.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">SLA Deadline</label>
                    <p className={selectedComplaint.slaBreached ? 'text-red-600' : 'text-green-600'}>
                      {formatDateTime(selectedComplaint.slaDeadline)}
                    </p>
                  </div>
                </div>
                
                {selectedComplaint.resolution && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-green-800">Resolution</label>
                    <p className="text-green-700 mt-1">{selectedComplaint.resolution.description}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Resolved on: {formatDateTime(selectedComplaint.resolution.resolvedAt)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Assign Technician
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintMonitoring;