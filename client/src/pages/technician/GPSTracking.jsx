// import React, { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { MapPinIcon, ArrowPathIcon, CrosshairIcon } from '@heroicons/react/24/outline';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// import { toast } from 'react-hot-toast';
// import gpsService from '../../services/gps.service';

// const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '0.75rem' };
// const defaultCenter = { lat: 19.0760, lng: 72.8777 };

// const TechnicianGPSTracking = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [map, setMap] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);

//   // Get current location
//   const getCurrentLocation = () => {
//     setIsLocating(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const location = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setCurrentLocation(location);
//           if (map) {
//             map.panTo(location);
//             map.setZoom(16);
//           }
//           toast.success('Location updated');
//           setIsLocating(false);
//         },
//         (error) => {
//           console.error('Geolocation error:', error);
//           toast.error('Unable to get your location');
//           setIsLocating(false);
//         },
//         { enableHighAccuracy: true }
//       );
//     } else {
//       toast.error('Geolocation is not supported by your browser');
//       setIsLocating(false);
//     }
//   };

//   // Send location to server periodically
//   useEffect(() => {
//     if (currentLocation) {
//       const sendLocation = async () => {
//         try {
//           await gpsService.updateLocation(currentLocation.lat, currentLocation.lng);
//         } catch (error) {
//           console.error('Failed to send location:', error);
//         }
//       };
//       sendLocation();

//       const interval = setInterval(() => {
//         if (currentLocation) {
//           gpsService.updateLocation(currentLocation.lat, currentLocation.lng);
//         }
//       }, 30000); // Update every 30 seconds

//       return () => clearInterval(interval);
//     }
//   }, [currentLocation]);

//   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//   if (!apiKey) {
//     return (
//       <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 text-center">
//         <MapPinIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
//         <p className="text-yellow-800 dark:text-yellow-200">
//           ⚠️ Google Maps API key is not configured.
//         </p>
//         <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
//           Please add VITE_GOOGLE_MAPS_API_KEY to your .env file
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPS Tracking</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Share your live location with supervisor</p>
//         </div>
//         <button
//           onClick={getCurrentLocation}
//           disabled={isLocating}
//           className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//         >
//           <CrosshairIcon className="h-5 w-5" />
//           <span>{isLocating ? 'Getting location...' : 'Share My Location'}</span>
//         </button>
//       </div>

//       {/* Location Status */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex items-center space-x-3">
//           <div className={`h-3 w-3 rounded-full ${currentLocation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//           <span className="text-gray-700 dark:text-gray-300">
//             {currentLocation ? 'Location sharing active' : 'Location not shared'}
//           </span>
//         </div>
//         {currentLocation && (
//           <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//             <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
//             <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
//           </div>
//         )}
//       </div>

//       {/* Map */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Location</h3>
//         <div className="h-[400px] rounded-lg overflow-hidden">
//           <LoadScript googleMapsApiKey={apiKey}>
//             <GoogleMap
//               mapContainerStyle={mapContainerStyle}
//               center={currentLocation || defaultCenter}
//               zoom={15}
//               onLoad={setMap}
//             >
//               {currentLocation && (
//                 <Marker
//                   position={currentLocation}
//                   icon={{
//                     url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
//                     scaledSize: new window.google.maps.Size(40, 40),
//                   }}
//                 />
//               )}
//               {currentLocation && (
//                 <InfoWindow position={currentLocation}>
//                   <div className="p-2">
//                     <h4 className="font-semibold text-gray-900">Your Location</h4>
//                     <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
//                   </div>
//                 </InfoWindow>
//               )}
//             </GoogleMap>
//           </LoadScript>
//         </div>
//       </div>

//       {/* Info Section */}
//       <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
//         <div className="flex items-start space-x-3">
//           <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 dark:text-blue-200">
//               Your location is shared with your supervisor for real-time tracking.
//               This helps in efficient task assignment and ensures your safety.
//             </p>
//             <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
//               Location updates every 30 seconds. You can stop sharing by refreshing the page.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TechnicianGPSTracking;


// import React, { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// //import { MapPinIcon, ArrowPathIcon, CrosshairIcon } from '@heroicons/react/24/outline';
// import { MapPinIcon, ArrowPathIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// import { toast } from 'react-hot-toast';
// import gpsService from '../../services/gps.service';

// const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '0.75rem' };
// const defaultCenter = { lat: 19.0760, lng: 72.8777 };

// const TechnicianGPSTracking = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [map, setMap] = useState(null);
//   const [isLocating, setIsLocating] = useState(false);
//   const [watchId, setWatchId] = useState(null);

//     // ✅ DEBUG: Read API key
//   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//   // ✅ DEBUG: Print full env (optional)
//   console.log("ENV OBJECT:", import.meta.env);

//   // ✅ DEBUG: Print API key clearly
//   console.log("Google Maps API Key:", apiKey);

//   // Get current location
//   const getCurrentLocation = () => {
//     setIsLocating(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const location = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setCurrentLocation(location);
//           if (map) {
//             map.panTo(location);
//             map.setZoom(16);
//           }
//           toast.success('Location updated');
//           setIsLocating(false);
//         },
//         (error) => {
//           console.error('Geolocation error:', error);
//           toast.error('Unable to get your location');
//           setIsLocating(false);
//         },
//         { enableHighAccuracy: true }
//       );
//     } else {
//       toast.error('Geolocation is not supported by your browser');
//       setIsLocating(false);
//     }
//   };

//   // Start continuous location tracking
//   const startTracking = () => {
//     if (navigator.geolocation) {
//       const id = navigator.geolocation.watchPosition(
//         async (position) => {
//           const location = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setCurrentLocation(location);
          
//           // Send location to server
//           try {
//             await gpsService.updateLocation(location.lat, location.lng);
//           } catch (error) {
//             console.error('Failed to send location:', error);
//           }
          
//           if (map) {
//             map.panTo(location);
//           }
//         },
//         (error) => {
//           console.error('Watch position error:', error);
//         },
//         { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 }
//       );
//       setWatchId(id);
//       toast.success('Location tracking started');
//     }
//   };

//   // Stop tracking
//   const stopTracking = () => {
//     if (watchId) {
//       navigator.geolocation.clearWatch(watchId);
//       setWatchId(null);
//       toast.success('Location tracking stopped');
//     }
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (watchId) {
//         navigator.geolocation.clearWatch(watchId);
//       }
//     };
//   }, [watchId]);

//   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//   if (!apiKey) {
//     return (
//       <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 text-center">
//         <MapPinIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
//         <p className="text-yellow-800 dark:text-yellow-200">
//           ⚠️ Google Maps API key is not configured.
//         </p>
//         <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
//           Please add VITE_GOOGLE_MAPS_API_KEY to your .env file
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPS Tracking</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Share your live location with supervisor</p>
//         </div>
//         <div className="flex space-x-2">
//           {!watchId ? (
//             <button
//               onClick={startTracking}
//               className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               <CursorArrowRaysIcon className="h-5 w-5" />
//               <span>Start Tracking</span>
//             </button>
//           ) : (
//             <button
//               onClick={stopTracking}
//               className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               <CursorArrowRaysIcon className="h-5 w-5" />
//               <span>Stop Tracking</span>
//             </button>
//           )}
//           <button
//             onClick={getCurrentLocation}
//             disabled={isLocating}
//             className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//           >
//             <ArrowPathIcon className="h-5 w-5" />
//             <span>{isLocating ? 'Getting location...' : 'Get Location'}</span>
//           </button>
//         </div>
//       </div>

//       {/* Location Status */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className={`h-3 w-3 rounded-full ${watchId ? 'bg-green-500 animate-pulse' : currentLocation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//             <span className="text-gray-700 dark:text-gray-300">
//               {watchId ? 'Location tracking active' : currentLocation ? 'Last location captured' : 'Location not shared'}
//             </span>
//           </div>
//           {watchId && (
//             <span className="text-xs text-green-600 animate-pulse">● LIVE</span>
//           )}
//         </div>
//         {currentLocation && (
//           <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//             <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
//             <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
//           </div>
//         )}
//       </div>

//       {/* Map */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Location</h3>
//         <div className="h-[400px] rounded-lg overflow-hidden">
//           <LoadScript googleMapsApiKey={apiKey}>
//             <GoogleMap
//               mapContainerStyle={mapContainerStyle}
//               center={currentLocation || defaultCenter}
//               zoom={15}
//               onLoad={setMap}
//             >
//               {currentLocation && (
//                 <Marker
//                   position={currentLocation}
//                   icon={{
//                     url: watchId 
//                       ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
//                       : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
//                     scaledSize: new window.google.maps.Size(40, 40),
//                   }}
//                 />
//               )}
//               {currentLocation && (
//                 <InfoWindow position={currentLocation}>
//                   <div className="p-2">
//                     <h4 className="font-semibold text-gray-900">Your Location</h4>
//                     <p className="text-sm text-gray-600">
//                       {watchId ? 'Live tracking active' : 'Last updated'} 
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {new Date().toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </InfoWindow>
//               )}
//             </GoogleMap>
//           </LoadScript>
//         </div>
//       </div>

//       {/* Info Section */}
//       <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
//         <div className="flex items-start space-x-3">
//           <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
//           <div>
//             <p className="text-sm text-blue-800 dark:text-blue-200">
//               {watchId 
//                 ? 'Your location is being shared in real-time with your supervisor. This helps in efficient task assignment and ensures your safety.'
//                 : 'Start tracking to share your live location with your supervisor. Location updates every 30 seconds.'
//               }
//             </p>
//             <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
//               {watchId 
//                 ? 'Click "Stop Tracking" to stop sharing your location.'
//                 : 'Your privacy is important. Location sharing is optional and can be stopped anytime.'
//               }
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TechnicianGPSTracking;


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon, ArrowPathIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import gpsService from '../../services/gps.service';

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };

const TechnicianGPSTracking = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // ✅ DEBUG: Read API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // ✅ DEBUG: Print full env (optional)
  console.log("ENV OBJECT:", import.meta.env);

  // ✅ DEBUG: Print API key clearly
  console.log("Google Maps API Key:", apiKey);

  // Get current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (map) {
            map.panTo(location);
            map.setZoom(16);
          }
          toast.success('Location updated');
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get your location');
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
    }
  };

  // Start continuous location tracking
  const startTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          
          // Send location to server
          try {
            await gpsService.updateLocation(location.lat, location.lng);
          } catch (error) {
            console.error('Failed to send location:', error);
          }
          
          if (map) {
            map.panTo(location);
          }
        },
        (error) => {
          console.error('Watch position error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 }
      );
      setWatchId(id);
      toast.success('Location tracking started');
    }
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      toast.success('Location tracking stopped');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // ❌ If API key missing
  if (!apiKey) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 text-center">
        <MapPinIcon className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <p className="text-yellow-800 dark:text-yellow-200">
          ⚠️ Google Maps API key is not configured.
        </p>

        {/* ✅ DEBUG: Show API key in UI */}
        <p className="text-xs text-red-500 mt-2">
          DEBUG KEY: {String(apiKey)}
        </p>

        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
          Please add VITE_GOOGLE_MAPS_API_KEY to your .env file
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ✅ DEBUG: Show API key in UI (only first few chars) */}
      <div className="text-xs text-gray-400">
        DEBUG KEY: {apiKey ? apiKey.substring(0, 10) + "..." : "NOT FOUND"}
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPS Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Share your live location with supervisor
          </p>
        </div>

        <div className="flex space-x-2">
          {!watchId ? (
            <button
              onClick={startTracking}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CursorArrowRaysIcon className="h-5 w-5" />
              <span>Start Tracking</span>
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <CursorArrowRaysIcon className="h-5 w-5" />
              <span>Stop Tracking</span>
            </button>
          )}

          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>{isLocating ? 'Getting location...' : 'Get Location'}</span>
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Live Location
        </h3>

        <div className="h-[400px] rounded-lg overflow-hidden">
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={15}
              onLoad={setMap}
            >
              {currentLocation && (
                <Marker position={currentLocation} />
              )}

              {currentLocation && (
                <InfoWindow position={currentLocation}>
                  <div className="p-2">
                    <h4 className="font-semibold text-gray-900">Your Location</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default TechnicianGPSTracking;