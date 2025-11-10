/**
 * Form Validation Schemas
 * Using Yup for form validation in authentication forms
 */

import * as yup from 'yup';

// Signup form validation schema
export const signupValidationSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters'),
  
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(9, 'Phone number must be at least 9 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      'Password must contain at least one letter and one number'
    ),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  
  countryCode: yup
    .string()
    .required('Country code is required'),
});

// Signin form validation schema
export const signinValidationSchema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(9, 'Phone number must be at least 9 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  
  password: yup
    .string()
    .required('Password is required'),
  
  countryCode: yup
    .string()
    .required('Country code is required'),
});

// Type definitions for form data
export type SignupFormData = yup.InferType<typeof signupValidationSchema>;
export type SigninFormData = yup.InferType<typeof signinValidationSchema>;
