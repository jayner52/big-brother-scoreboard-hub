import { useState } from 'react';

export const useAuthForm = () => {
  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Preferences state
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
    setSignUpName('');
    setSignInEmail('');
    setSignInPassword('');
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    // Sign up form
    signUpEmail,
    setSignUpEmail,
    signUpPassword,
    setSignUpPassword,
    signUpConfirmPassword,
    setSignUpConfirmPassword,
    signUpName,
    setSignUpName,
    
    // Sign in form
    signInEmail,
    setSignInEmail,
    signInPassword,
    setSignInPassword,
    
    // Preferences
    emailOptIn,
    setEmailOptIn,
    termsAccepted,
    setTermsAccepted,
    
    // UI state
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    
    // Actions
    resetForm,
  };
};