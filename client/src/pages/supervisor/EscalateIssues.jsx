import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FlagIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import complaintService from '../../services/complaint.service';
import Modal from '../../components/common/Modal';

const EscalateIssues = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [escalationReason, setEscalationReason] = useState('');

  const { data: escalatedIssues, refetch } = useQuery({
    queryKey: ['escalatedIssues'],
    queryFn: () => complaintService.getComplaints({ status: 'escalated' }),
  });

  const escalateMutation = useMutation({
    mutationFn: ({ id, reason }) => complaintService.escalateComplaint(id, reason),
    onSuccess: () => {
      refetch();
      setSelectedIssue(null);
      toast.success('Issue escalated to manager');
    },
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Escalate Issues</h1><p className="text-gray-600">Escalate critical issues to management</p></div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"><div className="flex"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" /><p className="text-sm text-yellow-700">Use escalation only for critical issues that cannot be resolved at your level</p></div></div>

      <div className="space-y-4">{escalatedIssues?.complaints?.filter(c => c.status !== 'escalated').map((issue) => (<div key={issue._id} className="bg-white rounded-xl shadow-md p-6"><div className="flex justify-between items-start"><div><div className="flex items-center space-x-3"><h3 className="text-lg font-semibold text-gray-900">{issue.complaintNumber}</h3><span className={`px-2 py-1 rounded-full text-xs font-semibold ${issue.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{issue.priority}</span></div><h4 className="font-medium mt-2">{issue.title}</h4><p className="text-gray-600 mt-1">{issue.description}</p><div className="mt-3 text-sm text-gray-500">Customer: {issue.customerId?.name} • Created: {new Date(issue.createdAt).toLocaleDateString()}</div></div><button onClick={() => setSelectedIssue(issue)} className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg"><FlagIcon className="h-4 w-4" /><span>Escalate</span></button></div></div>))}</div>

      {selectedIssue && (<Modal isOpen={true} onClose={() => setSelectedIssue(null)} title="Escalate Issue to Manager"><div className="space-y-4"><div className="bg-red-50 p-4 rounded-lg"><p className="font-medium">{selectedIssue.title}</p><p className="text-sm text-gray-600 mt-1">{selectedIssue.description}</p></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Reason for Escalation *</label><textarea rows={3} value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} placeholder="Explain why this needs management attention..." className="w-full px-3 py-2 border rounded-lg" /></div><div className="flex justify-end space-x-3"><button onClick={() => setSelectedIssue(null)} className="px-4 py-2 border rounded-lg">Cancel</button><button onClick={() => { if (escalationReason) escalateMutation.mutate({ id: selectedIssue._id, reason: escalationReason }); else toast.error('Please provide a reason'); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Escalation</button></div></div></Modal>)}
    </div>
  );
};

export default EscalateIssues;