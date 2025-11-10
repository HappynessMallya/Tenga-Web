export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^(\+255|0)[67]\d{8}$/;
  return re.test(phone);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validateLocation = (location: {
  latitude: number;
  longitude: number;
}): boolean => {
  return (
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

// Safe string utilities to prevent undefined.trim() errors
export const safeTrim = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

export const safeToLowerCase = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.toLowerCase().trim();
};

export const safePhoneFormat = (phone: string | undefined | null): string | null => {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  const trimmed = phone.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const safeEmailFormat = (email: string | undefined | null): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim();
};

export const safeStringLength = (value: string | undefined | null): number => {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  return value.trim().length;
};
