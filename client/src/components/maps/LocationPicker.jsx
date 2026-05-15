import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPinIcon, MagnifyingGlassIcon, CrosshairIcon } from '@heroicons/react/24/outline';

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = null,
  address: initialAddress = '',
  readonly = false,
  showSearch = true,
  height = '400px'
}) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation);
  const [address, setAddress] = useState(initialAddress);
  const [searchBox, setSearchBox] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);

  useEffect(() => {
    if (initialLocation) {
      setMarker(initialLocation);
      if (map) {
        map.panTo(initialLocation);
        map.setZoom(16);
      }
    }
  }, [initialLocation, map]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onSearchBoxLoad = useCallback((ref) => {
    setSearchBox(ref);
  }, []);

  const onAutocompleteLoad = useCallback((autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarker(location);
        setAddress(place.formatted_address || '');
        if (map) {
          map.panTo(location);
          map.setZoom(16);
        }
        if (onLocationSelect) {
          onLocationSelect(location, place.formatted_address);
        }
      }
    }
  };

  const onMapClick = (e) => {
    if (readonly) return;
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarker(location);
    if (onLocationSelect) {
      onLocationSelect(location, address);
    }
    // Reverse geocode to get address
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
          if (onLocationSelect) {
            onLocationSelect(location, results[0].formatted_address);
          }
        }
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarker(location);
          if (map) {
            map.panTo(location);
            map.setZoom(16);
          }
          // Reverse geocode
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setAddress(results[0].formatted_address);
              if (onLocationSelect) {
                onLocationSelect(location, results[0].formatted_address);
              }
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your GPS settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearch && !readonly && (
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </Autocomplete>
            </LoadScript>
          </div>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <CrosshairIcon className="h-5 w-5" />
            <span>My Location</span>
          </button>
        </div>
      )}

      {/* Map */}
      <div className="relative" style={{ height }}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={marker || defaultCenter}
            zoom={14}
            onLoad={onLoad}
            onClick={onMapClick}
            options={{ draggable: !readonly }}
          >
            {marker && (
              <Marker
                position={marker}
                draggable={!readonly}
                onDragEnd={(e) => {
                  const location = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  };
                  setMarker(location);
                  if (onLocationSelect) {
                    onLocationSelect(location, address);
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>

        {/* Marker Info */}
        {marker && (
          <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10">
            <div className="flex items-start space-x-2">
              <MapPinIcon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white font-medium">Selected Location</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{address || 'Click on map to select location'}</p>
                {!readonly && (
                  <p className="text-xs text-indigo-600 mt-1">Click on map or drag marker to adjust</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {marker && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p>
          <p className="text-sm font-mono text-gray-900 dark:text-white">
            Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;