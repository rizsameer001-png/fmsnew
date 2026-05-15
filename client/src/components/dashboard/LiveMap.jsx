import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const LiveMap = () => {
  const [map, setMap] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  // Mock technician locations
  const mockTechnicians = [
    { id: 1, name: 'John Electric', lat: 19.0780, lng: 72.8780, role: 'Electrician', status: 'busy' },
    { id: 2, name: 'Mike Plumber', lat: 19.0740, lng: 72.8770, role: 'Plumber', status: 'online' },
    { id: 3, name: 'Sarah Clean', lat: 19.0790, lng: 72.8760, role: 'Cleaner', status: 'online' },
    { id: 4, name: 'David Security', lat: 19.0750, lng: 72.8790, role: 'Security', status: 'busy' },
  ];

  useEffect(() => {
    // In production, fetch live locations from API via socket.io
    setTechnicians(mockTechnicians);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTechnicians(prev => 
        prev.map(tech => ({
          ...tech,
          lat: tech.lat + (Math.random() - 0.5) * 0.0005,
          lng: tech.lng + (Math.random() - 0.5) * 0.0005,
        }))
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'online': return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'busy': return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      default: return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={defaultCenter}
        options={mapOptions}
        onLoad={setMap}
      >
        {technicians.map((tech) => (
          <Marker
            key={tech.id}
            position={{ lat: tech.lat, lng: tech.lng }}
            icon={{
              url: getMarkerColor(tech.status),
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            onClick={() => setSelectedTechnician(tech)}
          />
        ))}

        {selectedTechnician && (
          <InfoWindow
            position={{ lat: selectedTechnician.lat, lng: selectedTechnician.lng }}
            onCloseClick={() => setSelectedTechnician(null)}
          >
            <div className="p-2 min-w-[200px]">
              <h4 className="font-semibold text-gray-900">{selectedTechnician.name}</h4>
              <p className="text-sm text-gray-600">{selectedTechnician.role}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTechnician.status === 'online' ? 'bg-green-100 text-green-800' :
                  selectedTechnician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTechnician.status.toUpperCase()}
                </span>
                <button className="text-xs text-indigo-600 hover:text-indigo-700">
                  View Details
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LiveMap;