import React from 'react';
import FormInput from './FormInput';
import { useAuthForm } from '../../hooks/useAuthForm';

const AuthForm = ({ isLogin, onToggleMode }) => {
  const {
    register,
    handleSubmit,
    resetForm,
    errors,
    isValid,
    isLoading,
    getFieldError,
    isFieldTouched,
  } = useAuthForm(isLogin);

  const handleModeToggle = () => {
    resetForm();
    onToggleMode();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name field - only for registration */}
          {!isLogin && (
            <FormInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              error={getFieldError('name')}
              touched={isFieldTouched('name')}
              {...register('name')}
            />
          )}

          {/* Email field */}
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            error={getFieldError('email')}
            touched={isFieldTouched('email')}
            {...register('email')}
          />

          {/* Password field */}
          <FormInput
            label="Password"
            type="password"
            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            error={getFieldError('password')}
            touched={isFieldTouched('password')}
            helpText={!isLogin && !getFieldError('password') ? "Password must contain uppercase, lowercase, and number" : undefined}
            {...register('password')}
          />

          {/* Confirm Password field - only for registration */}
          {!isLogin && (
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={getFieldError('confirmPassword')}
              touched={isFieldTouched('confirmPassword')}
              {...register('confirmPassword')}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
          </button>
        </div>

        {/* Form validation status */}
        {!isValid && Object.keys(errors).length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-600">
              Please fix the errors above to continue
            </p>
          </div>
        )}
      </form>

      {/* Toggle between login/register */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={handleModeToggle}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
