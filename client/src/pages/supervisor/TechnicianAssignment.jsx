import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserPlusIcon, 
  BriefcaseIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import userService from '../../services/user.service';
import taskService from '../../services/task.service';
import buildingService from '../../services/building.service';
import Modal from '../../components/common/Modal';

const SupervisorTechnicianAssignment = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    serviceType: '',
    buildingId: '',
    scheduledDate: '',
    priority: 'medium',
    location: '',
  });

  const queryClient = useQueryClient();

  // Fetch technicians under this supervisor
  const { data: techniciansData, isLoading: techLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
  });

  // Fetch buildings
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  // Fetch assigned tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['assignedTasks'],
    queryFn: () => taskService.getTasks({ status: 'assigned,in_progress' }),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedTasks']);
      setShowModal(false);
      resetForm();
      toast.success('Task assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign task');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignedTasks']);
      toast.success('Task status updated');
    },
  });

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      serviceType: '',
      buildingId: '',
      scheduledDate: '',
      priority: 'medium',
      location: '',
    });
    setSelectedTechnician(null);
  };

  const handleAssign = (technician) => {
    setSelectedTechnician(technician);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTaskMutation.mutate({
      ...taskData,
      assignedTo: selectedTechnician?._id,
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const getWorkload = (technicianId) => {
    const tasks = tasksData?.tasks || [];
    const technicianTasks = tasks.filter(t => t.assignedTo?._id === technicianId);
    return {
      activeTasks: technicianTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length,
      completedToday: technicianTasks.filter(t => t.status === 'completed').length,
    };
  };

  const technicians = techniciansData?.users || [];
  const tasks = tasksData?.tasks || [];
  const buildings = buildingsData?.buildings || [];

  if (techLoading || tasksLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technician Assignment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Assign and manage tasks for your team technicians</p>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map((tech) => {
          const workload = getWorkload(tech._id);
          return (
            <div key={tech._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    tech.technicianType === 'electrician' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    tech.technicianType === 'plumbing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    tech.technicianType === 'cleaning' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-indigo-100 dark:bg-indigo-900/30'
                  }`}>
                    <BriefcaseIcon className={`h-6 w-6 ${
                      tech.technicianType === 'electrician' ? 'text-yellow-600' :
                      tech.technicianType === 'plumbing' ? 'text-blue-600' :
                      tech.technicianType === 'cleaning' ? 'text-green-600' :
                      'text-indigo-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{tech.technicianType || 'Technician'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">{workload.activeTasks} active</p>
                  <p className="text-xs text-gray-500">{workload.completedToday} completed today</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {tech.buildingId?.name || 'Available for assignment'}
              </div>

              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{tech.email}</span>
                </div>
                <button
                  onClick={() => handleAssign(tech)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Assign Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {technicians.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No technicians found</p>
          <p className="text-sm text-gray-400 mt-2">Technicians will appear here once added</p>
        </div>
      )}

      {/* Recently Assigned Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Tasks</h3>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No active tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assigned to: {task.assignedTo?.name} • Due: {new Date(task.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: task._id, status: 'in_progress' })}
                      className="p-1 text-yellow-600 hover:text-yellow-800"
                      title="Start Task"
                    >
                      <ClockIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={`Assign Task to ${selectedTechnician?.name}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
              <select
                value={taskData.serviceType}
                onChange={(e) => setTaskData({ ...taskData, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">Select Type</option>
                <option value="cleaning">Cleaning</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="hvac">HVAC</option>
                <option value="security">Security</option>
                <option value="carpentry">Carpentry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <select
                value={taskData.buildingId}
                onChange={(e) => setTaskData({ ...taskData, buildingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date *</label>
              <input
                type="datetime-local"
                required
                value={taskData.scheduledDate}
                onChange={(e) => setTaskData({ ...taskData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input
              type="text"
              value={taskData.location}
              onChange={(e) => setTaskData({ ...taskData, location: e.target.value })}
              placeholder="Building, Floor, Room number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createTaskMutation.isPending ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupervisorTechnicianAssignment;