import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import complaintService from '../../services/complaint.service';
import userService from '../../services/user.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const ComplaintHandling = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: complaintsData } = useQuery({
    queryKey: ['supervisorComplaints', filter],
    queryFn: () => complaintService.getComplaints({ status: filter !== 'all' ? filter : undefined }),
  });

  const { data: techniciansData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, technicianId }) => complaintService.assignComplaint(id, technicianId),
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisorComplaints']);
      toast.success('Complaint assigned successfully');
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ id, reason }) => complaintService.escalateComplaint(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisorComplaints']);
      toast.success('Complaint escalated to manager');
    },
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Complaint Handling</h1><p className="text-gray-600">Manage and assign customer complaints</p></div>

      <div className="flex space-x-2 border-b">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved'].map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 capitalize ${filter === status ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>{status}</button>
        ))}
      </div>

      <div className="space-y-4">
        {complaintsData?.complaints?.map((complaint) => (
          <div key={complaint._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{complaint.complaintNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>{complaint.priority.toUpperCase()}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{complaint.status}</span>
                </div>
                <h4 className="text-md font-medium text-gray-800 mt-2">{complaint.title}</h4>
                <p className="text-gray-600 mt-1">{complaint.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>Customer: {complaint.customerId?.name}</span>
                  <span>Created: {formatDate(complaint.createdAt)}</span>
                  {complaint.assignedTo && <span>Assigned: {complaint.assignedTo.name}</span>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setSelectedComplaint(complaint)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><EyeIcon className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {selectedComplaint && (
        <Modal isOpen={true} onClose={() => setSelectedComplaint(null)} title={`Complaint: ${selectedComplaint.complaintNumber}`} size="lg">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg"><p className="font-medium">{selectedComplaint.title}</p><p className="text-sm text-gray-600 mt-1">{selectedComplaint.description}</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign to Technician</label><select onChange={(e) => assignMutation.mutate({ id: selectedComplaint._id, technicianId: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Technician</option>{techniciansData?.users?.map(tech => <option key={tech._id} value={tech._id}>{tech.name} - {tech.technicianType}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Escalate Reason (if needed)</label><textarea rows={2} id="escalateReason" className="w-full px-3 py-2 border rounded-lg" placeholder="Reason for escalation..." /></div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => { const reason = document.getElementById('escalateReason').value; if (reason) escalateMutation.mutate({ id: selectedComplaint._id, reason }); else toast.error('Please provide a reason for escalation'); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg">Escalate to Manager</button>
              <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 border rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintHandling;