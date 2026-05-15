import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap as GoogleMapComponent, LoadScript, Marker, InfoWindow, Polyline, Circle } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };
const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const GoogleMap = ({ 
  markers = [], 
  center = defaultCenter, 
  zoom = 14,
  onMarkerClick,
  onMapClick,
  showTraffic = false,
  polylines = [],
  circles = [],
  height = '400px',
  className = '',
  libraries = ['places']
}) => {
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (center.lat && center.lng) {
      setMapCenter(center);
      if (map) {
        map.panTo(center);
      }
    }
  }, [center, map]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) onMarkerClick(marker);
  };

  const handleMapClick = (e) => {
    if (onMapClick) {
      onMapClick({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  const getMarkerIcon = (type, color = 'red') => {
    const icons = {
      technician: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      building: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      complaint: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      task: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      default: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    };
    return icons[type] || icons.default;
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
        libraries={libraries}
      >
        <GoogleMapComponent
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={defaultOptions}
        >
          {/* Markers */}
          {markers.map((marker, index) => (
            <Marker
              key={marker.id || index}
              position={{ lat: marker.latitude, lng: marker.longitude }}
              icon={{
                url: getMarkerIcon(marker.type, marker.color),
                scaledSize: new window.google.maps.Size(32, 32),
              }}
              onClick={() => handleMarkerClick(marker)}
              title={marker.title}
            />
          ))}

          {/* Polylines */}
          {polylines.map((polyline, index) => (
            <Polyline
              key={index}
              path={polyline.path}
              options={{
                strokeColor: polyline.color || '#4F46E5',
                strokeOpacity: 0.8,
                strokeWeight: 3,
              }}
            />
          ))}

          {/* Circles (Geofences) */}
          {circles.map((circle, index) => (
            <Circle
              key={index}
              center={{ lat: circle.center.lat, lng: circle.center.lng }}
              radius={circle.radius}
              options={{
                fillColor: circle.color || '#4F46E5',
                fillOpacity: 0.2,
                strokeColor: circle.color || '#4F46E5',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          ))}

          {/* Selected Marker Info Window */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold text-gray-900">{selectedMarker.title}</h4>
                <p className="text-sm text-gray-600">{selectedMarker.description}</p>
                {selectedMarker.address && (
                  <p className="text-xs text-gray-500 mt-1">{selectedMarker.address}</p>
                )}
                {selectedMarker.onViewDetails && (
                  <button 
                    onClick={() => selectedMarker.onViewDetails(selectedMarker)}
                    className="mt-2 w-full text-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Details →
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMapComponent>
      </LoadScript>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 space-y-2">
        {showTraffic && (
          <button
            onClick={() => {
              const trafficLayer = new window.google.maps.TrafficLayer();
              trafficLayer.setMap(map);
            }}
            className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Show Traffic"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => {
            if (map && center.lat && center.lng) {
              map.panTo(center);
              map.setZoom(zoom);
            }
          }}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title="Reset View"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 019-9m0 0a9 9 0 019 9m-9-9v9m9 0a9 9 0 01-9 9m0 0a9 9 0 01-9-9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GoogleMap;