// import api from './api';

// const authService = {
//   // Authentication
//   login: async (email, password) => {
//     const response = await api.post('/auth/login', { email, password });
//     if (response.data.token) {
//       localStorage.setItem('token', response.data.token);
//     }
//     return response.data;
//   },

//   register: async (userData) => {
//     const response = await api.post('/auth/register', userData);
//     return response.data;
//   },

//   verifyOTP: async (email, otp) => {
//     const response = await api.post('/auth/verify-otp', { email, otp });
//     return response.data;
//   },

//   resendOTP: async (email) => {
//     const response = await api.post('/auth/resend-otp', { email });
//     return response.data;
//   },

//   forgotPassword: async (email) => {
//     const response = await api.post('/auth/forgot-password', { email });
//     return response.data;
//   },

//   resetPassword: async (token, newPassword) => {
//     const response = await api.post('/auth/reset-password', { token, newPassword });
//     return response.data;
//   },

//   changePassword: async (currentPassword, newPassword) => {
//     const response = await api.post('/auth/change-password', { currentPassword, newPassword });
//     return response.data;
//   },

//   refreshToken: async () => {
//     const token = localStorage.getItem('token');
//     const response = await api.post('/auth/refresh-token', { token });
//     if (response.data.token) {
//       localStorage.setItem('token', response.data.token);
//     }
//     return response.data;
//   },

//   logout: async () => {
//     const response = await api.post('/auth/logout');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     return response.data;
//   },

//   // User Profile
//   getMe: async () => {
//     const response = await api.get('/auth/me');
//     if (response.data.user) {
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   },

//   updateProfile: async (profileData) => {
//     const response = await api.put('/auth/profile', profileData);
//     if (response.data.user) {
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   },

//   updateAvatar: async (file) => {
//     const formData = new FormData();
//     formData.append('avatar', file);
//     const response = await api.post('/auth/avatar', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   },
// };

// export default authService;

// src/services/auth.service.js
import api from './api';

const authService = {
  // Authentication
  login: async (email, password) => {
    console.log('🔐 login function called with:', { email, password: '***' });
    
    // Validate inputs
    if (!email || !password) {
      console.error('❌ Missing email or password');
      throw new Error('Email and password are required');
    }
    
    const requestData = { email, password };
    console.log('📤 Sending request to:', '/auth/login');
    console.log('📦 Request data:', requestData);
    
    try {
      const response = await api.post('/auth/login', requestData);
      console.log('✅ Response received:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');
    const response = await api.post('/auth/refresh-token', { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  // User Profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default authService;