import React, { useState, useEffect } from 'react';
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
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

const MobileNav = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Get menu items based on role
  const getMenuItems = () => {
    const role = user?.role;
    const menus = {
      super_admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        { name: 'Users', path: '/admin/users', icon: UsersIcon },
        { name: 'Buildings', path: '/admin/buildings', icon: BuildingOfficeIcon },
        { name: 'Complaints', path: '/admin/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Attendance', path: '/admin/attendance', icon: MapPinIcon },
        { name: 'Billing', path: '/admin/billing', icon: CreditCardIcon },
        { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
        { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
      ],
      manager: [
        { name: 'Dashboard', path: '/manager/dashboard', icon: HomeIcon },
        { name: 'Supervisors', path: '/manager/supervisors', icon: UsersIcon },
        { name: 'Complaints', path: '/manager/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Attendance', path: '/manager/attendance', icon: MapPinIcon },
        { name: 'Reports', path: '/manager/reports', icon: ChartBarIcon },
      ],
      supervisor: [
        { name: 'Dashboard', path: '/supervisor/dashboard', icon: HomeIcon },
        { name: 'Field Staff', path: '/supervisor/field-staff', icon: UsersIcon },
        { name: 'Complaints', path: '/supervisor/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Verification', path: '/supervisor/verification', icon: MapPinIcon },
      ],
      technician: [
        { name: 'Dashboard', path: '/technician/dashboard', icon: HomeIcon },
        { name: 'Tasks', path: '/technician/tasks', icon: ChatBubbleLeftRightIcon },
        { name: 'Attendance', path: '/technician/attendance', icon: MapPinIcon },
        { name: 'GPS', path: '/technician/gps', icon: MapPinIcon },
      ],
      customer: [
        { name: 'Dashboard', path: '/customer/dashboard', icon: HomeIcon },
        { name: 'Raise Complaint', path: '/customer/raise-complaint', icon: ChatBubbleLeftRightIcon },
        { name: 'Invoices', path: '/customer/invoices', icon: CreditCardIcon },
        { name: 'Chat', path: '/customer/chat', icon: UsersIcon },
      ],
    };
    return menus[role] || menus.customer;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />

      {/* Mobile Menu */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FMS Portal</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                {getInitials(user?.name)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NavLink
            to={`/${user?.role}/profile`}
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UserCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNav;