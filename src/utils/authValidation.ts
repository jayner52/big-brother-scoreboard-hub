export const validateSignUpForm = (
  signUpEmail: string,
  signUpName: string,
  signUpPassword: string,
  signUpConfirmPassword: string,
  termsAccepted: boolean
) => {
  const newErrors: Record<string, string> = {};
  
  if (!signUpEmail.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
    newErrors.email = 'Please enter a valid email address';
  }
  
  if (!signUpName.trim()) {
    newErrors.name = 'Display name is required';
  }
  
  if (!signUpPassword) {
    newErrors.password = 'Password is required';
  } else if (signUpPassword.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }
  
  if (!signUpConfirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
  } else if (signUpPassword !== signUpConfirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }
  
  if (!termsAccepted) {
    newErrors.terms = 'You must accept the Terms & Conditions to continue';
  }
  
  return newErrors;
};