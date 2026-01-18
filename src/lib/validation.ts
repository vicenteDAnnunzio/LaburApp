export const validateEmail = (email: string): boolean => {
  // Skip validation for admin
  if (email === 'admin') return true;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  // Skip validation for admin
  if (password === 'admin') return { valid: true };
  
  if (!password) {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { valid: true };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; message?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  return { valid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { valid: boolean; message?: string } => {
  if (password !== confirmPassword) {
    return { valid: false, message: 'Las contraseñas no coinciden' };
  }
  return { valid: true };
};
