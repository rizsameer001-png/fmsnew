import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  CameraIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import taskService from '../../services/task.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const WorkVerification = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rating, setRating] = useState(5);

  const queryClient = useQueryClient();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['completedTasks'],
    queryFn: () => taskService.getTasks({ status: 'completed' }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, notes, rating }) => taskService.verifyTask(id, notes, rating),
    onSuccess: () => {
      queryClient.invalidateQueries(['completedTasks']);
      setSelectedTask(null);
      toast.success('Task verified successfully');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }) => taskService.updateTaskStatus(id, 'pending', notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['completedTasks']);
      setSelectedTask(null);
      toast.warning('Task sent back for rework');
    },
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Verification</h1>
        <p className="text-gray-600 mt-1">Review and verify completed work by technicians</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Pending Verification</p><p className="text-2xl font-bold text-yellow-600">{tasksData?.tasks?.filter(t => t.status === 'completed').length || 0}</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Verified Today</p><p className="text-2xl font-bold text-green-600">{tasksData?.tasks?.filter(t => t.status === 'verified' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length || 0}</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Avg Rating</p><p className="text-2xl font-bold text-indigo-600">4.8</p></div></div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksData?.tasks?.filter(t => t.status === 'completed').map((task) => (
          <div key={task._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{task.taskNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>{task.priority.toUpperCase()}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">COMPLETED</span>
                </div>
                <h4 className="text-md font-medium text-gray-800 mt-2">{task.title}</h4>
                <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>Technician: {task.assignedTo?.name}</span>
                  <span>Completed: {formatDate(task.actualEndTime)}</span>
                  {task.completionProof?.length > 0 && <span><CameraIcon className="h-4 w-4 inline mr-1" />{task.completionProof.length} photos</span>}
                </div>
              </div>
              <button onClick={() => setSelectedTask(task)} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <EyeIcon className="h-4 w-4" />
                <span>Review</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedTask && (
        <Modal isOpen={true} onClose={() => setSelectedTask(null)} title="Review Completed Work" size="lg">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold">{selectedTask.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Technician:</span> {selectedTask.assignedTo?.name}</div>
                <div><span className="text-gray-500">Duration:</span> {selectedTask.duration} minutes</div>
              </div>
            </div>

            {selectedTask.completionProof?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Proof</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTask.completionProof.map((url, idx) => (
                    <img key={idx} src={url} alt={`Proof ${idx + 1}`} className="h-24 w-full object-cover rounded-lg cursor-pointer" />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Notes</label>
              <textarea rows={3} value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} placeholder="Add verification comments..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="text-2xl focus:outline-none">
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => rejectMutation.mutate({ id: selectedTask._id, notes: verificationNotes })} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject & Request Rework</button>
              <button onClick={() => verifyMutation.mutate({ id: selectedTask._id, notes: verificationNotes, rating })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve & Verify</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WorkVerification;