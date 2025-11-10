import React, { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Simplified AuthProvider - authentication logic moved to useAuth hook
  return <>{children}</>;
}
