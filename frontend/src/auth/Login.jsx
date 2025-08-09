import React, { useState } from 'react';
import AuthForm from '../components/forms/AuthForm';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to Mini LMS - Your Learning Management System
          </p>
        </div>
        
        {/* Auth Form */}
        <AuthForm 
          isLogin={isLogin} 
          onToggleMode={handleToggleMode} 
        />
      </div>
    </div>
  );
};

export default Login;