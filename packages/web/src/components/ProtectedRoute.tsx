import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ORGANIZER' | 'CUSTOMER' | 'GATEKEEPER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#2b55f5] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verificando autorização...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Determine the default fallback route based on the user's role
    const fallbackRoute =
      user.role === 'GATEKEEPER'
        ? '/gatekeeper'
        : user.role === 'CUSTOMER'
        ? '/home'
        : '/home';

    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};
