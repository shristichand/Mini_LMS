import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from './authHook';
import { loginSchema, registerSchema } from '../utils/validationSchemas';

export const useAuthForm = (isLogin = true) => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Select the appropriate schema based on form type
  const schema = isLogin ? loginSchema : registerSchema;
  
  // Default values for the form
  const defaultValues = {
    email: '',
    password: '',
    ...(isLogin ? {} : { name: '', confirmPassword: '' }),
  };

  // React Hook Form setup
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues,
  });

  const { handleSubmit, reset, formState: { errors, isValid, touchedFields } } = form;

  // Form submission handler
  const onSubmit = (data) => {
    if (isLogin) {
      loginMutation.mutate({
        email: data.email,
        password: data.password,
      }, {
        onSuccess: () => {
          navigate('/dashboard');
        }
      });
    } else {
      registerMutation.mutate({
        name: data.name,
        email: data.email,
        password: data.password,
      }, {
        onSuccess: () => {
          navigate('/dashboard');
        }
      });
    }
  };

  // Reset form when switching between login/register
  const resetForm = () => {
    reset(defaultValues);
  };

  // Loading state
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  // Form validation helpers
  const getFieldError = (fieldName) => errors[fieldName]?.message;
  const isFieldTouched = (fieldName) => touchedFields[fieldName];
  const hasFieldError = (fieldName) => Boolean(errors[fieldName]);

  return {
    // Form methods
    ...form,
    handleSubmit: handleSubmit(onSubmit),
    resetForm,
    
    // Form state
    errors,
    isValid,
    touchedFields,
    isLoading,
    
    // Mutation states
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    
    // Helper functions
    getFieldError,
    isFieldTouched,
    hasFieldError,
    
    // Mutations (for advanced usage)
    loginMutation,
    registerMutation,
  };
};
