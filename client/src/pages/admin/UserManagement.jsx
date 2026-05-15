import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, PencilIcon, TrashIcon, EyeIcon, UserPlusIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import userService from '../../services/user.service';
import buildingService from '../../services/building.service';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import DataTable from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({ role: '', status: '', search: '', page: 1 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    technicianType: null, // Changed from '' to null
    buildingId: '',
    department: '',
    shift: { start: '09:00', end: '17:00' },
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });

  // Fetch buildings
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowModal(false);
      resetForm();
      toast.success('User created successfully! Login credentials sent to email.');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowModal(false);
      resetForm();
      toast.success('User updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowDeleteDialog(false);
      toast.success('User deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      technicianType: null, // Reset to null
      buildingId: '',
      department: '',
      shift: { start: '09:00', end: '17:00' },
      isActive: true,
    });
    setErrors({});
    setSelectedUser(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Password validation only for new users
    if (!selectedUser) {
      if (!formData.password) {
        newErrors.password = 'Password is required for new users';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Technician type validation
    if (formData.role === 'technician' && !formData.technicianType) {
      newErrors.technicianType = 'Technician type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      confirmPassword: '',
      role: user.role,
      technicianType: user.technicianType || null, // Convert empty to null
      buildingId: user.buildingId?._id || user.buildingId || '',
      department: user.department || '',
      shift: user.shift || { start: '09:00', end: '17:00' },
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    delete submitData.confirmPassword;
    
    // CRITICAL FIX: Remove technicianType if null/empty and role is not technician
    if (!submitData.technicianType || submitData.role !== 'technician') {
      delete submitData.technicianType;
    }
    
    // Remove password if editing and password field is empty
    if (selectedUser && !submitData.password) {
      delete submitData.password;
    }

    // Clean up empty fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null) {
        delete submitData[key];
      }
    });

    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleToggleStatus = (user) => {
    updateMutation.mutate({ 
      id: user._id, 
      data: { isActive: !user.isActive } 
    });
  };

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { 
      key: 'role', 
      header: 'Role', 
      render: (value) => {
        const roleLabels = {
          super_admin: 'Super Admin',
          manager: 'Manager',
          supervisor: 'Supervisor',
          technician: 'Technician',
          customer: 'Customer'
        };
        const colors = {
          super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          supervisor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          technician: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
          customer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[value] || colors.customer}`}>
            {roleLabels[value] || value}
          </span>
        );
      }
    },
    { 
      key: 'technicianType', 
      header: 'Specialization', 
      render: (value) => {
        if (!value) return '-';
        const labels = {
          electrician: 'Electrician',
          cleaner: 'Cleaner',
          security: 'Security',
          plumbing: 'Plumber',
          waste_management: 'Waste Management',
          landscaping: 'Landscaper',
          catering: 'Catering',
          reception: 'Receptionist',
          ppm_staff: 'PPM Staff'
        };
        return labels[value] || value;
      }
    },
    { 
      key: 'isActive', 
      header: 'Status', 
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
            value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      )
    },
    { key: 'createdAt', header: 'Joined', render: (value) => formatDate(value) },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-800" title="View">
            <EyeIcon className="h-5 w-5" />
          </button>
          <button onClick={() => handleEdit(row)} className="text-green-600 hover:text-green-800" title="Edit">
            <PencilIcon className="h-5 w-5" />
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800" title="Delete">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  const technicianTypes = [
    { value: 'electrician', label: 'Electrician' },
    { value: 'cleaner', label: 'Cleaner' },
    { value: 'security', label: 'Security' },
    { value: 'plumbing', label: 'Plumber' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'landscaping', label: 'Landscaper' },
    { value: 'catering', label: 'Catering Staff' },
    { value: 'reception', label: 'Receptionist' },
    { value: 'ppm_staff', label: 'PPM Staff' },
  ];

  const roles = [
    { value: 'manager', label: 'Manager', description: 'Building manager with team oversight' },
    { value: 'supervisor', label: 'Supervisor', description: 'Team supervisor for field operations' },
    { value: 'technician', label: 'Technician', description: 'Field technician for maintenance' },
    { value: 'customer', label: 'Customer', description: 'End user customer access' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employees (Managers, Supervisors, Technicians) and Customers
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ role: '', status: '', search: '', page: 1 })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={usersData?.users || []}
        isLoading={isLoading}
        pagination={{
          currentPage: usersData?.currentPage || 1,
          totalPages: usersData?.totalPages || 1,
          total: usersData?.total || 0,
          onPageChange: (page) => setFilters({ ...filters, page }),
          itemsPerPage: 10,
        }}
      />

      {/* Add/Edit User Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} 
             title={selectedUser ? 'Edit User' : 'Add New User'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    role: e.target.value,
                    technicianType: e.target.value !== 'technician' ? null : formData.technicianType
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {roles.find(r => r.value === formData.role)?.description}
              </p>
            </div>
          </div>

          {!selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {formData.role === 'technician' && (
            <div>
              <label className="block text-sm font-medium mb-1">Technician Type *</label>
              <select
                value={formData.technicianType || ''}
                onChange={(e) => setFormData({ ...formData, technicianType: e.target.value || null })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.technicianType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Specialization</option>
                {technicianTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.technicianType && <p className="mt-1 text-xs text-red-500">{errors.technicianType}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Building (Optional)</label>
              <select
                value={formData.buildingId}
                onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Building</option>
                {buildingsData?.buildings?.map(building => (
                  <option key={building._id} value={building._id}>{building.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department (Optional)</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Maintenance, Housekeeping"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.isActive === true}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>Active (Can login)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.isActive === false}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="h-4 w-4 text-indigo-600"
                />
                <span>Inactive (Cannot login)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedUser(null); }} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-semibold">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-semibold capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                {selectedUser.technicianType && (
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-sm capitalize">{selectedUser.technicianType}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setShowViewModal(false); setSelectedUser(null); }}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate(selectedUser?._id)}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This will permanently remove the user and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;