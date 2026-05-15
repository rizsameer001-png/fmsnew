import React, { useState, useEffect, useCallback } from 'react';
import GoogleMap from './GoogleMap';
import { MapPinIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const LiveTracking = ({ 
  technicians = [], 
  onTechnicianSelect,
  autoCenter = true,
  refreshInterval = 10000 
}) => {
  const [locations, setLocations] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [center, setCenter] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setLocations(technicians);
  }, [technicians]);

  useEffect(() => {
    if (autoCenter && locations.length > 0 && locations[0].latitude && locations[0].longitude) {
      setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
    }
  }, [locations, autoCenter]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In production, fetch updated locations from API
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const markers = locations.map(tech => ({
    id: tech.userId || tech.id,
    title: tech.name,
    description: `${tech.role || tech.technicianType} • ${tech.status || 'Online'}`,
    latitude: tech.latitude,
    longitude: tech.longitude,
    type: 'technician',
    color: tech.status === 'busy' ? 'yellow' : tech.status === 'offline' ? 'gray' : 'green',
    address: tech.currentTask ? `Working on: ${tech.currentTask}` : 'Available',
    onViewDetails: (marker) => {
      setSelectedTechnician(tech);
      if (onTechnicianSelect) onTechnicianSelect(tech);
    },
  }));

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const onlineCount = locations.filter(l => l.status === 'online').length;
  const busyCount = locations.filter(l => l.status === 'busy').length;
  const offlineCount = locations.filter(l => l.status === 'offline').length;

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Online ({onlineCount})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">On Task ({busyCount})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Offline ({offlineCount})</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Map */}
      <div className="h-[500px] rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          markers={markers}
          center={center}
          zoom={14}
          onMarkerClick={(marker) => {
            const tech = locations.find(t => (t.userId || t.id) === marker.id);
            setSelectedTechnician(tech);
            if (onTechnicianSelect) onTechnicianSelect(tech);
          }}
        />
      </div>

      {/* Technicians List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Field Staff
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {locations.map((tech) => (
            <div
              key={tech.userId || tech.id}
              onClick={() => setSelectedTechnician(tech)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                selectedTechnician?.userId === tech.userId
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {tech.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(tech.status)}`}></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{tech.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{tech.role || tech.technicianType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tech.tasksToday || 0} tasks
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tech.currentTask ? 'On task' : 'Available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Technician Details */}
      {selectedTechnician && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 z-20 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{selectedTechnician.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedTechnician.role || selectedTechnician.technicianType}</p>
            </div>
            <button 
              onClick={() => setSelectedTechnician(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium capitalize ${selectedTechnician.status === 'online' ? 'text-green-600' : selectedTechnician.status === 'busy' ? 'text-yellow-600' : 'text-gray-500'}`}>
                {selectedTechnician.status || 'Online'}
              </span>
            </div>
            {selectedTechnician.currentTask && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Current Task:</span>
                <span className="font-medium">{selectedTechnician.currentTask}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Today's Tasks:</span>
              <span className="font-medium">{selectedTechnician.tasksToday || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Rating:</span>
              <span className="font-medium text-yellow-600">{selectedTechnician.rating || 4.8} ★</span>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Message
            </button>
            <button className="flex-1 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;