// User-friendly error messages
export const getErrorMessage = (error: any): string => {
  // Handle various error scenarios with user-friendly messages
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // Authentication errors
  if (errorCode.includes('auth/')) {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        return 'The email or password you entered is incorrect. Please try again.';
      
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      
      case 'auth/weak-password':
        return 'Please choose a stronger password with at least 6 characters.';
      
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes before trying again.';
      
      case 'auth/network-request-failed':
        return 'Connection problem. Please check your internet and try again.';
      
      case 'auth/unauthorized-domain':
        return 'This service is temporarily unavailable. Please try again later.';
      
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again if you want to continue.';
      
      default:
        return 'Unable to sign in right now. Please try again in a moment.';
    }
  }

  // Payment/subscription errors
  if (errorCode.includes('payment') || errorMessage.includes('payment')) {
    return 'Payment could not be processed. Please check your details and try again.';
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Connection issue. Please check your internet and try again.';
  }

  // File upload errors
  if (errorMessage.includes('file') || errorMessage.includes('upload')) {
    return 'File could not be uploaded. Please try with a different file.';
  }

  // Generic fallback messages
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return 'You don\'t have permission to do this. Please contact support if needed.';
  }

  // Default user-friendly message
  return 'Something went wrong. Please try again or contact support if the problem continues.';
};

// Success messages
export const getSuccessMessage = (action: string): string => {
  const messages = {
    login: 'Welcome back! You\'re now signed in.',
    register: 'Account created successfully! Welcome to CodeAi.',
    logout: 'You\'ve been signed out successfully.',
    upload: 'Your project has been submitted successfully!',
    payment: 'Payment completed! Your subscription is now active.',
    update: 'Your information has been updated successfully.',
  };

  return messages[action as keyof typeof messages] || 'Action completed successfully!';
};

// Loading messages
export const getLoadingMessage = (action: string): string => {
  const messages = {
    login: 'Signing you in...',
    register: 'Creating your account...',
    upload: 'Uploading your project...',
    payment: 'Processing payment...',
    loading: 'Loading...',
  };

  return messages[action as keyof typeof messages] || 'Please wait...';
}; 