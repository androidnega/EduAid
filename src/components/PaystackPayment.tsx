'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import type { PaystackResponse, PaystackCustomField } from '@/types/paystack';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { 
    ssr: false,
    loading: () => (
      <button 
        disabled 
        className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed"
      >
        Loading...
      </button>
    )
  }
);

interface PaystackPaymentProps {
  amount: number; // Amount in GHS (will be converted to kobo)
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
  metadata?: {
    custom_fields?: PaystackCustomField[];
  };
  buttonText?: string;
  disabled?: boolean;
  className?: string;
}

export default function PaystackPayment({
  amount,
  onSuccess,
  onClose,
  metadata,
  buttonText = "Pay Now",
  disabled = false,
  className = ""
}: PaystackPaymentProps) {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Paystack configuration
  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || '',
    amount: amount * 100, // Convert GHS to kobo (Paystack uses kobo)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    text: buttonText,
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: "Platform",
          variable_name: "platform",
          value: "EduAid Platform"
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.uid || "guest"
        },
        ...(metadata?.custom_fields || [])
      ]
    }
  };

  const handleSuccess = (response: PaystackResponse) => {
    console.log('Payment successful:', response);
    if (onSuccess) {
      onSuccess(response);
    }
  };

  const handleClose = () => {
    console.log('Payment modal closed');
    if (onClose) {
      onClose();
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <button
        disabled
        className={`px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed ${className}`}
      >
        Loading...
      </button>
    );
  }

  // Don't render if no user email or public key
  if (!user?.email || !config.publicKey) {
    return (
      <button
        disabled
        className={`px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed ${className}`}
      >
        {!user?.email ? 'Please login to pay' : 'Payment unavailable'}
      </button>
    );
  }

  return (
    <PaystackButton
      {...config}
      onSuccess={handleSuccess}
      onClose={handleClose}
      disabled={disabled}
      className={`px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 ${className}`}
    />
  );
} 