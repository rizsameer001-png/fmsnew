const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Role = require('../models/Role.model');

const roles = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      'view_users', 'create_users', 'edit_users', 'delete_users',
      'view_buildings', 'create_buildings', 'edit_buildings', 'delete_buildings',
      'view_complaints', 'assign_complaints', 'resolve_complaints', 'delete_complaints',
      'view_tasks', 'create_tasks', 'assign_tasks', 'update_tasks', 'verify_tasks',
      'view_attendance', 'mark_attendance', 'approve_attendance', 'export_attendance',
      'view_invoices', 'create_invoices', 'process_payments', 'refund_payments', 'make_payments',
      'view_reports', 'export_reports', 'schedule_reports',
      'view_settings', 'edit_settings', 'view_logs', 'manage_backup',
      'view_roles', 'create_roles', 'edit_roles', 'delete_roles'
    ],
    isActive: true
  },
  {
    name: 'manager',
    displayName: 'Building Manager',
    description: 'Building manager with team oversight',
    permissions: [
      'view_users', 'update_users',
      'view_buildings', 'edit_buildings',
      'view_complaints', 'assign_complaints',
      'view_tasks', 'create_tasks', 'assign_tasks', 'verify_tasks',
      'view_attendance', 'approve_attendance', 'export_attendance',
      'view_invoices', 'create_invoices', 'process_payments',
      'view_reports', 'export_reports'
    ],
    isActive: true
  },
  {
    name: 'supervisor',
    displayName: 'Team Supervisor',
    description: 'Team supervisor for field operations',
    permissions: [
      'view_users', 'update_users',
      'view_complaints', 'assign_complaints',
      'view_tasks', 'assign_tasks', 'update_tasks', 'verify_tasks',
      'view_attendance', 'mark_attendance', 'export_attendance',
      'view_reports', 'export_reports'
    ],
    isActive: true
  },
  {
    name: 'technician',
    displayName: 'Field Technician',
    description: 'Field technician for maintenance',
    permissions: [
      'view_tasks', 'update_tasks',
      'view_attendance', 'mark_attendance',
      'make_payments'
    ],
    isActive: true
  },
  {
    name: 'customer',
    displayName: 'Customer',
    description: 'End user customer access',
    permissions: [
      'view_complaints', 'create_complaints',
      'view_invoices', 'make_payments',
      'view_reports'
    ],
    isActive: true
  }
];

const seedRoles = async () => {
  console.log('\n=================================');
  console.log('👥 ROLE SEEDER');
  console.log('=================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing roles
    const deleted = await Role.deleteMany({});
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing roles\n`);

    // Insert new roles
    const created = await Role.insertMany(roles);
    console.log(`✅ Created ${created.length} roles\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ROLES CREATED:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    created.forEach(role => {
      console.log(`   • ${role.displayName} (${role.name}) - ${role.permissions.length} permissions`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('✅ Seeding complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    process.exit(1);
  }
};

seedRoles();