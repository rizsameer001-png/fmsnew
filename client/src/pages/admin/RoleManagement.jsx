// client/src/pages/admin/RoleManagement.jsx
//Complete RoleManagement.jsx with Create Role Functionality
//complete Role Management page that allows creating roles directly from the UI without using seeder
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShieldCheckIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import roleService from '../../services/role.service';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const RoleManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles(),
  });

  // Fetch permissions list
  const { data: permissionsData } = useQuery({
    queryKey: ['permissionsList'],
    queryFn: () => roleService.getPermissionsList(),
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: (data) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowModal(false);
      resetForm();
      toast.success('Role created successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowModal(false);
      resetForm();
      toast.success('Role updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowDeleteDialog(false);
      setSelectedRole(null);
      toast.success('Role deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });

  // Toggle role status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => roleService.toggleRoleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success('Role status updated');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      isActive: true
    });
    setSelectedRole(null);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.permissions || [],
      isActive: role.isActive
    });
    setShowModal(true);
  };

  const handleView = (role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const handleToggleStatus = (role) => {
    if (role.name === 'super_admin') {
      toast.error('Cannot modify super admin role');
      return;
    }
    toggleStatusMutation.mutate(role._id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error('Please select a role name');
      return;
    }
    if (!formData.displayName) {
      toast.error('Please enter a display name');
      return;
    }
    
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSelectAllPermissions = (category, permissions) => {
    const categoryPermissions = permissions.map(p => p.value);
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      // Remove all permissions in this category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Add all permissions in this category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const roleNameOptions = [
    { value: 'manager', label: 'Manager', description: 'Building manager with team oversight' },
    { value: 'supervisor', label: 'Supervisor', description: 'Team supervisor for field operations' },
    { value: 'technician', label: 'Technician', description: 'Field technician for maintenance' },
    { value: 'customer', label: 'Customer', description: 'End user customer access' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesData?.roles?.map((role) => (
          <div key={role._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    role.name === 'super_admin' ? 'bg-purple-100' :
                    role.name === 'manager' ? 'bg-blue-100' :
                    role.name === 'supervisor' ? 'bg-green-100' :
                    role.name === 'technician' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <ShieldCheckIcon className={`h-5 w-5 ${
                      role.name === 'super_admin' ? 'text-purple-600' :
                      role.name === 'manager' ? 'text-blue-600' :
                      role.name === 'supervisor' ? 'text-green-600' :
                      role.name === 'technician' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.displayName}</h3>
                    <p className="text-sm text-gray-500">{role.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(role)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(role.isActive)}`}
                  disabled={role.name === 'super_admin'}
                >
                  {role.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{role.description || 'No description'}</p>
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">{role.permissions?.length || 0} Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 5).map((perm, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).substring(0, 15)}
                    </span>
                  ))}
                  {role.permissions?.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      +{role.permissions.length - 5}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => handleView(role)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                {role.name !== 'super_admin' && (
                  <>
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Edit Role"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Role"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {rolesData?.roles?.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No roles found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Create your first role
          </button>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedRole ? 'Edit Role' : 'Create New Role'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
              <select
                required
                value={formData.name}
                onChange={(e) => {
                  const selectedRoleName = e.target.value;
                  const roleOption = roleNameOptions.find(opt => opt.value === selectedRoleName);
                  setFormData({ 
                    ...formData, 
                    name: selectedRoleName,
                    displayName: roleOption?.label || ''
                  });
                }}
                disabled={!!selectedRole}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Role</option>
                {roleNameOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.name && (
                <p className="text-xs text-gray-500 mt-1">
                  {roleNameOptions.find(opt => opt.value === formData.name)?.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Building Manager"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe the role's responsibilities..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Permissions</label>
              {formData.name && (
                <button
                  type="button"
                  onClick={() => {
                    // Pre-select common permissions based on role
                    const commonPermissions = {
                      manager: ['view_users', 'view_buildings', 'edit_buildings', 'view_complaints', 'assign_complaints', 'view_tasks', 'assign_tasks', 'view_attendance', 'approve_attendance', 'view_reports', 'export_reports'],
                      supervisor: ['view_users', 'view_buildings', 'view_complaints', 'assign_complaints', 'view_tasks', 'assign_tasks', 'verify_tasks', 'view_attendance', 'mark_attendance'],
                      technician: ['view_tasks', 'update_tasks', 'mark_attendance', 'view_attendance'],
                      customer: ['view_complaints', 'create_complaints', 'view_invoices', 'make_payments']
                    };
                    const defaultPerms = commonPermissions[formData.name] || [];
                    setFormData(prev => ({ ...prev, permissions: defaultPerms }));
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Set default permissions for this role
                </button>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
              {permissionsData?.permissions && Object.entries(permissionsData.permissions).map(([category, perms]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">{category} Permissions</h4>
                    <button
                      type="button"
                      onClick={() => handleSelectAllPermissions(category, perms)}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      {perms.every(p => formData.permissions.includes(p.value)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-2">
                    {perms.map((perm) => (
                      <label key={perm.value} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.value)}
                          onChange={() => handlePermissionToggle(perm.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active (Role will be available for assignment)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedRole ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Role Modal */}
      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedRole(null); }} title="Role Details" size="lg">
        {selectedRole && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Role Name</p>
                  <p className="font-semibold text-gray-900">{selectedRole.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Display Name</p>
                  <p className="font-semibold text-gray-900">{selectedRole.displayName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedRole.isActive)}`}>
                    {selectedRole.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm">{new Date(selectedRole.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-gray-700">{selectedRole.description || 'No description'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Permissions ({selectedRole.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {selectedRole.permissions?.map((perm, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => { setShowViewModal(false); setSelectedRole(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setSelectedRole(null); }}
        onConfirm={() => deleteMutation.mutate(selectedRole?._id)}
        title="Delete Role"
        message={`Are you sure you want to delete "${selectedRole?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default RoleManagement;