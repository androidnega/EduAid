'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaystackPayment from '@/components/PaystackPayment';
import { useRouter } from 'next/navigation';
import type { PaystackResponse } from '@/types/paystack';

function PricingContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePaymentSuccess = (response: PaystackResponse, planName: string) => {
    console.log('Payment successful for plan:', planName, response);
    // Here you would typically:
    // 1. Verify payment on your backend
    // 2. Update user's subscription status
    // 3. Redirect to success page or dashboard
    alert(`Payment successful! Welcome to ${planName} plan.`);
    router.push('/dashboard');
  };

  const handlePaymentClose = () => {
    console.log('Payment modal closed');
  };

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 0,
      currency: 'GHS',
      description: 'Perfect for getting started',
      features: [
        '5 free plagiarism checks',
        'Basic project submissions',
        'Email support',
        'Standard processing time',
        'Basic file formats support'
      ],
      buttonText: 'Current Plan',
      highlighted: false,
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 1.99,
      currency: 'GHS',
      description: 'Enhanced features for serious students',
      features: [
        'Unlimited plagiarism checks',
        'Advanced plagiarism detection',
        'Priority project processing',
        'Advanced file format support',
        'Priority email support',
        '1 referral check credit',
        'Detailed analysis reports'
      ],
      buttonText: 'Upgrade to Pro',
      highlighted: true,
      disabled: false
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 9.99,
      currency: 'GHS',
      description: 'Complete solution for academic excellence',
      features: [
        'Everything in Pro Plan',
        'AI-powered writing assistance',
        'Advanced code analysis',
        'Multiple language support',
        'Custom project templates',
        '24/7 priority support',
        '5 referral check credits',
        'API access',
        'Bulk project uploads',
        'Advanced analytics dashboard'
      ],
      buttonText: 'Get Premium',
      highlighted: false,
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">EduAid Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your academic journey. Upgrade anytime to unlock more features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg shadow-lg overflow-hidden ${
                plan.highlighted
                  ? 'ring-2 ring-blue-500 scale-105 transform'
                  : 'border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="bg-white p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency} {plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>

                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.disabled ? (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 px-6 rounded-md font-medium cursor-not-allowed"
                    >
                      {plan.buttonText}
                    </button>
                  ) : (
                    <PaystackPayment
                      amount={plan.price}
                      buttonText={plan.buttonText}
                      onSuccess={(response) => handlePaymentSuccess(response, plan.name)}
                      onClose={handlePaymentClose}
                      metadata={{
                        custom_fields: [
                          {
                            display_name: "Plan",
                            variable_name: "plan",
                            value: plan.id
                          },
                          {
                            display_name: "Plan Name",
                            variable_name: "plan_name",
                            value: plan.name
                          }
                        ]
                      }}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Choose EduAid Platform?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Reliable & Secure</h4>
              <p className="text-gray-600">Your data is encrypted and securely processed with industry-standard security measures.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Fast Processing</h4>
              <p className="text-gray-600">Get your results quickly with our optimized AI processing pipeline.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12l8-8M4 4l8 8m0 0l8 8M4 20l16-16" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-gray-600">Get help whenever you need it with our dedicated support team.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <ProtectedRoute>
      <PricingContent />
    </ProtectedRoute>
  );
} 