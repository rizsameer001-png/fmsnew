import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CameraIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import taskService from '../../services/task.service';
import { formatDateTime } from '../../utils/formatters';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statusNote, setStatusNote] = useState('');
  const [proofImages, setProofImages] = useState([]);
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => taskService.updateTaskStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      queryClient.invalidateQueries(['myTasks']);
      toast.success('Task status updated');
    },
  });

  const uploadProofMutation = useMutation({
    mutationFn: ({ id, images }) => taskService.uploadCompletionProof(id, images),
    onSuccess: () => {
      queryClient.invalidateQueries(['task', id]);
      toast.success('Proof uploaded successfully');
    },
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload to Cloudinary and get URLs
    const imageUrls = files.map(f => URL.createObjectURL(f));
    setProofImages([...proofImages, ...imageUrls]);
    uploadProofMutation.mutate({ id, images: imageUrls });
  };

  const getChecklistProgress = () => {
    const checklist = task?.checklist || [];
    const completed = checklist.filter(item => item.completed).length;
    return { completed, total: checklist.length, percentage: (completed / checklist.length) * 100 || 0 };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const checklistStats = getChecklistProgress();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to Tasks</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left/ Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task?.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Task #{task?.taskNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                task?.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                task?.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {task?.priority?.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{task?.description}</p>
          </div>

          {/* Checklist */}
          {task?.checklist?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Task Checklist</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{checklistStats.completed}/{checklistStats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${checklistStats.percentage}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                {task?.checklist?.map((item, idx) => (
                  <label key={idx} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.completed} 
                      onChange={() => {}} 
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{item.taskName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Proof Upload */}
          {task?.status !== 'verified' && task?.status !== 'completed' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upload Completion Proof</h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition">
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="proofUpload" />
                <label htmlFor="proofUpload" className="cursor-pointer flex flex-col items-center">
                  <CameraIcon className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to upload photos</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
              {proofImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {proofImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Proof ${idx + 1}`} className="h-24 w-full object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Task Details</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{task?.location || 'Main Building, Floor 2'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(task?.scheduledDate)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigned By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{task?.assignedBy?.name}</p>
                </div>
              </div>
              {task?.estimatedDuration && (
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">{task.estimatedDuration} minutes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Update Status</h3>
            <textarea
              rows={3}
              placeholder="Add notes about your work..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="mt-4 space-y-2">
              {task?.status === 'assigned' && (
                <button
                  onClick={() => updateStatusMutation.mutate({ id, status: 'in_progress', notes: statusNote })}
                  className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  Start Task
                </button>
              )}
              {task?.status === 'in_progress' && (
                <button
                  onClick={() => updateStatusMutation.mutate({ id, status: 'completed', notes: statusNote })}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {task?.status === 'completed' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Task pending verification by supervisor
              </p>
            </div>
          )}
          {task?.status === 'verified' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <CheckCircleIcon className="h-5 w-5 text-green-600 inline mr-2" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Task verified! Rating: {task?.rating} ★
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;