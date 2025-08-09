import { z } from 'zod';

// Common validation patterns
const emailValidation = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email is too long');

const passwordValidation = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

const strongPasswordValidation = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

const nameValidation = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');

// Auth Schemas
export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export const registerSchema = z
  .object({
    name: nameValidation,
    email: emailValidation,
    password: strongPasswordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Additional schemas for future use
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    token: z.string().min(1, 'Reset token is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: passwordValidation,
    newPassword: strongPasswordValidation,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ['newPassword'],
  });

// Profile schemas
export const updateProfileSchema = z.object({
  name: nameValidation,
  email: emailValidation,
});

// Validation error messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  passwordTooShort: 'Password must be at least 6 characters',
  passwordTooWeak: 'Password must contain uppercase, lowercase, and number',
  passwordsDontMatch: "Passwords don't match",
  nameTooShort: 'Name must be at least 2 characters',
  nameInvalid: 'Name can only contain letters and spaces',
};
