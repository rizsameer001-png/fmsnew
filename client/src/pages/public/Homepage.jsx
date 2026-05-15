import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const Homepage = () => {
  const features = [
    { icon: ChatBubbleLeftRightIcon, title: 'Complaint Management', description: 'Raise and track complaints in real-time with automatic assignment to technicians.' },
    { icon: ClockIcon, title: '24/7 Support', description: 'Round-the-clock customer support for all your facility management needs.' },
    { icon: MapPinIcon, title: 'GPS Tracking', description: 'Live tracking of technicians and field staff with geofencing capabilities.' },
    { icon: CreditCardIcon, title: 'Easy Billing', description: 'Generate invoices, process payments, and manage subscriptions seamlessly.' },
    { icon: BuildingOfficeIcon, title: 'Multi-Building Support', description: 'Manage multiple buildings and facilities from a single dashboard.' },
    { icon: UserGroupIcon, title: 'Team Management', description: 'Efficiently manage supervisors, technicians, and support staff.' },
  ];

  const stats = [
    { value: '500+', label: 'Buildings Managed' },
    { value: '10K+', label: 'Complaints Resolved' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Complete Facility Management Solution
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              Streamline your facility operations with our comprehensive management system. 
              Handle complaints, track staff, manage billing, and more from one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition inline-flex items-center justify-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose FMS?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Everything you need to manage your facility efficiently in one powerful platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust FMS for their facility management needs
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;