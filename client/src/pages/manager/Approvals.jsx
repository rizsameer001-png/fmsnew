import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import approvalService from '../../services/approval.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const Approvals = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState('');

  const queryClient = useQueryClient();
  const { data: approvalsData } = useQuery({ queryKey: ['approvals'], queryFn: () => approvalService.getApprovals({ status: 'pending' }) });

  const approveMutation = useMutation({ mutationFn: ({ id, comments }) => approvalService.processApproval(id, 'approved', comments), onSuccess: () => { queryClient.invalidateQueries(['approvals']); toast.success('Request approved'); setSelectedRequest(null); } });
  const rejectMutation = useMutation({ mutationFn: ({ id, comments }) => approvalService.processApproval(id, 'rejected', comments), onSuccess: () => { queryClient.invalidateQueries(['approvals']); toast.success('Request rejected'); setSelectedRequest(null); } });

  const getTypeIcon = (type) => ({ leave: '🏖️', overtime: '⏰', expense: '💰', purchase: '🛒' }[type] || '📋');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Approval Requests</h1><p className="text-gray-600">Review and process pending requests</p></div>
      <div className="space-y-4">{approvalsData?.approvals?.map((request) => (<div key={request._id} className="bg-white rounded-xl shadow-md p-6"><div className="flex items-start justify-between"><div className="flex items-start space-x-4"><div className="text-2xl">{getTypeIcon(request.type)}</div><div><div className="flex items-center space-x-2"><h3 className="font-semibold text-gray-900">{request.type.toUpperCase()}</h3><span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span></div><p className="text-sm text-gray-600 mt-1">{request.details?.reason || 'No description'}</p><div className="flex space-x-4 mt-2 text-xs text-gray-500"><span>Requested by: {request.requestedBy?.name}</span><span>Date: {formatDate(request.createdAt)}</span><span>Amount: ₹{request.details?.amount?.toLocaleString() || 'N/A'}</span></div></div></div><button onClick={() => setSelectedRequest(request)} className="text-indigo-600"><EyeIcon className="h-5 w-5" /></button></div></div>))}</div>

      {selectedRequest && (<Modal isOpen={true} onClose={() => { setSelectedRequest(null); setComments(''); }} title="Review Request" size="md"><div className="space-y-4"><div className="bg-gray-50 p-4 rounded-lg"><p className="font-medium">{selectedRequest.type.toUpperCase()} Request</p><p className="text-sm text-gray-600 mt-1">{selectedRequest.details?.reason}</p><p className="text-sm mt-2">Amount: ₹{selectedRequest.details?.amount?.toLocaleString()}</p><p>Requested by: {selectedRequest.requestedBy?.name}</p></div><textarea rows={3} placeholder="Add comments..." value={comments} onChange={(e) => setComments(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /><div className="flex justify-end space-x-3"><button onClick={() => rejectMutation.mutate({ id: selectedRequest._id, comments })} className="px-4 py-2 bg-red-600 text-white rounded-lg">Reject</button><button onClick={() => approveMutation.mutate({ id: selectedRequest._id, comments })} className="px-4 py-2 bg-green-600 text-white rounded-lg">Approve</button></div></div></Modal>)}
    </div>
  );
};

export default Approvals;