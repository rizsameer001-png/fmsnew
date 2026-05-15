import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import approvalService from '../../services/approval.service';
import { formatDate } from '../../utils/formatters';

const ApprovalManagement = () => {
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data: approvalsData, isLoading } = useQuery({ queryKey: ['approvals', filter], queryFn: () => approvalService.getApprovals({ status: filter }) });

  const approveMutation = useMutation({ mutationFn: ({ id, comments }) => approvalService.processApproval(id, 'approved', comments), onSuccess: () => { queryClient.invalidateQueries(['approvals']); toast.success('Request approved'); } });
  const rejectMutation = useMutation({ mutationFn: ({ id, comments }) => approvalService.processApproval(id, 'rejected', comments), onSuccess: () => { queryClient.invalidateQueries(['approvals']); toast.success('Request rejected'); } });

  const getTypeIcon = (type) => {
    const icons = { leave: '🏖️', overtime: '⏰', complaint_closure: '✅', expense: '💰', purchase: '🛒' };
    return icons[type] || '📋';
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Approval Management</h1><p className="text-gray-600">Review and process pending requests</p></div>

      <div className="flex space-x-2 border-b"><button onClick={() => setFilter('pending')} className={`px-4 py-2 ${filter === 'pending' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Pending ({approvalsData?.pendingCount || 0})</button><button onClick={() => setFilter('approved')} className={`px-4 py-2 ${filter === 'approved' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Approved</button><button onClick={() => setFilter('rejected')} className={`px-4 py-2 ${filter === 'rejected' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Rejected</button></div>

      <div className="space-y-4">
        {approvalsData?.approvals?.map((request) => (
          <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4"><div className="text-2xl">{getTypeIcon(request.type)}</div><div><div className="flex items-center space-x-2"><h3 className="font-semibold text-gray-900">{request.type.replace('_', ' ').toUpperCase()}</h3><span className={`px-2 py-1 rounded-full text-xs font-semibold ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{request.status}</span></div><p className="text-sm text-gray-600 mt-1">{request.details?.reason || 'No description provided'}</p><div className="flex space-x-4 mt-2 text-xs text-gray-500"><span>Requested by: {request.requestedBy?.name}</span><span>Date: {formatDate(request.createdAt)}</span><span>Level: {request.currentLevel}/{request.approvals?.length}</span></div></div></div>
              {request.status === 'pending' && (<div className="flex space-x-2"><button onClick={() => { const comments = prompt('Add comments (optional):'); approveMutation.mutate({ id: request._id, comments }); }} className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"><CheckCircleIcon className="h-4 w-4" /><span>Approve</span></button><button onClick={() => { const comments = prompt('Reason for rejection:'); if (comments) rejectMutation.mutate({ id: request._id, comments }); }} className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"><XCircleIcon className="h-4 w-4" /><span>Reject</span></button></div>)}
            </div>
            {request.approvals?.map((approval, idx) => (<div key={idx} className="mt-3 pl-8 border-l-2 border-gray-200"><div className="flex items-center space-x-2 text-sm"><span className="font-medium">Level {approval.level}:</span><span>{approval.approverName || 'Pending'}</span>{approval.status === 'approved' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}{approval.status === 'rejected' && <XCircleIcon className="h-4 w-4 text-red-600" />}{approval.status === 'pending' && <ClockIcon className="h-4 w-4 text-yellow-600" />}</div>{approval.comments && <p className="text-xs text-gray-500 mt-1">Comment: {approval.comments}</p>}</div>))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalManagement;