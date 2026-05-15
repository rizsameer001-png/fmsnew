// // client/src/services/role.service.js
// import api from './api';

// const roleService = {
//   // Get all roles
//   getRoles: async (filters = {}) => {
//     const params = new URLSearchParams();
//     if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
//     if (filters.search) params.append('search', filters.search);
    
//     const response = await api.get(`/roles?${params.toString()}`);
//     return response.data;
//   },

//   // Get single role
//   getRole: async (id) => {
//     const response = await api.get(`/roles/${id}`);
//     return response.data;
//   },

//   // Create role
//   createRole: async (roleData) => {
//     console.log('📤 Creating role with data:', roleData);
//     const response = await api.post('/roles', roleData, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log('📥 Create role response:', response.data);
//     return response.data;
//   },

//   // Update role
//   updateRole: async (id, roleData) => {
//     const response = await api.put(`/roles/${id}`, roleData);
//     return response.data;
//   },

//   // Delete role
//   deleteRole: async (id) => {
//     const response = await api.delete(`/roles/${id}`);
//     return response.data;
//   },

//   // Toggle role status
//   toggleRoleStatus: async (id) => {
//     const response = await api.put(`/roles/${id}/toggle`);
//     return response.data;
//   },

//   // Get permissions list
//   getPermissionsList: async () => {
//     const response = await api.get('/roles/permissions');
//     return response.data;
//   },
// };

// export default roleService;


// client/src/services/role.service.js
import api from './api';

const roleService = {
  // Get all roles
  getRoles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/roles?${params.toString()}`);
    return response.data;
  },

  // Get single role
  getRole: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  createRole: async (roleData) => {
    console.log('📤 Sending create role request with data:', JSON.stringify(roleData, null, 2));
    
    // Make sure we're sending a proper object
    const payload = {
      name: roleData.name,
      displayName: roleData.displayName,
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      isActive: roleData.isActive !== undefined ? roleData.isActive : true
    };
    
    console.log('📤 Payload being sent:', payload);
    
    const response = await api.post('/roles', payload);
    console.log('📥 Create role response:', response.data);
    return response.data;
  },

  // Update role
  updateRole: async (id, roleData) => {
    const payload = {
      displayName: roleData.displayName,
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      isActive: roleData.isActive !== undefined ? roleData.isActive : true
    };
    
    const response = await api.put(`/roles/${id}`, payload);
    return response.data;
  },

  // Delete role
  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  // Toggle role status
  toggleRoleStatus: async (id) => {
    const response = await api.put(`/roles/${id}/toggle`);
    return response.data;
  },

  // Get permissions list
  getPermissionsList: async () => {
    const response = await api.get('/roles/permissions');
    return response.data;
  },
};

export default roleService;