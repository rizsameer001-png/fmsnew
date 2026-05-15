import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserPlusIcon, 
  BriefcaseIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import userService from '../../services/user.service';
import taskService from '../../services/task.service';
import Modal from '../../components/common/Modal';

const TechnicianAssignment = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    serviceType: '',
    scheduledDate: '',
    priority: 'medium',
  });

  const queryClient = useQueryClient();

  const { data: techniciansData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['assignedTasks'],
    queryFn: () => taskService.getTasks({ status: 'assigned' }),
  });

  const assignMutation = useMutation({
    mutationFn: (data) => taskService.createTask({ ...data, assignedTo: selectedTechnician?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedTasks']);
      setShowModal(false);
      toast.success('Task assigned successfully');
      setTaskData({ title: '', description: '', serviceType: '', scheduledDate: '', priority: 'medium' });
    },
  });

  const getWorkload = (technicianId) => {
    // In production, fetch from API
    return { activeTasks: 3, completedToday: 2, rating: 4.8 };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technician Assignment</h1>
        <p className="text-gray-600">Manage and assign tasks to field technicians</p>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniciansData?.users?.map((tech) => {
          const workload = getWorkload(tech._id);
          return (
            <div key={tech._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    tech.technicianType === 'electrician' ? 'bg-yellow-100' :
                    tech.technicianType === 'plumber' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    <BriefcaseIcon className={`h-6 w-6 ${
                      tech.technicianType === 'electrician' ? 'text-yellow-600' :
                      tech.technicianType === 'plumber' ? 'text-blue-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{tech.technicianType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{workload.rating} ★</p>
                  <p className="text-xs text-gray-500">{workload.activeTasks} active tasks</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {tech.buildingId?.name || 'Available'}
              </div>

              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-1">
                  <span className="text-xs text-gray-500">{workload.completedToday} completed today</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTechnician(tech);
                    setShowModal(true);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Assign Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recently Assigned Tasks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Assigned Tasks</h3>
        <div className="space-y-3">
          {tasksData?.tasks?.slice(0, 5).map((task) => (
            <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-500">Assigned to: {task.assignedTo?.name} • Due: {new Date(task.scheduledDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setTaskData({ title: '', description: '', serviceType: '', scheduledDate: '', priority: 'medium' }); }} title={`Assign Task to ${selectedTechnician?.name}`}>
        <form onSubmit={(e) => { e.preventDefault(); assignMutation.mutate(taskData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input type="text" required value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select value={taskData.serviceType} onChange={(e) => setTaskData({ ...taskData, serviceType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select Type</option>
                <option value="cleaning">Cleaning</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="hvac">HVAC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input type="datetime-local" required value={taskData.scheduledDate} onChange={(e) => setTaskData({ ...taskData, scheduledDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={assignMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Assign Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TechnicianAssignment;