// import api from './api';

// const buildingService = {
//   // Building CRUD
//   getBuildings: async (filters = {}) => {
//     const params = new URLSearchParams();
//     if (filters.status) params.append('status', filters.status);
//     if (filters.search) params.append('search', filters.search);
    
//     const response = await api.get(`/buildings?${params.toString()}`);
//     return response.data;
//   },

//   getBuilding: async (id) => {
//     const response = await api.get(`/buildings/${id}`);
//     return response.data;
//   },

//   createBuilding: async (buildingData) => {
//     const response = await api.post('/buildings', buildingData);
//     return response.data;
//   },

//   updateBuilding: async (id, buildingData) => {
//     const response = await api.put(`/buildings/${id}`, buildingData);
//     return response.data;
//   },

//   deleteBuilding: async (id) => {
//     const response = await api.delete(`/buildings/${id}`);
//     return response.data;
//   },

//   // Floor management
//   getFloors: async (buildingId) => {
//     const response = await api.get(`/buildings/${buildingId}/floors`);
//     return response.data;
//   },

//   addFloor: async (buildingId, floorData) => {
//     const response = await api.post(`/buildings/${buildingId}/floors`, floorData);
//     return response.data;
//   },

//   updateFloor: async (buildingId, floorId, floorData) => {
//     const response = await api.put(`/buildings/${buildingId}/floors/${floorId}`, floorData);
//     return response.data;
//   },

//   deleteFloor: async (buildingId, floorId) => {
//     const response = await api.delete(`/buildings/${buildingId}/floors/${floorId}`);
//     return response.data;
//   },

//   // Zone/Room management
//   getZones: async (buildingId) => {
//     const response = await api.get(`/buildings/${buildingId}/zones`);
//     return response.data;
//   },

//   addZone: async (buildingId, zoneData) => {
//     const response = await api.post(`/buildings/${buildingId}/zones`, zoneData);
//     return response.data;
//   },
// };

// export default buildingService;

//crud added-naj-13 may

import api from './api';

const buildingService = {
  // Get all buildings
  getBuildings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/buildings?${params.toString()}`);
    return response.data;
  },

  // Get single building
  getBuilding: async (id) => {
    const response = await api.get(`/buildings/${id}`);
    return response.data;
  },

  // Create building
  createBuilding: async (buildingData) => {
    const response = await api.post('/buildings', buildingData);
    return response.data;
  },

  // Update building
  updateBuilding: async (id, buildingData) => {
    const response = await api.put(`/buildings/${id}`, buildingData);
    return response.data;
  },

  // Delete building
  deleteBuilding: async (id) => {
    const response = await api.delete(`/buildings/${id}`);
    return response.data;
  },

  // Get building floors
  getFloors: async (buildingId) => {
    const response = await api.get(`/buildings/${buildingId}/floors`);
    return response.data;
  },

  // Add floor to building
  addFloor: async (buildingId, floorData) => {
    const response = await api.post(`/buildings/${buildingId}/floors`, floorData);
    return response.data;
  },
};

export default buildingService;