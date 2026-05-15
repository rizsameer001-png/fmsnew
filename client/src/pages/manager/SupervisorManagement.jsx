import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import userService from '../../services/user.service';
import buildingService from '../../services/building.service';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

const SupervisorManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    buildingId: '',
    department: '',
    shift: { start: '09:00', end: '17:00' },
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: supervisorsData, isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: () => userService.getUsers({ role: 'supervisor' }),
  });

  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => userService.createUser({ ...data, role: 'supervisor' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisors']);
      setShowModal(false);
      resetForm();
      toast.success('Supervisor created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create supervisor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisors']);
      setShowModal(false);
      resetForm();
      toast.success('Supervisor updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['supervisors']);
      setShowDeleteDialog(false);
      toast.success('Supervisor deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      buildingId: '',
      department: '',
      shift: { start: '09:00', end: '17:00' },
      isActive: true,
    });
    setSelectedSupervisor(null);
  };

  const handleEdit = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      buildingId: supervisor.buildingId?._id || supervisor.buildingId || '',
      department: supervisor.department || '',
      shift: supervisor.shift || { start: '09:00', end: '17:00' },
      isActive: supervisor.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSupervisor) {
      updateMutation.mutate({ id: selectedSupervisor._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPerformanceStats = (supervisorId) => {
    // In production, fetch from API
    return {
      technicians: 5,
      activeTasks: 8,
      completedTasks: 42,
      attendance: 94,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisor Management</h1>
          <p className="text-gray-600 mt-1">Manage all supervisors and their performance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Add Supervisor</span>
        </button>
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supervisorsData?.users?.map((supervisor) => {
          const stats = getPerformanceStats(supervisor._id);
          return (
            <div key={supervisor._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {supervisor.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{supervisor.name}</h3>
                      <p className="text-sm text-gray-500">{supervisor.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(supervisor)} className="p-1 text-gray-400 hover:text-blue-600">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setSelectedSupervisor(supervisor); setShowDeleteDialog(true); }} className="p-1 text-gray-400 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {supervisor.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    {supervisor.buildingId?.name || 'Not Assigned'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.technicians}</p>
                      <p className="text-xs text-gray-500">Technicians</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{stats.activeTasks}</p>
                      <p className="text-xs text-gray-500">Active Tasks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.attendance}%</p>
                      <p className="text-xs text-gray-500">Attendance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Supervisor Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <select value={formData.buildingId} onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select Building</option>
                {buildingsData?.buildings?.map(building => (
                  <option key={building._id} value={building._id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{selectedSupervisor ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={() => deleteMutation.mutate(selectedSupervisor?._id)} title="Delete Supervisor" message={`Are you sure you want to delete ${selectedSupervisor?.name}?`} />
    </div>
  );
};

export default SupervisorManagement;