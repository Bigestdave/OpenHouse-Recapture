import React, { useState, useEffect } from 'react';
import { AuthScreen } from '../screens/AuthScreen';
import { isDemoMode } from '../lib/runtime';
import { useAuth } from '../lib/auth';
import { syncWithSupabase } from '../data/store';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const auth = useAuth();
  // Directly read localStorage — no async, no loading spinner, no Supabase dependency
  const [isAuthed, setIsAuthed] = useState(
    () => isDemoMode && !!localStorage.getItem('openhouse_current_user')
  );

  useEffect(() => {
    const refresh = () => {
      setIsAuthed(isDemoMode && !!localStorage.getItem('openhouse_current_user'));
    };
    window.addEventListener('auth_state_changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('auth_state_changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  // The store may initialise before Supabase has restored a persisted session.
  // In production, refresh it after authentication so an existing workspace
  // is not mistaken for a new account with no data.
  useEffect(() => {
    if (isDemoMode || !auth.session) return;
    void syncWithSupabase().catch((error) => {
      console.warn('Could not refresh the production workspace after sign-in.', error);
    });
  }, [auth.session]);

  if (!isDemoMode) {
    if (auth.loading) return <div className="min-h-screen bg-canvas" aria-busy="true" />;
    if (!auth.session) return <AuthScreen />;
    return <>{children}</>;
  }
  if (!isAuthed) return <AuthScreen />;
  return <>{children}</>;
}

