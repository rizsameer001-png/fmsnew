// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'Not authenticated' });
//     }
    
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         success: false, 
//         message: `Role ${req.user.role} is not authorized to access this resource` 
//       });
//     }
    
//     next();
//   };
// };

// const checkPermission = (permission) => {
//   return (req, res, next) => {
//     const permissions = {
//       super_admin: ['*'],
//       manager: ['manage_team', 'view_reports', 'approve_requests'],
//       supervisor: ['assign_tasks', 'verify_work', 'track_attendance'],
//       technician: ['view_tasks', 'update_status', 'mark_attendance'],
//       customer: ['view_own_data', 'create_complaints', 'make_payments']
//     };
    
//     const userPermissions = permissions[req.user.role] || [];
    
//     if (userPermissions.includes('*') || userPermissions.includes(permission)) {
//       next();
//     } else {
//       res.status(403).json({ success: false, message: 'Insufficient permissions' });
//     }
//   };
// };

// module.exports = { authorize, checkPermission };

// // fms-backend/src/middleware/role.middleware.js

// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'Not authenticated' });
//     }
    
//     // Allow super_admin to access everything
//     if (req.user.role === 'super_admin') {
//       return next();
//     }
    
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         success: false, 
//         message: `Role ${req.user.role} is not authorized to access this resource` 
//       });
//     }
    
//     next();
//   };
// };

// const checkPermission = (permission) => {
//   return (req, res, next) => {
//     // Allow super_admin to access everything
//     if (req.user.role === 'super_admin') {
//       return next();
//     }
    
//     const permissions = {
//       super_admin: ['*'],
//       manager: ['manage_team', 'view_reports', 'approve_requests'],
//       supervisor: ['assign_tasks', 'verify_work', 'track_attendance'],
//       technician: ['view_tasks', 'update_status', 'mark_attendance'],
//       customer: ['view_own_data', 'create_complaints', 'make_payments']
//     };
    
//     const userPermissions = permissions[req.user.role] || [];
    
//     if (userPermissions.includes('*') || userPermissions.includes(permission)) {
//       next();
//     } else {
//       res.status(403).json({ success: false, message: 'Insufficient permissions' });
//     }
//   };
// };

// module.exports = { authorize, checkPermission };



// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'Not authenticated' });
//     }
    
//     // Allow super_admin to access everything
//     if (req.user.role === 'super_admin') {
//       return next();
//     }
    
//     // ⬇️⬇️⬇️ ADD DEBUG LOG (optional, for troubleshooting) ⬇️⬇️⬇️
//     console.log('🔐 Role check:', { userRole: req.user.role, allowedRoles: roles });
    
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         success: false, 
//         message: `Role ${req.user.role} is not authorized to access this resource` 
//       });
//     }
    
//     next();
//   };
// };

// const checkPermission = (permission) => {
//   return (req, res, next) => {
//     // Allow super_admin to access everything
//     if (req.user.role === 'super_admin') {
//       return next();
//     }
    
//     const permissions = {
//       super_admin: ['*'],
//       manager: ['manage_team', 'view_reports', 'approve_requests'],
//       // ⬇️⬇️⬇️ FIXED: Added 'view_reports' to supervisor permissions ⬇️⬇️⬇️
//       supervisor: ['assign_tasks', 'verify_work', 'track_attendance', 'view_reports'],
//       technician: ['view_tasks', 'update_status', 'mark_attendance'],
//       customer: ['view_own_data', 'create_complaints', 'make_payments']
//     };
    
//     const userPermissions = permissions[req.user.role] || [];
    
//     if (userPermissions.includes('*') || userPermissions.includes(permission)) {
//       next();
//     } else {
//       res.status(403).json({ success: false, message: 'Insufficient permissions' });
//     }
//   };
// };

// module.exports = { authorize, checkPermission };


// fms-backend/src/middleware/role.middleware.js
//properly handle all role-based permissions including the new manager restrictions.

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // Allow super_admin to access everything
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Debug log for troubleshooting
    console.log('🔐 Role authorization check:', {
      userRole: req.user.role,
      allowedRoles: roles,
      path: req.path,
      method: req.method
    });
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }
    
    next();
  };
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // Allow super_admin to access everything
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Define permissions for each role
    const permissions = {
      super_admin: ['*'],
      
      // Manager permissions
      manager: [
        'view_users',           // Can view users in their building
        'update_users',         // Can update users (limited fields)
        'view_reports',         // Can view reports
        'export_reports',       // Can export reports
        'manage_team',          // Can manage supervisors and technicians
        'approve_requests',     // Can approve leave, overtime requests
        'view_buildings',       // Can view building information
        'edit_buildings',       // Can edit building details
        'view_complaints',      // Can view complaints
        'assign_complaints',    // Can assign complaints to technicians
        'view_attendance',      // Can view team attendance
        'approve_attendance'    // Can approve attendance
      ],
      
      // Supervisor permissions
      supervisor: [
        'view_users',           // Can view their technicians
        'update_users',         // Can update their technicians (limited)
        'view_reports',         // Can view team reports
        'assign_tasks',         // Can assign tasks to technicians
        'verify_work',          // Can verify completed work
        'track_attendance',     // Can track team attendance
        'view_complaints',      // Can view complaints
        'assign_complaints',    // Can assign complaints
        'escalate_issues'       // Can escalate issues to manager
      ],
      
      // Technician permissions
      technician: [
        'view_tasks',           // Can view assigned tasks
        'update_tasks',         // Can update task status
        'mark_attendance',      // Can mark own attendance
        'view_attendance',      // Can view own attendance
        'upload_proof',         // Can upload completion proof
        'send_emergency'        // Can send emergency alerts
      ],
      
      // Customer permissions
      customer: [
        'view_own_data',        // Can view own profile
        'update_profile',       // Can update own profile (limited)
        'create_complaints',    // Can create complaints
        'view_complaints',      // Can view own complaints
        'view_invoices',        // Can view own invoices
        'make_payments',        // Can make payments
        'chat_support'          // Can use chat support
      ]
    };
    
    const userPermissions = permissions[req.user.role] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      next();
    } else {
      console.log(`❌ Permission denied: ${req.user.role} does not have ${permission}`);
      res.status(403).json({ 
        success: false, 
        message: `Insufficient permissions: ${permission} required` 
      });
    }
  };
};

// Helper function to check if user has a specific permission
const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  
  const permissions = {
    manager: [
      'view_users', 'update_users', 'view_reports', 'export_reports',
      'manage_team', 'approve_requests', 'view_buildings', 'edit_buildings',
      'view_complaints', 'assign_complaints', 'view_attendance', 'approve_attendance'
    ],
    supervisor: [
      'view_users', 'update_users', 'view_reports', 'assign_tasks',
      'verify_work', 'track_attendance', 'view_complaints', 'assign_complaints',
      'escalate_issues'
    ],
    technician: [
      'view_tasks', 'update_tasks', 'mark_attendance', 'view_attendance',
      'upload_proof', 'send_emergency'
    ],
    customer: [
      'view_own_data', 'update_profile', 'create_complaints', 'view_complaints',
      'view_invoices', 'make_payments', 'chat_support'
    ]
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes(permission);
};

// Middleware to check if user can access a specific user
const canAccessUser = (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUser = req.user;
  
  // Super admin can access any user
  if (currentUser.role === 'super_admin') {
    return next();
  }
  
  // Managers can only access users in their building
  if (currentUser.role === 'manager') {
    // Logic to check if target user is in manager's building
    // This would require fetching the target user first
    return next(); // Placeholder - implement actual check
  }
  
  // Supervisors can only access their technicians
  if (currentUser.role === 'supervisor') {
    // Logic to check if target user is under this supervisor
    return next(); // Placeholder - implement actual check
  }
  
  // Technicians and customers can only access themselves
  if (currentUser.role === 'technician' || currentUser.role === 'customer') {
    if (targetUserId !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only access your own data' 
      });
    }
    return next();
  }
  
  res.status(403).json({ success: false, message: 'Access denied' });
};

// Middleware to check building access
const canAccessBuilding = (buildingId) => {
  return (req, res, next) => {
    const currentUser = req.user;
    
    // Super admin can access any building
    if (currentUser.role === 'super_admin') {
      return next();
    }
    
    // Managers can only access their assigned building
    if (currentUser.role === 'manager') {
      if (currentUser.buildingId?.toString() === buildingId) {
        return next();
      }
      return res.status(403).json({ 
        success: false, 
        message: 'You can only access your assigned building' 
      });
    }
    
    // Other roles have limited building access
    return next();
  };
};

module.exports = { 
  authorize, 
  checkPermission, 
  hasPermission,
  canAccessUser,
  canAccessBuilding
};