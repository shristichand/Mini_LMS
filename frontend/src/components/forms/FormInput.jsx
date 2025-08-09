import React, { forwardRef } from 'react';

const FormInput = forwardRef(({
  label,
  error,
  touched,
  type = 'text',
  placeholder,
  helpText,
  className = '',
  ...props
}, ref) => {
  // Helper function to get input classes with error states
  const getInputClasses = () => {
    const baseClasses = "mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors";
    
    if (error) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    } else if (touched && !error) {
      return `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-indigo-500 focus:border-indigo-500`;
    }
  };

  const inputId = props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={getInputClasses()}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p 
          id={`${inputId}-help`}
          className="mt-1 text-xs text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
