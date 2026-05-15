// src/components/dashboard/LiveMap.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPinIcon } from '@heroicons/react/24/outline';

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const LiveMap = ({ technicians = [] }) => {
  const [map, setMap] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Mock data for demo
  const mockTechnicians = [
    { id: 1, name: 'John Electric', lat: 19.0780, lng: 72.8780, role: 'Electrician', status: 'busy', lastUpdate: new Date() },
    { id: 2, name: 'Mike Plumber', lat: 19.0740, lng: 72.8770, role: 'Plumber', status: 'online', lastUpdate: new Date() },
    { id: 3, name: 'Sarah Clean', lat: 19.0790, lng: 72.8760, role: 'Cleaner', status: 'online', lastUpdate: new Date() },
  ];

  const displayTechnicians = technicians.length > 0 ? technicians : mockTechnicians;

  const getMarkerIcon = (status) => {
    if (status === 'busy') return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    if (status === 'offline') return 'https://maps.google.com/mapfiles/ms/icons/grey-dot.png';
    return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // If no API key, show a fallback
  if (!apiKey) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center h-full">
        <div className="text-center p-6">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Google Maps API key not configured</p>
          <p className="text-sm text-gray-400 mt-2">Add VITE_GOOGLE_MAPS_API_KEY to .env</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      onLoad={() => setIsScriptLoaded(true)}
    >
      {isScriptLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={defaultCenter}
          options={mapOptions}
          onLoad={setMap}
        >
          {displayTechnicians.map((tech) => (
            tech.lat && tech.lng && (
              <Marker
                key={tech.id}
                position={{ lat: tech.lat, lng: tech.lng }}
                icon={{
                  url: getMarkerIcon(tech.status),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                onClick={() => setSelectedTechnician(tech)}
              />
            )
          ))}

          {selectedTechnician && (
            <InfoWindow
              position={{ lat: selectedTechnician.lat, lng: selectedTechnician.lng }}
              onCloseClick={() => setSelectedTechnician(null)}
            >
              <div className="p-2 min-w-[180px]">
                <h4 className="font-semibold text-gray-900">{selectedTechnician.name}</h4>
                <p className="text-sm text-gray-600">{selectedTechnician.role}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {selectedTechnician.status}
                </p>
                <button className="mt-2 w-full text-center text-sm text-indigo-600 hover:text-indigo-800">
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </LoadScript>
  );
};

export default LiveMap;