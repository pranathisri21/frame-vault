import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gallery-bg">
        <div className="text-center">
          <div className="w-16 h-16 gradient-warm rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium animate-pulse">
            <div className="w-8 h-8 bg-primary-foreground rounded-full" />
          </div>
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;