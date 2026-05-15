import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import taskService from '../../services/task.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const WorkScheduling = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', scheduledDate: '', priority: 'medium' });

  const queryClient = useQueryClient();
  const { data: tasksData } = useQuery({ queryKey: ['scheduledTasks'], queryFn: () => taskService.getTasks({ status: 'scheduled' }) });
  const { data: techniciansData } = useQuery({ queryKey: ['technicians'], queryFn: () => userService.getUsers({ role: 'technician' }) });

  const createMutation = useMutation({ mutationFn: (data) => taskService.createTask(data), onSuccess: () => { queryClient.invalidateQueries(['scheduledTasks']); setShowModal(false); toast.success('Task scheduled'); } });
  const deleteMutation = useMutation({ mutationFn: (id) => taskService.deleteTask(id), onSuccess: () => { queryClient.invalidateQueries(['scheduledTasks']); toast.success('Task deleted'); } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Work Scheduling</h1><p className="text-gray-600">Schedule and manage work assignments</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><PlusIcon className="h-5 w-5" /><span>Schedule Task</span></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3><div className="space-y-3">{tasksData?.tasks?.map((task) => (<div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium text-gray-900">{task.title}</p><p className="text-sm text-gray-500">{task.assignedTo?.name} • {formatDate(task.scheduledDate)}</p></div><div className="flex space-x-2"><button onClick={() => { setSelectedTask(task); setFormData(task); setShowModal(true); }} className="text-blue-600"><PencilIcon className="h-4 w-4" /></button><button onClick={() => deleteMutation.mutate(task._id)} className="text-red-600"><TrashIcon className="h-4 w-4" /></button></div></div>))}</div></div>

        <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">Calendar View</h3><div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg"><CalendarIcon className="h-12 w-12 text-gray-400" /><p className="text-gray-500 mt-2">Calendar integration coming soon</p></div></div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedTask(null); }} title={selectedTask ? 'Edit Task' : 'Schedule New Task'}>
        <form onSubmit={(e) => { e.preventDefault(); selectedTask ? updateMutation.mutate({ id: selectedTask._id, data: formData }) : createMutation.mutate(formData); }} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label>Assign To</label><select value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Technician</option>{techniciansData?.users?.map(tech => <option key={tech._id} value={tech._id}>{tech.name}</option>)}</select></div>
          <div><label>Scheduled Date</label><input type="datetime-local" required value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div></div>
          <div><label>Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{selectedTask ? 'Update' : 'Schedule'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkScheduling;