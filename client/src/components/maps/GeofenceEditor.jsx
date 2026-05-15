import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, DrawingManager, Marker, Circle, Polygon } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 19.0760, lng: 72.8777 };

const GeofenceEditor = ({ 
  initialGeofence, 
  onSave, 
  onCancel,
  buildingId,
  buildingName 
}) => {
  const [map, setMap] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [geofence, setGeofence] = useState(initialGeofence || {
    shape: 'circle',
    center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    radius: 100,
    polygon: [],
    name: `${buildingName || 'Building'} Geofence`,
    allowedRoles: ['technician', 'security', 'cleaning'],
    checkInRequired: true,
    checkOutRequired: true,
  });
  const [drawingManager, setDrawingManager] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onDrawingManagerLoad = useCallback((dm) => {
    setDrawingManager(dm);
  }, []);

  const onCircleComplete = (circle) => {
    const center = circle.getCenter();
    const radius = circle.getRadius();
    setGeofence({
      ...geofence,
      shape: 'circle',
      center: { lat: center.lat(), lng: center.lng() },
      radius: radius,
    });
    setIsDrawing(false);
    setDrawingMode(null);
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  };

  const onPolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const vertices = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      vertices.push({ lat: latLng.lat(), lng: latLng.lng() });
    }
    setGeofence({
      ...geofence,
      shape: 'polygon',
      polygon: vertices,
    });
    setIsDrawing(false);
    setDrawingMode(null);
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  };

  const handleDrawingMode = (mode) => {
    setDrawingMode(mode);
    setIsDrawing(true);
    if (drawingManager) {
      drawingManager.setDrawingMode(mode);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(geofence);
    }
  };

  const handleRoleToggle = (role) => {
    setGeofence(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter(r => r !== role)
        : [...prev.allowedRoles, role]
    }));
  };

  const roles = [
    { value: 'technician', label: 'Technicians' },
    { value: 'supervisor', label: 'Supervisors' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning Staff' },
  ];

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['drawing']}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={geofence.shape === 'circle' ? geofence.center : defaultCenter}
            zoom={15}
            onLoad={onLoad}
          >
            {/* Drawing Manager */}
            <DrawingManager
              onLoad={onDrawingManagerLoad}
              options={{
                drawingControl: false,
                circleOptions: {
                  fillColor: '#4F46E5',
                  fillOpacity: 0.2,
                  strokeColor: '#4F46E5',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                },
                polygonOptions: {
                  fillColor: '#4F46E5',
                  fillOpacity: 0.2,
                  strokeColor: '#4F46E5',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                },
              }}
              onCircleComplete={onCircleComplete}
              onPolygonComplete={onPolygonComplete}
            />

            {/* Existing Geofence */}
            {geofence.shape === 'circle' && geofence.center && (
              <Circle
                center={geofence.center}
                radius={geofence.radius}
                options={{
                  fillColor: '#4F46E5',
                  fillOpacity: 0.2,
                  strokeColor: '#4F46E5',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                }}
                onEdit={() => {}}
              />
            )}
            {geofence.shape === 'polygon' && geofence.polygon.length > 0 && (
              <Polygon
                paths={geofence.polygon}
                options={{
                  fillColor: '#4F46E5',
                  fillOpacity: 0.2,
                  strokeColor: '#4F46E5',
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Drawing Tools */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Draw Geofence</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDrawingMode('circle')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  drawingMode === 'circle'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Draw Circle
              </button>
              <button
                onClick={() => handleDrawingMode('polygon')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  drawingMode === 'polygon'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Draw Polygon
              </button>
              {isDrawing && (
                <button
                  onClick={() => {
                    if (drawingManager) {
                      drawingManager.setDrawingMode(null);
                    }
                    setIsDrawing(false);
                    setDrawingMode(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              )}
            </div>
            {isDrawing && (
              <p className="mt-3 text-sm text-indigo-600 dark:text-indigo-400">
                Click on the map to draw the {drawingMode === 'circle' ? 'circle' : 'polygon'}. Double-click to finish.
              </p>
            )}
          </div>

          {/* Right Side - Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Geofence Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Geofence Name
                </label>
                <input
                  type="text"
                  value={geofence.name}
                  onChange={(e) => setGeofence({ ...geofence, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allowed Roles
                </label>
                <div className="flex flex-wrap gap-3">
                  {roles.map((role) => (
                    <label key={role.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={geofence.allowedRoles.includes(role.value)}
                        onChange={() => handleRoleToggle(role.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={geofence.checkInRequired}
                    onChange={(e) => setGeofence({ ...geofence, checkInRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require Check-in</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={geofence.checkOutRequired}
                    onChange={(e) => setGeofence({ ...geofence, checkOutRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Require Check-out</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Geofence
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>How to use:</strong> Click "Draw Circle" or "Draw Polygon" then click on the map to create your geofence. 
          Double-click to finish drawing. You can drag and resize the shape after drawing.
        </p>
      </div>
    </div>
  );
};

export default GeofenceEditor;