import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CameraIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  PencilIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth.service';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const TechnicianProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => authService.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data.current, data.new),
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({ current: passwordData.current, new: passwordData.new });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
        <div className="relative px-6 pb-6">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16">
              <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {user?.name?.charAt(0) || 'T'}
                  </span>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize">
              {user?.role?.replace('_', ' ')} • {user?.technicianType || 'General Technician'}
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <PhoneIcon className="h-5 w-5" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <BriefcaseIcon className="h-5 w-5" />
                <span>Employee ID: {user?.employeeId || 'TECH' + user?._id?.slice(-6)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>{user?.buildingId?.name || 'Main Building'}</span>
              </div>
              {user?.address?.city && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{user?.address?.city}, {user?.address?.state}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-5 w-5" />
                <span>Joined: {formatDate(user?.createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.totalTasks || 0}</p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{user?.rating || 4.8} ★</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{user?.attendanceRate || 96}%</p>
                <p className="text-xs text-gray-500">Attendance</p>
              </div>
            </div>

            {/* Change Password Link */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile" size="md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={user?.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              defaultValue={user?.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
            <input
              type="text"
              defaultValue={user?.emergencyContact?.name}
              onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
            <input
              type="tel"
              defaultValue={user?.emergencyContact?.phone}
              onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="md">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters with at least one uppercase letter and number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TechnicianProfile;