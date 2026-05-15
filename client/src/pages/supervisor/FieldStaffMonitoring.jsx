import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPinIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import userService from '../../services/user.service';
import gpsService from '../../services/gps.service';

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };

const FieldStaffMonitoring = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [map, setMap] = useState(null);

  const { data: staffData, refetch } = useQuery({
    queryKey: ['fieldStaff'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
    refetchInterval: 30000,
  });

  const { data: locationsData } = useQuery({
    queryKey: ['staffLocations'],
    queryFn: () => gpsService.getLiveLocations(),
    refetchInterval: 10000,
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMarkerColor = (status) => {
    if (status === 'busy') return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    if (status === 'offline') return 'https://maps.google.com/mapfiles/ms/icons/grey-dot.png';
    return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  const sendQuickMessage = (staffId) => {
    // Implement chat functionality
    window.location.href = `/supervisor/chat?userId=${staffId}`;
  };

  const callStaff = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Staff Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time tracking and status of field technicians</p>
        </div>
        <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Refresh</button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Total Staff</p><p className="text-2xl font-bold">{staffData?.users?.length || 0}</p></div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><MapPinIcon className="h-6 w-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div><p className="text-sm text-gray-600">Online Now</p><p className="text-2xl font-bold text-green-600">{staffData?.users?.filter(s => s.status === 'online').length || 0}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div><p className="text-sm text-gray-600">On Task</p><p className="text-2xl font-bold text-yellow-600">{staffData?.users?.filter(s => s.status === 'busy').length || 0}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div><p className="text-sm text-gray-600">Tasks Today</p><p className="text-2xl font-bold text-indigo-600">{staffData?.users?.reduce((sum, s) => sum + (s.tasksToday || 0), 0) || 0}</p></div>
        </div>
      </div>

      {/* Live Map */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Location Tracking</h3>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={mapContainerStyle} zoom={13} center={defaultCenter} onLoad={setMap}>
            {locationsData?.locations?.map((staff) => (
              <Marker
                key={staff.userId}
                position={{ lat: staff.latitude, lng: staff.longitude }}
                icon={{ url: getMarkerColor(staff.status), scaledSize: new window.google.maps.Size(32, 32) }}
                onClick={() => setSelectedStaff(staff)}
              />
            ))}
            {selectedStaff && (
              <InfoWindow position={{ lat: selectedStaff.latitude, lng: selectedStaff.longitude }} onCloseClick={() => setSelectedStaff(null)}>
                <div className="p-2 min-w-[200px]"><h4 className="font-semibold text-gray-900">{selectedStaff.name}</h4><p className="text-sm text-gray-600">{selectedStaff.role}</p><p className="text-xs text-gray-500 mt-1">Status: {selectedStaff.status || 'Online'}</p><p className="text-xs text-gray-500">Last update: {new Date(selectedStaff.lastUpdate).toLocaleTimeString()}</p><button className="mt-2 w-full text-center text-sm text-indigo-600 hover:text-indigo-800">View Details</button></div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Directory</h3>
        <div className="space-y-3">
          {staffData?.users?.map((staff) => (
            <div key={staff._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">{staff.name?.charAt(0)}</span>
                  </div>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(staff.status)}`}></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{staff.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{staff.technicianType} • {staff.tasksToday || 0} tasks today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  staff.status === 'online' ? 'bg-green-100 text-green-800' :
                  staff.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {staff.status?.toUpperCase() || 'OFFLINE'}
                </span>
                <button onClick={() => callStaff(staff.phone)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button onClick={() => sendQuickMessage(staff._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </button>
                <button onClick={() => setSelectedStaff(locationsData?.locations?.find(l => l.userId === staff._id))} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <MapPinIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldStaffMonitoring;