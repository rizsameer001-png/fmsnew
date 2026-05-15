const { Client } = require('@googlemaps/google-maps-services-js');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

const googleMapsClient = new Client({});

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: response.data.results[0].formatted_address,
      };
    }
    return { success: false, error: 'Address not found' };
  } catch (error) {
    logger.error('Geocode error:', error);
    return { success: false, error: error.message };
  }
};

// Reverse geocode (coordinates to address)
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await googleMapsClient.reverseGeocode({
      params: {
        latlng: `${latitude},${longitude}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    if (response.data.results.length > 0) {
      return {
        success: true,
        address: response.data.results[0].formatted_address,
        components: response.data.results[0].address_components,
      };
    }
    return { success: false, error: 'Location not found' };
  } catch (error) {
    logger.error('Reverse geocode error:', error);
    return { success: false, error: error.message };
  }
};

// Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Calculate travel time between two points
const calculateTravelTime = async (originLat, originLng, destLat, destLng, mode = 'driving') => {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${originLat},${originLng}`],
        destinations: [`${destLat},${destLng}`],
        mode: mode,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    const element = response.data.rows[0]?.elements[0];
    if (element?.status === 'OK') {
      return {
        success: true,
        distance: element.distance.value, // meters
        distanceText: element.distance.text,
        duration: element.duration.value, // seconds
        durationText: element.duration.text,
      };
    }
    return { success: false, error: 'Could not calculate route' };
  } catch (error) {
    logger.error('Calculate travel time error:', error);
    return { success: false, error: error.message };
  }
};

// Get static map image URL
const getStaticMapUrl = (latitude, longitude, zoom = 15, width = 600, height = 400, markers = []) => {
  let url = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  // Add markers
  markers.forEach((marker, index) => {
    url += `&markers=color:${marker.color || 'red'}|label:${marker.label || (index + 1)}|${marker.latitude},${marker.longitude}`;
  });
  
  return url;
};

// Get directions URL
const getDirectionsUrl = (originLat, originLng, destLat, destLng, mode = 'driving') => {
  return `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}/data=!3m1!4b1!4m2!4m1!3e0?entry=ttu`;
};

// Get place autocomplete suggestions
const getPlaceAutocomplete = async (input, types = ['geocode']) => {
  try {
    const response = await googleMapsClient.placeAutocomplete({
      params: {
        input: input,
        types: types,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    return {
      success: true,
      predictions: response.data.predictions.map(p => ({
        description: p.description,
        placeId: p.place_id,
      })),
    };
  } catch (error) {
    logger.error('Place autocomplete error:', error);
    return { success: false, error: error.message };
  }
};

// Get place details by place ID
const getPlaceDetails = async (placeId) => {
  try {
    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    const place = response.data.result;
    return {
      success: true,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
    };
  } catch (error) {
    logger.error('Place details error:', error);
    return { success: false, error: error.message };
  }
};

// Check if point is within geofence (circle)
const isWithinCircleGeofence = (pointLat, pointLng, centerLat, centerLng, radiusMeters) => {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radiusMeters;
};

// Check if point is within polygon geofence
const isWithinPolygonGeofence = (pointLat, pointLng, polygonPoints) => {
  let inside = false;
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i].latitude;
    const yi = polygonPoints[i].longitude;
    const xj = polygonPoints[j].latitude;
    const yj = polygonPoints[j].longitude;
    
    const intersect = ((yi > pointLng) !== (yj > pointLng)) &&
      (pointLat < (xj - xi) * (pointLng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Get nearby places
const getNearbyPlaces = async (latitude, longitude, radius = 1000, type = 'restaurant') => {
  try {
    const response = await googleMapsClient.placesNearby({
      params: {
        location: `${latitude},${longitude}`,
        radius: radius,
        type: type,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    return {
      success: true,
      places: response.data.results.map(place => ({
        name: place.name,
        address: place.vicinity,
        location: place.geometry.location,
        rating: place.rating,
        types: place.types,
      })),
    };
  } catch (error) {
    logger.error('Nearby places error:', error);
    return { success: false, error: error.message };
  }
};

// Optimize route for multiple destinations
const optimizeRoute = async (originLat, originLng, destinations) => {
  try {
    const waypoints = destinations.map(d => `${d.latitude},${d.longitude}`);
    const response = await googleMapsClient.directions({
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${originLat},${originLng}`,
        waypoints: waypoints,
        optimize: true,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    
    const route = response.data.routes[0];
    if (route) {
      const waypointOrder = route.waypoint_order;
      const optimizedDestinations = waypointOrder.map(i => destinations[i]);
      
      return {
        success: true,
        optimizedOrder: optimizedDestinations,
        totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
        totalDuration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
      };
    }
    return { success: false, error: 'No route found' };
  } catch (error) {
    logger.error('Route optimization error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  calculateTravelTime,
  getStaticMapUrl,
  getDirectionsUrl,
  getPlaceAutocomplete,
  getPlaceDetails,
  isWithinCircleGeofence,
  isWithinPolygonGeofence,
  getNearbyPlaces,
  optimizeRoute,
};