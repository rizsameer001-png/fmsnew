import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  WrenchScrewdriverIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BeakerIcon,
  FireIcon,
  CubeIcon,
  HomeModernIcon,
  ArrowRightIcon   // ✅ ADD THIS
} from '@heroicons/react/24/outline';

const Services = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const services = [
    { id: 1, name: 'Cleaning Service', icon: SparklesIcon, category: 'cleaning', description: 'Professional cleaning and sanitization for all areas', price: 'Starting at ₹499' },
    { id: 2, name: 'Electrical Service', icon: WrenchScrewdriverIcon, category: 'electrical', description: 'Electrical repairs, installations, and maintenance', price: 'Starting at ₹699' },
    { id: 3, name: 'Plumbing Service', icon: BeakerIcon, category: 'plumbing', description: 'Plumbing repairs, pipe installation, and drainage', price: 'Starting at ₹599' },
    { id: 4, name: 'Security Service', icon: ShieldCheckIcon, category: 'security', description: 'Security personnel and surveillance systems', price: 'Starting at ₹999' },
    { id: 5, name: 'HVAC Maintenance', icon: FireIcon, category: 'hvac', description: 'AC repair, ventilation, and heating systems', price: 'Starting at ₹799' },
    { id: 6, name: 'Pest Control', icon: CubeIcon, category: 'cleaning', description: 'Complete pest control and fumigation', price: 'Starting at ₹699' },
    { id: 7, name: 'Landscaping', icon: HomeModernIcon, category: 'landscaping', description: 'Garden maintenance and landscaping', price: 'Starting at ₹599' },
    { id: 8, name: 'Waste Management', icon: CubeIcon, category: 'waste', description: 'Waste collection and disposal services', price: 'Starting at ₹399' },
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'security', name: 'Security' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'landscaping', name: 'Landscaping' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const benefits = [
    '24/7 Emergency Support',
    'Trained & Verified Professionals',
    'Transparent Pricing',
    'Quality Guarantee',
    'Real-time Tracking',
    'Digital Reports',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Comprehensive facility management solutions tailored to your needs
          </p>
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                activeCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{service.price}</span>
                  <Link to="/contact" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Our Services?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">We deliver excellence with every service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need a Custom Solution?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Contact us for enterprise plans and custom service packages</p>
        <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
          Contact Us
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default Services;