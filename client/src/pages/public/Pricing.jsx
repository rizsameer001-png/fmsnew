import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 4999, yearly: 49990 },
      description: 'Perfect for small businesses',
      features: [
        'Up to 3 Buildings',
        'Up to 10 Users',
        'Basic Complaint Management',
        'Email Support',
        'Basic Reports',
        'Mobile App Access',
        '24/7 Support',
      ],
      notIncluded: [
        'Advanced Analytics',
        'API Access',
        'Custom Integration',
        'Dedicated Account Manager',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 9999, yearly: 99990 },
      description: 'Best for growing companies',
      features: [
        'Up to 10 Buildings',
        'Up to 50 Users',
        'Advanced Complaint Management',
        'Priority Email & Phone Support',
        'Advanced Reports & Analytics',
        'Mobile App Access',
        'GPS Tracking',
        'Attendance Management',
        'Billing & Invoicing',
      ],
      notIncluded: [
        'API Access',
        'Custom Integration',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'For large organizations',
      features: [
        'Unlimited Buildings',
        'Unlimited Users',
        'Full Feature Access',
        '24/7 Priority Support',
        'Custom Reports',
        'Dedicated Account Manager',
        'API Access',
        'Custom Integration',
        'SLA Guarantee',
        'On-site Training',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, UPI, net banking, and bank transfers.',
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for non-profit organizations. Please contact our sales team for details.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees. All plans include free onboarding and setup assistance.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No long-term contracts required.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Choose the plan that works best for your business
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-white/10 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:text-white/90'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                billingCycle === 'yearly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:text-white/90'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-indigo-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                <div className="mt-4">
                  {typeof plan.price[billingCycle] === 'string' ? (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price[billingCycle]}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ₹{plan.price[billingCycle].toLocaleString()}
                      </span>
                      <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </>
                  )}
                </div>
                
                <Link
                  to={plan.id === 'enterprise' ? '/contact' : '/register'}
                  className={`block w-full text-center mt-6 py-3 rounded-lg font-medium transition ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="mt-6 space-y-3">
                  <p className="font-medium text-gray-900 dark:text-white">Features:</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 opacity-50">
                      <XMarkIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Need a Custom Plan?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            For large organizations with specific requirements, we offer custom enterprise plans
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Contact Enterprise Sales
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                {faq.question}
              </summary>
              <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 mt-2">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;