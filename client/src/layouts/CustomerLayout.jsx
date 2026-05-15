import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  BuildingOfficeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../hooks/useTheme';
import { getInitials } from '../utils/formatters';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

const CustomerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: HomeIcon },
    { name: 'Raise Complaint', href: '/customer/raise-complaint', icon: ChatBubbleLeftRightIcon },
    { name: 'Request Service', href: '/customer/request-service', icon: BuildingOfficeIcon },
    { name: 'My Complaints', href: '/customer/complaints', icon: DocumentTextIcon },
    { name: 'Invoices', href: '/customer/invoices', icon: CreditCardIcon },
    { name: 'Payment History', href: '/customer/payments', icon: ChartBarIcon },
    { name: 'Chat Support', href: '/customer/chat', icon: UserGroupIcon },
    { name: 'Service History', href: '/customer/history', icon: ClockIcon },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigation={navigation}
        role="customer"
      />

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar navigation={navigation} role="customer" />
      </div>

      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileMenuOpen(true)} role="customer" />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;