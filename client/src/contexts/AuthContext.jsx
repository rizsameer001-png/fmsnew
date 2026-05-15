// // src/contexts/AuthContext.jsx
// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import authService from '../services/auth.service';
// import jwtDecode from 'jwt-decode';  // Default import, not named import

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [permissions, setPermissions] = useState([]);
//   const navigate = useNavigate();

//   // Check if token is expired
//   const isTokenExpired = useCallback((token) => {
//     try {
//       const decoded = jwtDecode(token);
//       return decoded.exp < Date.now() / 1000;
//     } catch (error) {
//       return true;
//     }
//   }, []);

//   // Rest of your code remains the same...
//   // Load user from token
//   const loadUser = useCallback(async () => {
//     if (!token || isTokenExpired(token)) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await authService.getMe();
//       setUser(response.user);
//       setPermissions(getUserPermissions(response.user.role));
//     } catch (error) {
//       console.error('Failed to load user:', error);
//       logout();
//     } finally {
//       setIsLoading(false);
//     }
//   }, [token, isTokenExpired]);

//   useEffect(() => {
//     loadUser();
//   }, [loadUser]);

//   // Get permissions based on role
//   const getUserPermissions = (role) => {
//     const permissionsMap = {
//       super_admin: ['*'],
//       manager: [
//         'view_dashboard', 'view_team', 'manage_supervisors', 'assign_technicians',
//         'view_complaints', 'manage_complaints', 'view_attendance', 'manage_attendance',
//         'view_reports', 'export_reports', 'approve_requests', 'view_sla'
//       ],
//       supervisor: [
//         'view_dashboard', 'view_team', 'assign_tasks', 'verify_work',
//         'view_complaints', 'manage_complaints', 'view_attendance', 'mark_attendance',
//         'upload_reports', 'escalate_issues', 'team_communication'
//       ],
//       technician: [
//         'view_dashboard', 'view_tasks', 'update_task_status', 'upload_proof',
//         'mark_attendance', 'view_attendance', 'receive_notifications',
//         'send_emergency_alert', 'view_schedule'
//       ],
//       customer: [
//         'view_dashboard', 'create_complaints', 'view_complaints', 'view_invoices',
//         'make_payments', 'view_payment_history', 'chat_support', 'view_service_history'
//       ],
//     };
//     return permissionsMap[role] || [];
//   };

//   // Check if user has permission
//   const hasPermission = useCallback((permission) => {
//     if (permissions.includes('*')) return true;
//     return permissions.includes(permission);
//   }, [permissions]);

//   // Login
//   const login = async (email, password) => {
//     setIsLoading(true);
//     try {
//       const response = await authService.login(email, password);
//       const { token, user } = response;
      
//       localStorage.setItem('token', token);
//       setToken(token);
//       setUser(user);
//       setPermissions(getUserPermissions(user.role));
      
//       toast.success('Login successful!');
      
//       // Redirect based on role
//       const roleRoutes = {
//         super_admin: '/admin/dashboard',
//         manager: '/manager/dashboard',
//         supervisor: '/supervisor/dashboard',
//         technician: '/technician/dashboard',
//         customer: '/customer/dashboard',
//       };
      
//       navigate(roleRoutes[user.role] || '/');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Register
//   const register = async (userData) => {
//     setIsLoading(true);
//     try {
//       const response = await authService.register(userData);
//       toast.success('Registration successful! Please verify your OTP');
//       navigate('/verify-otp', { state: { email: userData.email } });
//       return { success: true, data: response };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Verify OTP
//   const verifyOTP = async (email, otp) => {
//     setIsLoading(true);
//     try {
//       await authService.verifyOTP(email, otp);
//       toast.success('Email verified successfully! You can now login.');
//       navigate('/login');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'OTP verification failed';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Forgot password
//   const forgotPassword = async (email) => {
//     setIsLoading(true);
//     try {
//       await authService.forgotPassword(email);
//       toast.success('Password reset link sent to your email');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to send reset link';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Reset password
//   const resetPassword = async (token, newPassword) => {
//     setIsLoading(true);
//     try {
//       await authService.resetPassword(token, newPassword);
//       toast.success('Password reset successful! Please login.');
//       navigate('/login');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Password reset failed';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Change password
//   const changePassword = async (currentPassword, newPassword) => {
//     setIsLoading(true);
//     try {
//       await authService.changePassword(currentPassword, newPassword);
//       toast.success('Password changed successfully');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to change password';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update profile
//   const updateProfile = async (profileData) => {
//     setIsLoading(true);
//     try {
//       const response = await authService.updateProfile(profileData);
//       setUser(response.user);
//       toast.success('Profile updated successfully');
//       return { success: true, user: response.user };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to update profile';
//       toast.error(message);
//       return { success: false, error: message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Logout
//   const logout = async () => {
//     try {
//       await authService.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       setToken(null);
//       setUser(null);
//       setPermissions([]);
//       navigate('/login');
//       toast.success('Logged out successfully');
//     }
//   };

//   const value = {
//     user,
//     setUser,
//     isLoading,
//     permissions,
//     hasPermission,
//     login,
//     register,
//     verifyOTP,
//     forgotPassword,
//     resetPassword,
//     changePassword,
//     updateProfile,
//     logout,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthProvider;


// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }, []);

  // Load user from token
  const loadUser = useCallback(async () => {
    if (!token || isTokenExpired(token)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      setUser(response.user);
      setPermissions(getUserPermissions(response.user.role));
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token, isTokenExpired]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Get permissions based on role
  const getUserPermissions = (role) => {
    const permissionsMap = {
      super_admin: ['*'],
      manager: ['view_dashboard', 'view_team', 'manage_supervisors', 'assign_technicians', 'view_complaints', 'manage_complaints', 'view_attendance', 'manage_attendance', 'view_reports', 'export_reports', 'approve_requests', 'view_sla'],
      supervisor: ['view_dashboard', 'view_team', 'assign_tasks', 'verify_work', 'view_complaints', 'manage_complaints', 'view_attendance', 'mark_attendance', 'upload_reports', 'escalate_issues', 'team_communication'],
      technician: ['view_dashboard', 'view_tasks', 'update_task_status', 'upload_proof', 'mark_attendance', 'view_attendance', 'receive_notifications', 'send_emergency_alert', 'view_schedule'],
      customer: ['view_dashboard', 'create_complaints', 'view_complaints', 'view_invoices', 'make_payments', 'view_payment_history', 'chat_support', 'view_service_history'],
    };
    return permissionsMap[role] || [];
  };

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }, [permissions]);

  // Login
  const login = async (email, password) => {
    console.log('🔐 AuthContext.login called');
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      console.log('📥 Login response:', response);
      
      const { token, user } = response;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setPermissions(getUserPermissions(user.role));
      
      toast.success('Login successful!');
      
      // Redirect based on role
      const roleRoutes = {
        super_admin: '/admin/dashboard',
        manager: '/manager/dashboard',
        supervisor: '/supervisor/dashboard',
        technician: '/technician/dashboard',
        customer: '/customer/dashboard',
      };
      
      const redirectPath = roleRoutes[user.role] || '/';
      console.log('🔄 Redirecting to:', redirectPath);
      navigate(redirectPath);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful! Please verify your OTP');
      navigate('/verify-otp', { state: { email: userData.email } });
      return { success: true, data: response };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    try {
      await authService.verifyOTP(email, otp);
      toast.success('Email verified successfully! You can now login.');
      navigate('/login');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successful! Please login.');
      navigate('/login');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      setUser(response.user);
      toast.success('Profile updated successfully');
      return { success: true, user: response.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setPermissions([]);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    permissions,
    hasPermission,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;