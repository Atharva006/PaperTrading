import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      // Check if user authenticated via guest/demo session flag
      const hasLocalAuth =
        typeof window !== 'undefined' &&
        localStorage.getItem('tradeedge_auth_logged_in') === 'true';

      if (!isSupabaseConfigured) {
        if (active) setIsAuthenticated(hasLocalAuth);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (session?.user || hasLocalAuth) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        if (active) {
          setIsAuthenticated(hasLocalAuth);
        }
      }
    };

    checkAuth();

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          const hasLocalAuth =
            typeof window !== 'undefined' &&
            localStorage.getItem('tradeedge_auth_logged_in') === 'true';
          setIsAuthenticated(hasLocalAuth);
        }
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, []);

  // Display institutional loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B1424] flex flex-col items-center justify-center text-[#F5F5F2] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F192B] border border-[rgba(198,161,91,0.35)] flex items-center justify-center p-2 shadow-lg shadow-[#C6A15B]/10">
            <img src="/cendrix-logo.png" alt="Cendrix Capital" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6A15B]">
            <Loader2 className="w-4 h-4 animate-spin text-[#C6A15B]" />
            <span>AUTHENTICATING DESK SESSION...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect directly to login, saving destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
