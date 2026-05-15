import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import gpsService from '../../services/gps.service';
import useGeolocation from '../../hooks/useGeolocation';

const EmergencyAlert = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { location, error: locationError, isLoading: locationLoading } = useGeolocation();

  const emergencyMutation = useMutation({
    mutationFn: (data) => gpsService.sendEmergencyAlert(data.latitude, data.longitude, data.message),
    onSuccess: () => {
      toast.success('Emergency alert sent! Help is on the way.');
      setIsSending(false);
    },
    onError: () => {
      toast.error('Failed to send alert. Please call emergency services.');
      setIsSending(false);
    },
  });

  const handleSendAlert = () => {
    if (!location) {
      toast.error('Unable to get your location');
      return;
    }
    
    if (!message.trim()) {
      toast.error('Please describe the emergency');
      return;
    }
    
    setIsSending(true);
    emergencyMutation.mutate({
      latitude: location.latitude,
      longitude: location.longitude,
      message: message,
    });
  };

  const emergencyContacts = [
    { name: 'Supervisor', phone: '+91 98765 43210', relation: 'Work', icon: '👨‍💼' },
    { name: 'Security Control', phone: '+91 98765 43211', relation: 'Security', icon: '🛡️' },
    { name: 'Emergency Services', phone: '112', relation: 'General', icon: '🚨' },
    { name: 'Ambulance', phone: '102', relation: 'Medical', icon: '🚑' },
    { name: 'Fire Department', phone: '101', relation: 'Fire', icon: '🔥' },
    { name: 'Police', phone: '100', relation: 'Law', icon: '👮' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Alert</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Use this only in genuine emergency situations</p>
        </div>
        <ShieldCheckIcon className="h-12 w-12 text-red-500" />
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-sm text-red-700 dark:text-red-300">
            This alert will notify your supervisor, security team, and emergency contacts immediately. 
            Please only use this for real emergencies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Alert Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Emergency Alert</h3>
          
          {/* Location Status */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPinIcon className={`h-5 w-5 ${location ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {locationLoading ? 'Getting location...' : location ? 'Location ready' : 'Location unavailable'}
              </span>
            </div>
            {location && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Describe the emergency *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What is happening? Where are you? Any injuries?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendAlert}
            disabled={isSending || !location || !message.trim()}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>{isSending ? 'Sending Alert...' : 'Send Emergency Alert'}</span>
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Your location will be shared with emergency contacts
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contacts</h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{contact.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{contact.relation}</p>
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Safety Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-400">
          <div className="flex items-start space-x-2">
            <span>1️⃣</span>
            <span>Stay calm and assess the situation</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>2️⃣</span>
            <span>Move to a safe location if possible</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>3️⃣</span>
            <span>Alert nearby people if needed</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>4️⃣</span>
            <span>Follow instructions from emergency services</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;