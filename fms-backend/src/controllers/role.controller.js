// const Role = require('../models/Role.model');
// const User = require('../models/User.model');

// // Get all roles
// const getRoles = async (req, res) => {
//   try {
//     const roles = await Role.find().sort('displayName');
//     res.json({
//       success: true,
//       roles,
//       total: roles.length
//     });
//   } catch (error) {
//     console.error('Get roles error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get single role
// const getRole = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }
//     res.json({ success: true, role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Create role
// const createRole = async (req, res) => {
//   try {
//     const { name, displayName, description, permissions, isActive } = req.body;

//     if (!name || !displayName) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Role name and display name are required' 
//       });
//     }

//     const existingRole = await Role.findOne({ name });
//     if (existingRole) {
//       return res.status(400).json({ success: false, message: 'Role already exists' });
//     }

//     const role = await Role.create({
//       name,
//       displayName,
//       description: description || '',
//       permissions: permissions || [],
//       isActive: isActive !== undefined ? isActive : true,
//       createdBy: req.user._id
//     });

//     res.status(201).json({ success: true, role });
//   } catch (error) {
//     console.error('Create role error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update role
// const updateRole = async (req, res) => {
//   try {
//     const { displayName, description, permissions, isActive } = req.body;
    
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
//     }

//     role.displayName = displayName || role.displayName;
//     role.description = description !== undefined ? description : role.description;
//     role.permissions = permissions !== undefined ? permissions : role.permissions;
//     role.isActive = isActive !== undefined ? isActive : role.isActive;
//     role.updatedBy = req.user._id;
    
//     await role.save();

//     res.json({ success: true, role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete role
// const deleteRole = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot delete super admin role' });
//     }

//     const userCount = await User.countDocuments({ role: role.name });
//     if (userCount > 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Cannot delete role. ${userCount} user(s) have this role.` 
//       });
//     }

//     await role.deleteOne();
//     res.json({ success: true, message: 'Role deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Toggle role status
// const toggleRoleStatus = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
//     }

//     role.isActive = !role.isActive;
//     await role.save();

//     res.json({ success: true, role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get permissions list
// const getPermissionsList = async (req, res) => {
//   const permissions = {
//     user: [
//       { value: 'view_users', label: 'View Users' },
//       { value: 'create_users', label: 'Create Users' },
//       { value: 'edit_users', label: 'Edit Users' },
//       { value: 'delete_users', label: 'Delete Users' }
//     ],
//     building: [
//       { value: 'view_buildings', label: 'View Buildings' },
//       { value: 'create_buildings', label: 'Create Buildings' },
//       { value: 'edit_buildings', label: 'Edit Buildings' },
//       { value: 'delete_buildings', label: 'Delete Buildings' }
//     ],
//     complaint: [
//       { value: 'view_complaints', label: 'View Complaints' },
//       { value: 'assign_complaints', label: 'Assign Complaints' },
//       { value: 'resolve_complaints', label: 'Resolve Complaints' },
//       { value: 'delete_complaints', label: 'Delete Complaints' }
//     ],
//     task: [
//       { value: 'view_tasks', label: 'View Tasks' },
//       { value: 'create_tasks', label: 'Create Tasks' },
//       { value: 'assign_tasks', label: 'Assign Tasks' },
//       { value: 'verify_tasks', label: 'Verify Tasks' }
//     ],
//     attendance: [
//       { value: 'view_attendance', label: 'View Attendance' },
//       { value: 'mark_attendance', label: 'Mark Attendance' },
//       { value: 'approve_attendance', label: 'Approve Attendance' },
//       { value: 'export_attendance', label: 'Export Attendance' }
//     ],
//     billing: [
//       { value: 'view_invoices', label: 'View Invoices' },
//       { value: 'create_invoices', label: 'Create Invoices' },
//       { value: 'process_payments', label: 'Process Payments' },
//       { value: 'refund_payments', label: 'Refund Payments' }
//     ],
//     report: [
//       { value: 'view_reports', label: 'View Reports' },
//       { value: 'export_reports', label: 'Export Reports' },
//       { value: 'schedule_reports', label: 'Schedule Reports' }
//     ],
//     system: [
//       { value: 'view_settings', label: 'View Settings' },
//       { value: 'edit_settings', label: 'Edit Settings' },
//       { value: 'view_logs', label: 'View Logs' },
//       { value: 'manage_backup', label: 'Manage Backup' }
//     ],
//     role: [
//       { value: 'view_roles', label: 'View Roles' },
//       { value: 'create_roles', label: 'Create Roles' },
//       { value: 'edit_roles', label: 'Edit Roles' },
//       { value: 'delete_roles', label: 'Delete Roles' }
//     ]
//   };

//   res.json({ success: true, permissions });
// };

// module.exports = {
//   getRoles,
//   getRole,
//   createRole,
//   updateRole,
//   deleteRole,
//   toggleRoleStatus,
//   getPermissionsList
// };


// // fms-backend/src/controllers/role.controller.js
// const Role = require('../models/Role.model');
// const User = require('../models/User.model');

// // Get all roles
// const getRoles = async (req, res) => {
//   try {
//     console.log('📋 Fetching all roles...');
//     const roles = await Role.find().sort('displayName');
//     console.log(`✅ Found ${roles.length} roles`);
//     res.json({
//       success: true,
//       roles,
//       total: roles.length
//     });
//   } catch (error) {
//     console.error('❌ Get roles error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get single role
// const getRole = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }
//     res.json({ success: true, role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Create role
// const createRole = async (req, res) => {
//   try {
//     console.log('📝 Creating new role...');
//     console.log('Request headers:', req.headers);
//     console.log('Request body:', req.body);
//     console.log('Content-Type:', req.headers['content-type']);
    
//     // If body is empty, try to parse it
//     if (!req.body || Object.keys(req.body).length === 0) {
//       console.log('⚠️ Request body is empty!');
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Request body is empty. Please provide role data.' 
//       });
//     }
    
//     const { name, displayName, description, permissions, isActive } = req.body;

//     // Validate required fields
//     if (!name) {
//       console.log('❌ Missing name field');
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Role name is required' 
//       });
//     }
    
//     if (!displayName) {
//       console.log('❌ Missing displayName field');
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Display name is required' 
//       });
//     }

//     // Check if role already exists
//     const existingRole = await Role.findOne({ name });
//     if (existingRole) {
//       console.log(`⚠️ Role already exists: ${name}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Role already exists' 
//       });
//     }

//     // Create new role
//     const role = await Role.create({
//       name,
//       displayName,
//       description: description || '',
//       permissions: permissions || [],
//       isActive: isActive !== undefined ? isActive : true,
//       createdBy: req.user?._id
//     });

//     console.log(`✅ Role created: ${displayName}`);
//     res.status(201).json({ success: true, role });
//   } catch (error) {
//     console.error('❌ Create role error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update role
// const updateRole = async (req, res) => {
//   try {
//     const { displayName, description, permissions, isActive } = req.body;
    
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
//     }

//     role.displayName = displayName || role.displayName;
//     role.description = description !== undefined ? description : role.description;
//     role.permissions = permissions !== undefined ? permissions : role.permissions;
//     role.isActive = isActive !== undefined ? isActive : role.isActive;
//     role.updatedBy = req.user._id;
    
//     await role.save();

//     res.json({ success: true, role });
//   } catch (error) {
//     console.error('Update role error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete role
// const deleteRole = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot delete super admin role' });
//     }

//     const userCount = await User.countDocuments({ role: role.name });
//     if (userCount > 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Cannot delete role. ${userCount} user(s) have this role.` 
//       });
//     }

//     await role.deleteOne();
//     res.json({ success: true, message: 'Role deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Toggle role status
// const toggleRoleStatus = async (req, res) => {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) {
//       return res.status(404).json({ success: false, message: 'Role not found' });
//     }

//     if (role.name === 'super_admin') {
//       return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
//     }

//     role.isActive = !role.isActive;
//     await role.save();

//     res.json({ success: true, role });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get permissions list
// const getPermissionsList = async (req, res) => {
//   const permissions = {
//     user: [
//       { value: 'view_users', label: 'View Users' },
//       { value: 'create_users', label: 'Create Users' },
//       { value: 'edit_users', label: 'Edit Users' },
//       { value: 'delete_users', label: 'Delete Users' }
//     ],
//     building: [
//       { value: 'view_buildings', label: 'View Buildings' },
//       { value: 'create_buildings', label: 'Create Buildings' },
//       { value: 'edit_buildings', label: 'Edit Buildings' },
//       { value: 'delete_buildings', label: 'Delete Buildings' }
//     ],
//     complaint: [
//       { value: 'view_complaints', label: 'View Complaints' },
//       { value: 'assign_complaints', label: 'Assign Complaints' },
//       { value: 'resolve_complaints', label: 'Resolve Complaints' },
//       { value: 'delete_complaints', label: 'Delete Complaints' }
//     ],
//     task: [
//       { value: 'view_tasks', label: 'View Tasks' },
//       { value: 'create_tasks', label: 'Create Tasks' },
//       { value: 'assign_tasks', label: 'Assign Tasks' },
//       { value: 'verify_tasks', label: 'Verify Tasks' }
//     ],
//     attendance: [
//       { value: 'view_attendance', label: 'View Attendance' },
//       { value: 'mark_attendance', label: 'Mark Attendance' },
//       { value: 'approve_attendance', label: 'Approve Attendance' },
//       { value: 'export_attendance', label: 'Export Attendance' }
//     ],
//     billing: [
//       { value: 'view_invoices', label: 'View Invoices' },
//       { value: 'create_invoices', label: 'Create Invoices' },
//       { value: 'process_payments', label: 'Process Payments' },
//       { value: 'refund_payments', label: 'Refund Payments' }
//     ],
//     report: [
//       { value: 'view_reports', label: 'View Reports' },
//       { value: 'export_reports', label: 'Export Reports' },
//       { value: 'schedule_reports', label: 'Schedule Reports' }
//     ],
//     system: [
//       { value: 'view_settings', label: 'View Settings' },
//       { value: 'edit_settings', label: 'Edit Settings' },
//       { value: 'view_logs', label: 'View Logs' },
//       { value: 'manage_backup', label: 'Manage Backup' }
//     ],
//     role: [
//       { value: 'view_roles', label: 'View Roles' },
//       { value: 'create_roles', label: 'Create Roles' },
//       { value: 'edit_roles', label: 'Edit Roles' },
//       { value: 'delete_roles', label: 'Delete Roles' }
//     ]
//   };

//   res.json({ success: true, permissions });
// };

// module.exports = {
//   getRoles,
//   getRole,
//   createRole,
//   updateRole,
//   deleteRole,
//   toggleRoleStatus,
//   getPermissionsList
// };


const Role = require('../models/Role.model');
const User = require('../models/User.model');

// Get all roles
const getRoles = async (req, res) => {
  try {
    console.log('📋 Fetching all roles...');
    const roles = await Role.find().sort('displayName');
    console.log(`✅ Found ${roles.length} roles`);
    res.json({
      success: true,
      roles,
      total: roles.length
    });
  } catch (error) {
    console.error('❌ Get roles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single role
const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.json({ success: true, role });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create role
const createRole = async (req, res) => {
  try {
    console.log('📝 Creating new role...');
    console.log('Request body:', req.body);
    
    // If body is empty, try to parse it
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('⚠️ Request body is empty!');
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is empty. Please provide role data.' 
      });
    }
    
    const { name, displayName, description, permissions, isActive } = req.body;

    // Validate required fields
    if (!name) {
      console.log('❌ Missing name field');
      return res.status(400).json({ 
        success: false, 
        message: 'Role name is required' 
      });
    }
    
    if (!displayName) {
      console.log('❌ Missing displayName field');
      return res.status(400).json({ 
        success: false, 
        message: 'Display name is required' 
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      console.log(`⚠️ Role already exists: ${name}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Role already exists' 
      });
    }

    // Create new role
    const role = await Role.create({
      name,
      displayName,
      description: description || '',
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id
    });

    console.log(`✅ Role created: ${displayName}`);
    res.status(201).json({ success: true, role });
  } catch (error) {
    console.error('❌ Create role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { displayName, description, permissions, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.name === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
    }

    role.displayName = displayName || role.displayName;
    role.description = description !== undefined ? description : role.description;
    role.permissions = permissions !== undefined ? permissions : role.permissions;
    role.isActive = isActive !== undefined ? isActive : role.isActive;
    role.updatedBy = req.user._id;
    
    await role.save();

    res.json({ success: true, role });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.name === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete super admin role' });
    }

    const userCount = await User.countDocuments({ role: role.name });
    if (userCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete role. ${userCount} user(s) have this role.` 
      });
    }

    await role.deleteOne();
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle role status
const toggleRoleStatus = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (role.name === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify super admin role' });
    }

    role.isActive = !role.isActive;
    await role.save();

    res.json({ success: true, role });
  } catch (error) {
    console.error('Toggle role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get permissions list
const getPermissionsList = async (req, res) => {
  const permissions = {
    user: [
      { value: 'view_users', label: 'View Users' },
      { value: 'create_users', label: 'Create Users' },
      { value: 'edit_users', label: 'Edit Users' },
      { value: 'delete_users', label: 'Delete Users' }
    ],
    building: [
      { value: 'view_buildings', label: 'View Buildings' },
      { value: 'create_buildings', label: 'Create Buildings' },
      { value: 'edit_buildings', label: 'Edit Buildings' },
      { value: 'delete_buildings', label: 'Delete Buildings' }
    ],
    complaint: [
      { value: 'view_complaints', label: 'View Complaints' },
      { value: 'assign_complaints', label: 'Assign Complaints' },
      { value: 'resolve_complaints', label: 'Resolve Complaints' },
      { value: 'delete_complaints', label: 'Delete Complaints' }
    ],
    // ⬇️⬇️⬇️ FIXED: Added 'update_tasks' here ⬇️⬇️⬇️
    task: [
      { value: 'view_tasks', label: 'View Tasks' },
      { value: 'create_tasks', label: 'Create Tasks' },
      { value: 'assign_tasks', label: 'Assign Tasks' },
      { value: 'update_tasks', label: 'Update Tasks' },  // ✅ ADD THIS LINE
      { value: 'verify_tasks', label: 'Verify Tasks' }
    ],
    attendance: [
      { value: 'view_attendance', label: 'View Attendance' },
      { value: 'mark_attendance', label: 'Mark Attendance' },
      { value: 'approve_attendance', label: 'Approve Attendance' },
      { value: 'export_attendance', label: 'Export Attendance' }
    ],
    billing: [
      { value: 'view_invoices', label: 'View Invoices' },
      { value: 'create_invoices', label: 'Create Invoices' },
      { value: 'process_payments', label: 'Process Payments' },
      { value: 'refund_payments', label: 'Refund Payments' },
      { value: 'make_payments', label: 'Make Payments' }  // ✅ ADD THIS
    ],
    report: [
      { value: 'view_reports', label: 'View Reports' },
      { value: 'export_reports', label: 'Export Reports' },
      { value: 'schedule_reports', label: 'Schedule Reports' }
    ],
    system: [
      { value: 'view_settings', label: 'View Settings' },
      { value: 'edit_settings', label: 'Edit Settings' },
      { value: 'view_logs', label: 'View Logs' },
      { value: 'manage_backup', label: 'Manage Backup' }
    ],
    role: [
      { value: 'view_roles', label: 'View Roles' },
      { value: 'create_roles', label: 'Create Roles' },
      { value: 'edit_roles', label: 'Edit Roles' },
      { value: 'delete_roles', label: 'Delete Roles' }
    ]
  };

  res.json({ success: true, permissions });
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getPermissionsList
};