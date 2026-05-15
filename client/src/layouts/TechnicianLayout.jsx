import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, ClipboardDocumentListIcon, 
  MapPinIcon, BellIcon, UserCircleIcon,
  ArrowRightOnRectangleIcon, CheckCircleIcon,ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { getInitials } from '../utils/formatters';

const TechnicianLayout = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/technician/dashboard', icon: HomeIcon },
    { name: 'My Attendance', href: '/admin/my-attendance', icon: ClockIcon },  // ✅ ADDED
    { name: 'My Tasks', href: '/technician/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Attendance', href: '/technician/attendance', icon: CheckCircleIcon },
   { name: 'GPS Tracking', href: '/technician/gps-tracking', icon: MapPinIcon },  // ⬅️ CHANGED from '/technician/gps' to '/technician/gps-tracking'
    { name: 'Notifications', href: '/technician/notifications', icon: BellIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-20">
        <div className="flex justify-around py-2">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-1 bg-green-700">
          <div className="flex items-center justify-center h-16 bg-green-800">
            <h1 className="text-white text-xl font-bold">FMS Technician</h1>
          </div>
          <nav className="flex-1 mt-5 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-600'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Technician Portal</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="relative p-2 text-gray-400 hover:text-gray-500">
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-medium text-sm">{getInitials(user?.name)}</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                      <button onClick={() => navigate('/technician/profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="h-4 w-4 inline mr-2" /> Profile
                      </button>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TechnicianLayout;