import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  CalendarIcon,
  CheckBadgeIcon,
  CurrencyRupeeIcon,
  //ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const navigate = useNavigate();

  // Menu items based on user role
  const getMenuItems = () => {
    const role = user?.role;
    
    const menus = {
      super_admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        // In super_admin menu, add
        { name: 'My Attendance', path: '/admin/my-attendance', icon: ClockIcon },
         { name: 'My Salary', path: '/admin/my-salary', icon: CurrencyRupeeIcon },
        { name: 'User Management', path: '/admin/users', icon: UsersIcon },
        { name: 'Building Management', path: '/admin/buildings', icon: BuildingOfficeIcon },
        { name: 'Role Management', path: '/admin/roles', icon: ShieldCheckIcon },
        { name: 'Complaint Monitoring', path: '/admin/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Attendance Monitoring', path: '/admin/attendance', icon: ClockIcon },
        { name: 'Leave Management', path: '/admin/leaves', icon: CalendarIcon },  // ✅ ADD THIS 
        { name: 'Salary Management', path: '/admin/salary', icon: CurrencyRupeeIcon },
        { name: 'GPS Tracking', path: '/admin/gps-tracking', icon: MapPinIcon },
        { name: 'Billing Control', path: '/admin/billing', icon: CreditCardIcon },
        { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
        { name: 'Approvals', path: '/admin/approvals', icon: CheckBadgeIcon },
        { name: 'Notifications', path: '/admin/notifications', icon: BellIcon },
        { name: 'Activity Logs', path: '/admin/activity-logs', icon: DocumentTextIcon },
        { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
      ],
      manager: [
        { name: 'Dashboard', path: '/manager/dashboard', icon: HomeIcon },
        { name: 'My Attendance', path: '/manager/my-attendance', icon: ClockIcon },
         { name: 'My Salary', path: '/manager/my-salary', icon: CurrencyRupeeIcon },
        { name: 'Supervisors', path: '/manager/supervisors', icon: UsersIcon },
        { name: 'Technicians', path: '/manager/technicians', icon: BuildingOfficeIcon },
        { name: 'Complaints', path: '/manager/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'SLA Monitoring', path: '/manager/sla', icon: ClockIcon },
        { name: 'Team Attendance', path: '/manager/attendance', icon: CalendarIcon },
        { name: 'Work Scheduling', path: '/manager/scheduling', icon: CheckBadgeIcon },
        { name: 'Approvals', path: '/manager/approvals', icon: DocumentTextIcon },
        { name: 'Reports', path: '/manager/reports', icon: ChartBarIcon },
      ],
      supervisor: [
        { name: 'Dashboard', path: '/supervisor/dashboard', icon: HomeIcon },
        { name: 'My Attendance', path: '/supervisor/my-attendance', icon: ClockIcon },
        { name: 'My Salary', path: '/supervisor/my-salary', icon: CurrencyRupeeIcon },
        { name: 'Field Staff', path: '/supervisor/field-staff', icon: UsersIcon },
        { name: 'Task Assignment', path: '/supervisor/technicians', icon: CheckBadgeIcon },
        { name: 'Complaints', path: '/supervisor/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Work Verification', path: '/supervisor/verification', icon: DocumentTextIcon },
        { name: 'Attendance', path: '/supervisor/attendance', icon: ClockIcon },
        { name: 'Site Inspection', path: '/supervisor/inspection', icon: MapPinIcon },
        { name: 'Reports', path: '/supervisor/reports', icon: ChartBarIcon },
      ],
      technician: [
        { name: 'Dashboard', path: '/technician/dashboard', icon: HomeIcon },
        { name: 'My Attendance', path: '/technician/my-attendance', icon: ClockIcon },
         { name: 'My Salary', path: '/technician/my-salary', icon: CurrencyRupeeIcon },
        { name: 'My Tasks', path: '/technician/tasks', icon: CheckBadgeIcon },
        { name: 'Attendance', path: '/technician/attendance', icon: ClockIcon },
        { name: 'GPS Tracking', path: '/technician/gps', icon: MapPinIcon },
        { name: 'Notifications', path: '/technician/notifications', icon: BellIcon },
        { name: 'Emergency', path: '/technician/emergency', icon: ChatBubbleLeftRightIcon },
      ],
      customer: [
        { name: 'Dashboard', path: '/customer/dashboard', icon: HomeIcon },
        { name: 'Raise Complaint', path: '/customer/raise-complaint', icon: ChatBubbleLeftRightIcon },
        { name: 'Request Service', path: '/customer/request-service', icon: BuildingOfficeIcon },
        { name: 'My Complaints', path: '/customer/complaints', icon: DocumentTextIcon },
        { name: 'Invoices', path: '/customer/invoices', icon: CreditCardIcon },
        { name: 'Payment History', path: '/customer/payments', icon: ChartBarIcon },
        { name: 'Chat Support', path: '/customer/chat', icon: UsersIcon },
        { name: 'Service History', path: '/customer/history', icon: ClockIcon },
      ],
    };
    
    return menus[role] || menus.customer;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get role-based color scheme
  const getRoleColors = () => {
    const role = user?.role;
    const colors = {
      super_admin: { bg: 'bg-indigo-700', hover: 'hover:bg-indigo-600', active: 'bg-indigo-800', text: 'text-indigo-100' },
      manager: { bg: 'bg-blue-700', hover: 'hover:bg-blue-600', active: 'bg-blue-800', text: 'text-blue-100' },
      supervisor: { bg: 'bg-green-700', hover: 'hover:bg-green-600', active: 'bg-green-800', text: 'text-green-100' },
      technician: { bg: 'bg-yellow-700', hover: 'hover:bg-yellow-600', active: 'bg-yellow-800', text: 'text-yellow-100' },
      customer: { bg: 'bg-purple-700', hover: 'hover:bg-purple-600', active: 'bg-purple-800', text: 'text-purple-100' },
    };
    return colors[role] || colors.super_admin;
  };

  const colors = getRoleColors();

  return (
    <div className={`flex flex-col h-full ${colors.bg} transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">F</span>
            </div>
            <span className="text-white font-semibold text-lg">FMS Portal</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mx-auto">
            <span className="text-indigo-600 font-bold text-lg">F</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          {sidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-6 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? `${colors.active} text-white`
                  : `${colors.text} hover:${colors.hover} hover:text-white`
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`
            }
            title={sidebarCollapsed ? item.name : ''}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        {!sidebarCollapsed && (
          <div className="mt-4 pt-4 text-xs text-white/50 text-center">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2024 FMS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;