import React, { useState } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Mehta',
      company: 'TechCorp Solutions',
      role: 'Facility Manager',
      rating: 5,
      content: 'FMS has transformed how we manage our facilities. The complaint resolution time has reduced by 60% and our team loves the real-time tracking feature.',
      image: null,
      date: 'March 15, 2024',
    },
    {
      id: 2,
      name: 'Priya Desai',
      company: 'Global Business Park',
      role: 'Operations Head',
      rating: 5,
      content: 'Excellent platform! The billing system is seamless and the customer support is outstanding. Highly recommended for any business.',
      image: null,
      date: 'March 10, 2024',
    },
    {
      id: 3,
      name: 'Amit Sharma',
      company: 'Sharma Enterprises',
      role: 'Owner',
      rating: 4,
      content: 'Very user-friendly interface and great features. The GPS tracking of technicians gives us peace of mind.',
      image: null,
      date: 'March 5, 2024',
    },
    {
      id: 4,
      name: 'Neha Gupta',
      company: 'Innovation Hub',
      role: 'Admin Manager',
      rating: 5,
      content: 'The preventive maintenance scheduling has saved us thousands in emergency repairs. Best decision we made!',
      image: null,
      date: 'February 28, 2024',
    },
    {
      id: 5,
      name: 'Vikram Singh',
      company: 'Singh Group',
      role: 'Director',
      rating: 5,
      content: 'From complaint management to billing, everything is integrated perfectly. Our operational efficiency has improved dramatically.',
      image: null,
      date: 'February 20, 2024',
    },
    {
      id: 6,
      name: 'Anjali Kapoor',
      company: 'Kapoor Industries',
      role: 'HR Manager',
      rating: 4,
      content: 'The attendance tracking and shift management features are excellent. Easy to use and very reliable.',
      image: null,
      date: 'February 15, 2024',
    },
  ];

  const stats = {
    averageRating: 4.8,
    totalReviews: 156,
    ratingDistribution: { 5: 120, 4: 25, 3: 8, 2: 2, 1: 1 },
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">What Our Clients Say</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Trusted by businesses across India for their facility management needs
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</div>
              <div className="flex justify-center my-2">{renderStars(Math.floor(stats.averageRating))}</div>
              <p className="text-gray-600 dark:text-gray-400">Based on {stats.totalReviews} reviews</p>
            </div>
            <div className="md:col-span-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${(stats.ratingDistribution[star] / stats.totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{stats.ratingDistribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Testimonial Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">{renderStars(testimonials[currentIndex].rating)}</div>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic mb-6">
              "{testimonials[currentIndex].content}"
            </p>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {testimonials[currentIndex].name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-gray-500">
                  {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                </p>
                <p className="text-xs text-gray-400">{testimonials[currentIndex].date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">More Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{testimonial.content}</p>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Facility Management?</h2>
          <p className="text-xl text-indigo-100 mb-8">Join hundreds of satisfied customers</p>
          <button className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition">
            Start Your Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;