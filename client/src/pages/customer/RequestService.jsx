import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import taskService from '../../services/task.service';
import buildingService from '../../services/building.service';

const RequestService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => taskService.requestService(data),
    onSuccess: () => {
      toast.success('Service request submitted successfully!');
      navigate('/customer/service-history');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit request');
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!formData.preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }
    
    setIsSubmitting(true);
    createMutation.mutate(formData);
  };

  const serviceTypes = [
    { value: 'cleaning', label: 'Deep Cleaning', price: '₹499 - ₹1499', duration: '2-4 hours' },
    { value: 'electrical', label: 'Electrical Repair', price: '₹399 - ₹999', duration: '1-3 hours' },
    { value: 'plumbing', label: 'Plumbing Service', price: '₹399 - ₹899', duration: '1-3 hours' },
    { value: 'hvac', label: 'AC Maintenance', price: '₹599 - ₹1499', duration: '2-4 hours' },
    { value: 'pest', label: 'Pest Control', price: '₹799 - ₹1999', duration: '3-5 hours' },
    { value: 'carpentry', label: 'Carpentry/Furniture', price: '₹299 - ₹999', duration: '1-3 hours' },
    { value: 'painting', label: 'Painting Service', price: '₹999 - ₹4999', duration: '4-8 hours' },
    { value: 'appliance', label: 'Appliance Repair', price: '₹399 - ₹1299', duration: '1-3 hours' },
  ];

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request a Service</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule a service appointment at your convenience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceTypes.map(service => (
              <label
                key={service.value}
                className={`p-3 border rounded-lg cursor-pointer transition ${
                  formData.serviceType === service.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={service.value}
                  checked={formData.serviceType === service.value}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="hidden"
                />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{service.label}</span>
                  <span className="text-sm text-green-600 dark:text-green-400">{service.price}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">⏱️ {service.duration}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Details
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Any specific requirements or instructions..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Time
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Service Address
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Your full address with building, floor, room number"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Person
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Name of contact person"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="Phone number for coordination"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestService;