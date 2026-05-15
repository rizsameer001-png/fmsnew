import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RocketLaunchIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  HeartIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const AboutUs = () => {
  const values = [
    { icon: RocketLaunchIcon, title: 'Innovation', description: 'Continuously evolving our platform with cutting-edge technology' },
    { icon: UserGroupIcon, title: 'Customer First', description: 'Our customers are at the heart of everything we do' },
    { icon: ShieldCheckIcon, title: 'Reliability', description: 'Delivering consistent, high-quality service every time' },
    { icon: HeartIcon, title: 'Integrity', description: 'Operating with transparency and ethical practices' },
    { icon: GlobeAltIcon, title: 'Sustainability', description: 'Committed to eco-friendly facility management' },
    { icon: ChartBarIcon, title: 'Excellence', description: 'Striving for the highest standards in service delivery' },
  ];

  const team = [
    { name: 'Rajesh Sharma', role: 'CEO & Founder', image: null, bio: '20+ years in facility management industry' },
    { name: 'Priya Patel', role: 'CTO', image: null, bio: 'Technology expert with a passion for innovation' },
    { name: 'Amit Kumar', role: 'Head of Operations', image: null, bio: 'Ensuring smooth operations across all facilities' },
    { name: 'Neha Singh', role: 'Customer Success', image: null, bio: 'Dedicated to customer satisfaction and support' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About FMS</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Revolutionizing facility management with technology and expertise
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Founded in 2020, FMS was born from a vision to transform how businesses manage their facilities. 
              We recognized that traditional facility management was fragmented, inefficient, and lacked transparency.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Today, we serve over 500+ buildings across India, helping businesses streamline their operations, 
              reduce costs, and improve service quality. Our platform handles thousands of service requests 
              monthly with a 98% customer satisfaction rate.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We're committed to continuous innovation and excellence in facility management, 
              leveraging the latest technologies to provide real-time insights and seamless experiences.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 text-center">
            <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">500+</div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Buildings Managed</p>
            <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">10K+</div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Complaints Resolved</p>
            <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">98%</div>
            <p className="text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Our Mission & Vision */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <RocketLaunchIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To empower businesses with intelligent facility management solutions that drive efficiency, 
                transparency, and excellence in service delivery.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To become the most trusted and innovative facility management platform, 
                setting new standards for operational excellence worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Core Values</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">The principles that guide everything we do</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6">
              <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <value.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Leadership</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Meet the team behind FMS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden text-center">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">{member.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join Our Growing Family</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Be part of the future of facility management</p>
        <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
          Get in Touch
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;
         