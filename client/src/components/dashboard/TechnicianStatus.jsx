import React, { useState } from 'react';
import { MapPinIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const TechnicianStatus = ({ technicians }) => {
  const [selectedTech, setSelectedTech] = useState(null);

  const defaultTechnicians = [
    { id: 1, name: 'John Electric', role: 'Electrician', status: 'online', location: 'Building A - Floor 2', rating: 4.8, tasksToday: 3 },
    { id: 2, name: 'Mike Plumber', role: 'Plumber', status: 'busy', location: 'Building B - Floor 1', rating: 4.9, tasksToday: 4 },
    { id: 3, name: 'Sarah Clean', role: 'Cleaner', status: 'offline', location: 'Building C', rating: 4.7, tasksToday: 2 },
    { id: 4, name: 'David Security', role: 'Security', status: 'online', location: 'Main Gate', rating: 4.9, tasksToday: 1 },
    { id: 5, name: 'Lisa Garden', role: 'Landscaper', status: 'online', location: 'Garden Area', rating: 4.8, tasksToday: 2 },
  ];

  const displayTechnicians = technicians.length > 0 ? technicians : defaultTechnicians;

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'On Task';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Technician Status</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-700">View Map</button>
      </div>
      
      <div className="space-y-3">
        {displayTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
            onClick={() => setSelectedTech(selectedTech === tech.id ? null : tech.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {tech.name.charAt(0)}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(tech.status)} border-2 border-white`}></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">{getStatusText(tech.status)}</p>
              <p className="text-xs text-gray-500">{tech.tasksToday} tasks today</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <MapPinIcon className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Track All</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <PhoneIcon className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Call</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianStatus;