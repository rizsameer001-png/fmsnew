import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PhotoIcon, 
  DocumentArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import complaintService from '../../services/complaint.service';
import buildingService from '../../services/building.service';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    buildingId: '',
    priority: 'medium',
    images: []
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => complaintService.createComplaint(data),
    onSuccess: () => {
      toast.success('Complaint raised successfully!');
      navigate('/customer/complaints');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to raise complaint');
      setIsSubmitting(false);
    },
  });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    // In production, upload to Cloudinary here and get URLs
    const imageUrls = selected.map(f => URL.createObjectURL(f));
    setFormData({ ...formData, images: imageUrls });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!formData.buildingId) {
      toast.error('Please select a building');
      return;
    }
    
    setIsSubmitting(true);
    createMutation.mutate(formData);
  };

  const serviceTypes = [
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
    { value: 'hvac', label: 'AC/Heating', icon: '❄️' },
    { value: 'security', label: 'Security', icon: '🛡️' },
    { value: 'pest', label: 'Pest Control', icon: '🐜' },
    { value: 'carpentry', label: 'Carpentry', icon: '🔨' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const priorities = [
    { value: 'low', label: 'Low - Non-urgent', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium - Normal', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High - Urgent', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent - Emergency', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raise a Complaint</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">We'll address your issue as quickly as possible</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide detailed description of the problem"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Service Type & Building */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Type *
            </label>
            <select
              required
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Service Type</option>
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Building *
            </label>
            <select
              required
              value={formData.buildingId}
              onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Building</option>
              {buildings?.buildings?.map(building => (
                <option key={building._id} value={building._id}>{building.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {priorities.map(priority => (
              <label
                key={priority.value}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition ${
                  formData.priority === priority.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`text-sm ${priority.color} px-2 py-0.5 rounded-full`}>
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Attachments (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
              <PhotoIcon className="h-10 w-10 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Click to upload photos</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
            </label>
          </div>
          {files.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-green-600">{files.length} file(s) selected</p>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 flex items-start space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please provide accurate information to help us resolve your issue quickly.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaiseComplaint;