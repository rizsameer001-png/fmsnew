// src/pages/admin/GPSTracking.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPinIcon, 
  ArrowPathIcon,  // Changed from RefreshIcon
  UserGroupIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import gpsService from '../../services/gps.service';

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };

const GPSTracking = () => {
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [map, setMap] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: locationsData, refetch } = useQuery({
    queryKey: ['liveLocations'],
    queryFn: () => gpsService.getLiveLocations(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = locationsData?.locations?.filter(l => l.isOnline !== false).length || 0;
  const onDutyCount = locationsData?.locations?.filter(l => l.status === 'busy').length || 0;

  const getMarkerColor = (status) => {
    if (status === 'busy') return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    if (status === 'offline') return 'https://maps.google.com/mapfiles/ms/icons/grey-dot.png';
    return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GPS Live Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time location tracking of field staff</p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Technicians</p>
              <p className="text-2xl font-bold">{locationsData?.locations?.length || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Duty</p>
              <p className="text-2xl font-bold text-yellow-600">{onDutyCount}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={defaultCenter}
            onLoad={setMap}
          >
            {locationsData?.locations?.map((tech) => (
              <Marker
                key={tech.userId}
                position={{ lat: tech.latitude, lng: tech.longitude }}
                icon={{
                  url: getMarkerColor(tech.status),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                onClick={() => setSelectedTechnician(tech)}
              />
            ))}
            
            {selectedTechnician && (
              <InfoWindow
                position={{ lat: selectedTechnician.latitude, lng: selectedTechnician.longitude }}
                onCloseClick={() => setSelectedTechnician(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-semibold text-gray-900">{selectedTechnician.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTechnician.role}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {selectedTechnician.status || 'Online'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last update: {new Date(selectedTechnician.lastUpdate).toLocaleTimeString()}
                  </p>
                  <button className="mt-2 w-full text-center text-sm text-indigo-600 hover:text-indigo-800">
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Technicians List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Field Staff Locations</h3>
        <div className="space-y-3">
          {locationsData?.locations?.map((tech) => (
            <div 
              key={tech.userId} 
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              onClick={() => setSelectedTechnician(tech)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {tech.name?.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    tech.status === 'busy' ? 'bg-yellow-500' : 
                    tech.isOnline === false ? 'bg-gray-400' : 'bg-green-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                  <p className="text-xs text-gray-500">
                    {tech.role} • {tech.technicianType}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {tech.address || `${tech.latitude?.toFixed(4)}, ${tech.longitude?.toFixed(4)}`}
                </p>
                <p className="text-xs text-gray-400">
                  Updated: {new Date(tech.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GPSTracking;